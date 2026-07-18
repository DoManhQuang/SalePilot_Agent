# Architecture — SalePilot × Điện Máy Xanh

## Product

AI **so sánh & tư vấn điện máy – công nghệ theo nhu cầu thật** trên 14 ngành hàng:
need discovery theo ngành → catalog rank → trade-off → top 3.
Guardrail: numbers only from tools; never infer stock.

## Modules

| Module | Role |
|--------|------|
| **Lead** | `delegate` / `finalize` + need loop (nhận diện ngành + hỏi ngược) |
| **Catalog domain** | `list_categories`, `search`, `compare`, `recommend_top3` — category-aware |
| **Category registry** | `app/catalog/categories.py` — rule sâu từng ngành dạng khai báo (aliases, specs chuẩn hóa, need slots + câu hỏi, priorities, trade-offs) |
| **Repository** | `app/catalog/repository.py` — MongoDB primary, in-memory cache, snapshot fallback |
| **Knowledge** | FAQ policy |
| **CRM / Escalation** | lead + human handoff |
| **Channel bus** | web (+ Zalo stub) via gateway |

## Critical path

User → gateway → run_agent (or offline) → detect category → catalog/knowledge tools → Vietnamese reply

## Data

- **MongoDB `salepilot.products`** — nguồn chính: 8.746 SKU, 14 ngành (`category_code` 30/36/38/39/40/41/49/72/73/75/115/116/137/139)
- `scripts/import_spec_catalog.py` — importer đọc `Spec_cate_gia.xlsx`, chuẩn hóa qua registry, upsert Mongo + ghi snapshot
- `data/catalog_snapshot.json` — fallback offline khi Mongo tắt
- `data/faq.json` — guidance + giới hạn nguồn (không có tồn kho)
- `data/need_scenarios.json` — tình huống nhu cầu mẫu

## Document shape (MongoDB)

```json
{
  "sku": "...", "category": "may_lanh", "category_code": 36,
  "brand": "...", "name": "<derived>",
  "price_original_vnd": 0, "price_sale_vnd": 0, "price_vnd": 0,
  "has_current_price": true, "gift_promotion": "...",
  "norm": { "<spec chuẩn hóa theo ngành: area_min/max, noise_db, load_kg, ram_gb...>" },
  "specs": { "<cột gốc tiếng Việt>" },
  "search_text": "...", "source": "spec_cate_gia.xlsx:<sheet>", "source_row": 2
}
```

## Thêm ngành hàng mới

1 config `Category(...)` mới trong `app/catalog/categories.py` (aliases, specs, slots, priorities, tradeoffs) → chạy lại importer. Engine, tools, API, offline path tự nhận.
