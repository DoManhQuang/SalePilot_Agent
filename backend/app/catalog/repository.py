"""Product access layer.

MongoDB is the primary source of truth. Products are loaded once into an
in-memory list so the (synchronous) ranking engine can iterate quickly; the
cache is refreshed on demand. If MongoDB is unreachable, the repository falls
back to a JSON snapshot written by the importer so the offline agent path and
tests keep working without a running database.
"""

from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Any

from app.config import get_settings

_LOCK = threading.Lock()
_CACHE: list[dict[str, Any]] = []
_LOADED = False
_SOURCE = "unloaded"
_DISTINCT_CATS: list[dict[str, Any]] | None = None


def _snapshot_path() -> Path:
    settings = get_settings()
    path = Path(settings.catalog_snapshot)
    if not path.is_absolute():
        # Anchor relative paths at the backend/ root (parents[2] of this file).
        path = Path(__file__).resolve().parents[2] / path
    return path


def mongo_client(timeout_ms: int = 2000):
    """Create a pymongo client (raises if pymongo missing / server down)."""
    from pymongo import MongoClient

    settings = get_settings()
    client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=timeout_ms)
    client.admin.command("ping")  # fail fast if the server is unreachable
    return client


def _load_from_mongo() -> list[dict[str, Any]] | None:
    try:
        settings = get_settings()
        client = mongo_client()
        coll = client[settings.mongodb_db][settings.mongodb_products_collection]
        docs = list(coll.find({}, {"_id": 0}))
        client.close()
        return docs or None
    except Exception:
        return None


def _pg_row_to_doc(row: Any) -> dict[str, Any]:
    """Rebuild the document shape the ranking engine expects from a SQL row."""
    return {
        "sku": row.sku,
        "model_code": row.model_code,
        "product_id_web": row.product_id_web,
        "category_code": row.category_code,
        "category": row.category_slug,
        "category_display": row.category_display,
        "brand": row.brand,
        "brand_id": None,
        "price_original_vnd": row.price_original_vnd,
        "price_sale_vnd": row.price_sale_vnd,
        "price_vnd": row.price_vnd,
        "has_current_price": bool(row.has_current_price),
        "gift_promotion": row.gift_promotion,
        "outstanding": row.outstanding,
        "rating": row.rating,
        "sold": row.sold,
        "warranty": row.warranty,
        "accessories": row.accessories,
        "color": row.color,
        "image_url": row.image_url,
        "url": row.url,
        "online_only": bool(row.online_only),
        "name": row.name,
        "description": row.description,
        "search_text": row.search_text,
        "norm": row.norm or {},
        "specs": row.specs or {},
        "source": row.source or "postgres",
    }


def _load_from_postgres() -> list[dict[str, Any]] | None:
    try:
        from sqlalchemy import select

        from app.db.sync import SyncSession
        from app.models.entities import CatalogProduct

        with SyncSession() as session:
            rows = session.execute(select(CatalogProduct)).scalars().all()
        return [_pg_row_to_doc(r) for r in rows] or None
    except Exception:
        return None


def _load_from_snapshot() -> list[dict[str, Any]]:
    path = _snapshot_path()
    if not path.exists():
        return []
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        return payload if isinstance(payload, list) else []
    except Exception:
        return []


_LOADERS = {
    "postgres": _load_from_postgres,
    "mongodb": _load_from_mongo,
    "snapshot": lambda: (_load_from_snapshot() or None),
}
_FALLBACK_ORDER = {
    "postgres": ("postgres", "mongodb", "snapshot"),
    "mongodb": ("mongodb", "postgres", "snapshot"),
    "snapshot": ("snapshot",),
}


def load(force: bool = False) -> int:
    """Populate the in-memory cache from PostgreSQL (primary), falling back to
    MongoDB then the JSON snapshot. Returns the number of products loaded."""
    global _LOADED, _CACHE, _SOURCE, _DISTINCT_CATS
    with _LOCK:
        if _LOADED and not force:
            return len(_CACHE)
        backend = get_settings().catalog_backend
        order = _FALLBACK_ORDER.get(backend, _FALLBACK_ORDER["postgres"])
        docs: list[dict[str, Any]] | None = None
        source = "empty"
        for name in order:
            docs = _LOADERS[name]()
            if docs:
                source = name
                break
        _CACHE, _SOURCE = (docs or []), source
        _LOADED = True
        _DISTINCT_CATS = None
        return len(_CACHE)


def reload() -> int:
    return load(force=True)


def source() -> str:
    return _SOURCE


def all_products() -> list[dict[str, Any]]:
    if not _LOADED:
        load()
    return _CACHE


def by_category(ref: str | int) -> list[dict[str, Any]]:
    from app.catalog.categories import get_category

    cat = get_category(ref)
    if cat is None:
        return []
    return [p for p in all_products() if int(p.get("category_code") or 0) == cat.code]


def get(sku: str) -> dict[str, Any] | None:
    target = str(sku).strip()
    for product in all_products():
        if str(product.get("sku") or "").strip() == target:
            return product
    return None


def brands(ref: str | int) -> list[str]:
    seen = {
        str(p.get("brand")).strip()
        for p in by_category(ref)
        if p.get("brand")
    }
    return sorted(seen)


def category_counts() -> dict[str, dict[str, Any]]:
    """Per-category totals and priced counts, for dashboards / health.

    Uses the category fields stored on each document, so every family in the
    catalog is reported — the deeply-configured ones and the long-tail
    generic ones alike (deep families are flagged ``deep=True``).
    """
    from app.catalog.categories import BY_CODE

    out: dict[str, dict[str, Any]] = {}
    for product in all_products():
        slug = str(product.get("category") or "khac")
        code = int(product.get("category_code") or 0)
        entry = out.setdefault(
            slug,
            {
                "slug": slug,
                "display": product.get("category_display") or slug,
                "code": code,
                "total": 0,
                "priced": 0,
                "deep": code in BY_CODE,
            },
        )
        entry["total"] += 1
        if product.get("has_current_price"):
            entry["priced"] += 1
    return out


def distinct_categories() -> list[dict[str, Any]]:
    """Distinct ``{code, slug, display}`` triples present in the catalog.

    Cached until the next :func:`reload`; used to build generic categories for
    the long-tail families the registry does not deeply configure.
    """
    global _DISTINCT_CATS
    if _DISTINCT_CATS is None:
        seen: dict[int, dict[str, Any]] = {}
        for product in all_products():
            code = int(product.get("category_code") or 0)
            if code and code not in seen:
                seen[code] = {
                    "code": code,
                    "slug": str(product.get("category") or "khac"),
                    "display": product.get("category_display") or str(product.get("category") or "khac"),
                }
        _DISTINCT_CATS = list(seen.values())
    return _DISTINCT_CATS


def save_snapshot(products: list[dict[str, Any]]) -> Path:
    path = _snapshot_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path
