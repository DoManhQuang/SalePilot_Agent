# Demo — Điện Máy Xanh · SalePilot (máy lạnh)

## Setup

```bash
cd backend && source .venv/bin/activate
python -m scripts.seed_db && python -m scripts.ingest_kb
uvicorn app.main:app --reload --port 8000
# other terminal
cd frontend && npm run dev
```

## Flow 3 phút

1. **Home** — SalePilot × nhu cầu thật, top 3, không bịa  
2. **Tư vấn** — chip: “Phòng ngủ 12m2, dưới 10 triệu, muốn êm và tiết kiệm điện”  
3. Agent hỏi thêm nếu thiếu slot **hoặc** trả top 3 + trade-off + `catalog:SKU`  
4. “Bảo hành máy lạnh thế nào?” → FAQ policy  
5. “Em để SĐT 0901111222” → CRM lead  
6. **Agent Trace** — lead → catalog/knowledge  
7. **Dashboard** — lead + conversation  

## Pitch

> Không so sánh bảng spec — hiểu nhu cầu, hỏi ngược, top 3 có trade-off, mọi giá từ catalog.
