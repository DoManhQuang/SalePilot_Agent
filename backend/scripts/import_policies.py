"""Ingest Điện Máy Xanh policy documents into the knowledge base.

The real policy files (bảo hành/đổi trả, giao hàng/lắp đặt, khui hộp Apple,
xử lý dữ liệu cá nhân, điều khoản sử dụng, nội quy cửa hàng, cam kết phục vụ)
are plain-text. This script chunks each doc into retrieval-sized passages,
writes them to ``data/faq.json`` (the file the lexical ``search_faq`` reads), and
copies the raw docs into ``data/policies/`` so the knowledge base is
self-contained inside the repo/container.

Usage (from backend/):
    python -m scripts.import_policies --src /home/hoang/Downloads/Data
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DEFAULT_SRC = Path("/home/hoang/Downloads/Data")

# filename stem -> (human title, kb topic tag). Order controls entry ids.
POLICY_DOCS: dict[str, tuple[str, str]] = {
    "chinh_sach_bao_hanh_doi_tra": ("Chính sách bảo hành & đổi trả", "bao_hanh_doi_tra"),
    "chinh_sach_giao_hang_lap_dat": ("Chính sách giao hàng & lắp đặt", "giao_hang_lap_dat"),
    "chinh_sach_khui_hop_apple": ("Chính sách khui hộp sản phẩm Apple", "khui_hop_apple"),
    "chinh_sach_xu_ly_du_lieu_ca_nhan": ("Chính sách xử lý dữ liệu cá nhân", "du_lieu_ca_nhan"),
    "dieu-khoang-su-dung": ("Điều khoản sử dụng", "dieu_khoan"),
    "noi_quy_cua_hang": ("Nội quy cửa hàng", "noi_quy"),
    "chat_luong_phuc_vu": ("Cam kết chất lượng phục vụ", "phuc_vu"),
}


def chunk_text(text: str, max_chars: int = 750) -> list[str]:
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks: list[str] = []
    current = ""
    for para in paragraphs:
        if not current:
            current = para
        elif len(current) + len(para) + 2 <= max_chars:
            current = f"{current}\n\n{para}"
        else:
            chunks.append(current)
            current = para
    if current:
        chunks.append(current)
    return chunks


def build_entries(src: Path) -> list[dict]:
    entries: list[dict] = []
    policies_dir = DATA_DIR / "policies"
    policies_dir.mkdir(parents=True, exist_ok=True)

    for stem, (title, topic) in POLICY_DOCS.items():
        path = src / f"{stem}.md"
        if not path.exists():
            print(f"  ! missing {path.name}, skipped")
            continue
        shutil.copyfile(path, policies_dir / path.name)  # keep raw doc in repo
        text = path.read_text(encoding="utf-8")
        for i, chunk in enumerate(chunk_text(text), 1):
            first_line = chunk.splitlines()[0].strip()
            heading = first_line[:70] + ("…" if len(first_line) > 70 else "")
            entries.append(
                {
                    "id": f"{topic}-{i:02d}",
                    "question": f"{title} — {heading}",
                    "answer": chunk[:1400],
                    "topic": topic,
                    "source": f"policies/{path.name}",
                }
            )
        print(f"  + {title}: {sum(1 for e in entries if e['topic'] == topic)} chunks")
    return entries


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", type=Path, default=DEFAULT_SRC)
    parser.add_argument("--out", type=Path, default=DATA_DIR / "faq.json")
    args = parser.parse_args()

    if not args.src.exists():
        raise SystemExit(f"Source folder not found: {args.src}")

    print(f"Ingesting policies from {args.src} ...")
    entries = build_entries(args.src)
    if not entries:
        raise SystemExit("No policy chunks produced.")

    args.out.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nWrote {len(entries)} KB entries -> {args.out}")
    print(f"Raw docs copied -> {DATA_DIR / 'policies'}")


if __name__ == "__main__":
    main()
