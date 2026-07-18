"""ETL: transform the catalog + knowledge base into normalized PostgreSQL.

Reads the catalog documents (from the JSON snapshot by default, or MongoDB) and
the policy KB (``data/faq.json``), then (re)loads four relational tables:

    categories       one row per product family (deep vs generic, counts)
    products         one row per SKU (prices, rating, sold, promo, JSON specs)
    product_specs    fully-normalized EAV: one row per (sku, spec_key)
    kb_docs          policy / FAQ chunks

Finally it grants read-only SELECT on these tables to the ``web_anon`` role so
PostgREST can expose them (CRM tables are never granted). MongoDB is left
untouched — it remains the secondary catalog store.

Usage (from backend/):
    python -m scripts.etl_to_postgres                 # from data/catalog_snapshot.json
    python -m scripts.etl_to_postgres --source mongo  # read catalog from MongoDB
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any

from sqlalchemy import delete, text

from app.catalog.categories import BY_CODE
from app.config import get_settings
from app.db.sync import SyncSession, create_all, sync_engine
from app.models.entities import CatalogProduct, Category, KbDoc, ProductSpec

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_TABLES = ("categories", "products", "product_specs", "kb_docs")


def _load_catalog(source: str) -> list[dict[str, Any]]:
    if source == "mongo":
        from app.catalog import repository
        docs = repository._load_from_mongo()  # noqa: SLF001 — intentional reuse
        if not docs:
            raise SystemExit("MongoDB returned no products.")
        return docs
    path = Path(get_settings().catalog_snapshot)
    if not path.is_absolute():
        path = ROOT / path
    if not path.exists():
        raise SystemExit(f"Snapshot not found: {path} (run import_products_detail first).")
    return json.loads(path.read_text(encoding="utf-8"))


def _load_kb() -> list[dict[str, Any]]:
    path = ROOT / "data" / "faq.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def _product_row(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "sku": str(doc.get("sku") or ""),
        "model_code": str(doc.get("model_code") or ""),
        "product_id_web": str(doc.get("product_id_web") or ""),
        "name": doc.get("name") or "",
        "brand": doc.get("brand"),
        "category_code": int(doc.get("category_code") or 0),
        "category_slug": doc.get("category") or "",
        "category_display": doc.get("category_display") or "",
        "price_original_vnd": doc.get("price_original_vnd"),
        "price_sale_vnd": doc.get("price_sale_vnd"),
        "price_vnd": doc.get("price_vnd"),
        "has_current_price": bool(doc.get("has_current_price")),
        "gift_promotion": doc.get("gift_promotion"),
        "outstanding": doc.get("outstanding"),
        "rating": doc.get("rating"),
        "sold": doc.get("sold"),
        "warranty": doc.get("warranty"),
        "accessories": doc.get("accessories"),
        "color": doc.get("color"),
        "image_url": doc.get("image_url"),
        "url": doc.get("url"),
        "online_only": bool(doc.get("online_only")),
        "description": doc.get("description") or "",
        "search_text": doc.get("search_text") or "",
        "source": doc.get("source") or "products_detail.json",
        "norm": doc.get("norm") or {},
        "specs": doc.get("specs") or {},
    }


def _ensure_roles_and_grants() -> None:
    """Idempotently ensure the PostgREST roles exist and grant read-only access
    to the catalog/KB tables (robust even on a pre-existing volume)."""
    pw = "salepilot"
    stmts = [
        f"""DO $$ BEGIN
              IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='web_anon') THEN
                CREATE ROLE web_anon NOLOGIN; END IF;
              IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='authenticator') THEN
                CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD '{pw}'; END IF;
            END $$;""",
        "GRANT web_anon TO authenticator",
        "GRANT USAGE ON SCHEMA public TO web_anon",
    ]
    for tbl in PUBLIC_TABLES:
        stmts.append(f"GRANT SELECT ON {tbl} TO web_anon")
    with sync_engine.begin() as conn:
        for s in stmts:
            try:
                conn.execute(text(s))
            except Exception as exc:  # pragma: no cover
                print(f"  ! grant skipped: {exc}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", choices=["snapshot", "mongo"], default="snapshot")
    args = parser.parse_args()

    print("Creating tables (if missing) ...")
    create_all()

    docs = _load_catalog(args.source)
    print(f"Loaded {len(docs)} catalog docs from {args.source}.")

    # Categories.
    cat_counts: Counter[int] = Counter(int(d.get("category_code") or 0) for d in docs)
    cat_meta: dict[int, dict[str, Any]] = {}
    for d in docs:
        code = int(d.get("category_code") or 0)
        cat_meta.setdefault(code, {"slug": d.get("category") or "", "display": d.get("category_display") or ""})
    category_rows = [
        {
            "code": code,
            "slug": meta["slug"],
            "display": meta["display"],
            "is_deep": code in BY_CODE,
            "product_count": cat_counts[code],
        }
        for code, meta in cat_meta.items()
    ]

    # Products + EAV specs.
    product_rows = [_product_row(d) for d in docs]
    spec_rows: list[dict[str, Any]] = []
    for d in docs:
        code = int(d.get("category_code") or 0)
        for key, value in (d.get("specs") or {}).items():
            if value in (None, ""):
                continue
            spec_rows.append(
                {"sku": str(d.get("sku")), "category_code": code, "spec_key": str(key)[:128], "spec_value": str(value)}
            )

    kb_rows = [
        {"id": k["id"], "topic": k.get("topic", ""), "question": k.get("question", ""),
         "answer": k.get("answer", ""), "source": k.get("source", "")}
        for k in _load_kb()
    ]

    with SyncSession() as s:
        s.execute(delete(ProductSpec))
        s.execute(delete(CatalogProduct))
        s.execute(delete(Category))
        s.execute(delete(KbDoc))
        s.commit()
        s.bulk_insert_mappings(Category, category_rows)
        s.bulk_insert_mappings(CatalogProduct, product_rows)
        for start in range(0, len(spec_rows), 5000):
            s.bulk_insert_mappings(ProductSpec, spec_rows[start : start + 5000])
        s.bulk_insert_mappings(KbDoc, kb_rows)
        s.commit()

    _ensure_roles_and_grants()

    deep = sum(1 for c in category_rows if c["is_deep"])
    print(
        f"\nPostgreSQL loaded:\n"
        f"  categories    : {len(category_rows)} ({deep} deep, {len(category_rows) - deep} generic)\n"
        f"  products      : {len(product_rows)}\n"
        f"  product_specs : {len(spec_rows)} (EAV rows)\n"
        f"  kb_docs       : {len(kb_rows)}\n"
        f"PostgREST read access granted to web_anon on: {', '.join(PUBLIC_TABLES)}"
    )


if __name__ == "__main__":
    main()
