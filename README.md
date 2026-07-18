# SalePilot — Multi-Agent SME Sales (VAIC 2026)

**SalePilot** — multi-agent AI **so sánh & tư vấn điện máy – công nghệ theo nhu cầu thật** trên **14 ngành hàng** (8.746 SKU) từ `Spec_cate_gia.xlsx`, lưu trong **MongoDB** (VAIC · Điện Máy Xanh · Năng suất SME).

**Stack:** FastAPI + LangGraph · MongoDB (Docker) · Next.js · category-aware engine (need slots / rank / compare / top3) · memory · dashboard

## Architecture (short)

```
Web chat → Lead Agent
             ├─ Catalog (list_categories / search / compare / recommend_top3)
             │    └─ MongoDB catalog (14 ngành, registry rule sâu từng ngành)
             ├─ Knowledge (FAQ chính sách + giới hạn nguồn)
             ├─ CRM (SĐT / lead)
             └─ Escalation (người)
```

Need loop theo ngành: tủ lạnh (số người + dung tích + kích thước), máy lạnh (m² phòng), máy giặt/sấy (kg tải), đồng hồ (nghe gọi/SIM/pin), PC/tablet/màn hình (cấu hình)… + ngân sách → top 3 + trade-off. Nguồn không có cột tồn kho nên SalePilot không bao giờ khẳng định còn hàng.

**Ngành hàng:** tu_lanh · may_lanh · may_giat · may_say · may_rua_chen · tu_dong · may_nuoc_nong · dong_ho · may_tinh_de_ban · man_hinh · may_in · may_tinh_bang · micro_karaoke · micro_thu_am

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## Local MCP server

`mcp/` contains the local stdio SalePilot MCP server for catalog search, comparison, top-3 recommendations, FAQ lookup, and consent-gated CRM lead creation. See [mcp/README.md](mcp/README.md).

## Agent harness

This repo includes a **coding-agent harness** (instructions · tools · environment · state · feedback):

| File | Purpose |
|------|---------|
| `AGENTS.md` | Operating rules for coding agents |
| `feature_list.json` | Feature tracker + evidence |
| `claude-progress.md` | Session log / verified state |
| `init.sh` | Install + baseline verify |
| `scripts/verify.sh` | Offline multi-agent smoke |
| `session-handoff.md` / `clean-state-checklist.md` | Session close-out |
| `docs/HARNESS.md` | Map + patterns + lecture links |
| `backend/AGENTS.md` / `frontend/AGENTS.md` | Progressive context (subdir maps) |

Pattern from [Learn Harness Engineering](https://walkinglabs.github.io/learn-harness-engineering/en/).

## Quick start

```bash
cp .env.example .env
# optional: OPENAI_API_KEY

# 1) MongoDB (catalog store)
docker compose up -d mongo

# 2) Import 14 ngành hàng từ Excel vào MongoDB (+ snapshot fallback)
cd backend && source .venv/bin/activate  # or python3 -m venv .venv && pip install -r requirements.txt
python -m scripts.import_spec_catalog --excel ../Spec_cate_gia.xlsx
python -m scripts.seed_db && python -m scripts.ingest_kb
uvicorn app.main:app --reload --port 8000

# Terminal B
cd frontend && npm install && npm run dev
```

> Không có MongoDB? Engine tự fallback sang `backend/data/catalog_snapshot.json`
> (được importer ghi kèm) — offline path và verify vẫn chạy.

Open http://localhost:3000 → **Tư vấn**

```bash
# from repo root
./scripts/verify.sh
```

### Docker

```bash
cp .env.example .env
docker compose up --build
```

### Simulate Zalo

```bash
# backend running on :8000
cd backend && source .venv/bin/activate
python -m scripts.simulate_zalo --text "Gia đình 4 người cần tủ lạnh dưới 15 triệu, ngang tối đa 70 cm"
```

## Demo script

See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## VAIC deliverables checklist

- [ ] Presentation slides  
- [ ] Demo video ≤ 5 min  
- [ ] Public GitHub  
- [ ] Live deployed URL  
- [ ] Project description  
- [ ] AI collaboration log  

## License

MIT — hackathon scaffold.
