# Progress Log — SalePilot

## Current Verified State

- Repository root: `/home/hoang/SalePilot_Agent`
- Catalog: **MongoDB (Docker) là nguồn chính** — 8.746 SKU / 14 ngành hàng từ `Spec_cate_gia.xlsx`; fallback `backend/data/catalog_snapshot.json`
- Standard startup path: `docker compose up -d mongo` → `python -m scripts.import_spec_catalog` → backend `uvicorn` + frontend `npm run dev`
- Standard verification path: `./scripts/verify.sh` (đa ngành + MCP)
- Current highest-priority unfinished feature: `dash-001` (dashboard browser evidence)
- Current blocker: none

## Session Log

### Session 001

- Date: 2026-07-17
- Goal: Scaffold multi-agent SalePilot base for VAIC SME track (CSKH/Sales + Zalo stub)
- Completed:
  - Backend Lead + sub-agents, tools, offline multi-agent path
  - API chat/leads/products/outbox/zalo webhook
  - Frontend home/chat/dashboard
  - Seed data (products/FAQ), docs
  - Harness pack (AGENTS.md, feature_list, init, progress)
- Verification run:
  - `python -m scripts.seed_db` + `ingest_kb`
  - Offline `run_agent` with catalog+knowledge tools
  - HTTP `/health` + `/chat` smoke
- Evidence captured:
  - Historical base scaffold chat returned a furniture demo reply; current product domain is refrigerator category_code=38.
- Commits: (none required yet)
- Files or artifacts updated: entire scaffold under `backend/`, `frontend/`, `docs/`
- Known risk or unresolved issue:
  - Historical base scaffold catalog search was generic; current refrigerator verification is recorded in Session 005.
  - No automated pytest suite yet (`verify-001`)
  - Frontend not e2e tested in headless browser this session
- Next best step: mark chat/multi-agent features with evidence; implement `verify-001` pytest smoke or `deploy-001` when ready

### Session 002

- Date: 2026-07-17
- Goal: Nested AGENTS context + skill catalog wiring (host-agnostic patterns)
- Completed:
  - Progressive context: `backend/AGENTS.md`, `frontend/AGENTS.md`
  - Product skill registry loads `skills/*/SKILL.md` into Lead prompt
  - Removed third-party agent product branding from docs
- Verification run: `./scripts/verify.sh` after skill loader change
- Next best step: deploy or browser e2e

### Session 003

- Date: 2026-07-17
- Goal: Super-agent core into product runtime (memory, skills activate, parallel, gateway, sandbox, fetch, scheduler, trajectory)
- Completed: modules under agent/memory, skills tools+writer, sandbox, web, trajectory, gateway, scheduler; APIs /memory /runs /jobs; dashboard panels; verify extended
- Verification run: `./scripts/verify.sh` PASS (agents, memory phone, sandbox deny, trajectory run_id)
- Next best step: `deploy-001` or UI browser evidence

### Session 004

- Date: 2026-07-17
- Goal: Add a local TypeScript stdio MCP server and backend contract for SalePilot.
- Branch: `feature/salepilot-mcp` (derived from `feature/product-advisor-dmx`; `main` and `dev` remain base-only).
- Completed:
  - Added FastAPI `/mcp` catalog, comparison, recommendation, FAQ, and consent-gated lead endpoints.
  - Extracted shared CRM lead persistence so the agent tool and MCP endpoint use the same write path.
  - Added `mcp/` TypeScript server using the stable MCP SDK v1, Zod schemas, structured output, pagination, timeouts, and actionable errors.
  - Added six tools: product search/detail/compare/recommendation, FAQ search, and explicit-consent lead creation.
  - Added `mcp/README.md`, ten read-only `mcp/evaluations.xml` cases, and a backend API contract smoke.
- Verification run:
  - `./scripts/verify.sh` PASS, including MCP endpoint smoke and protected lead write check.
  - `cd mcp && npm run build && SALEPILOT_API_BASE_URL=http://127.0.0.1:8000 npm run smoke` PASS (six tools).
  - Isolated SQLite backend with matching write tokens: positive lead creation smoke PASS.
  - `cd mcp && npm audit --omit=dev` reports `found 0 vulnerabilities`.
- Known risk or unresolved issue:
  - Lead creation is intentionally unavailable until a unique `MCP_WRITE_TOKEN` is configured in the backend and passed as `SALEPILOT_MCP_WRITE_TOKEN` to the local client.
- Next best step: configure a local MCP client using `mcp/README.md`, or record frontend browser evidence for `dash-001`.

### Session 005

- Date: 2026-07-17
- Goal: Migrate SalePilot from AC/base demo catalog to the supplied Google Sheet refrigerator tab.
- Branch: `feature/refrigerator-catalog` (derived from `feature/salepilot-mcp`; `main` and `dev` remain base-only).
- Completed:
  - Imported the public `Tủ Lạnh` sheet (`gid=1924624295`, `category_code=38`) into `backend/data/products.json`.
  - Added deterministic importer `backend/scripts/import_refrigerators.py` and source contract doc `backend/data/PRODUCT_SOURCE.md`.
  - Reworked catalog search, compare, need extraction, recommendations, order drafts, MCP API/client, offline agent, prompts, FAQ, frontend copy, and docs for refrigerators.
  - Preserved all 1,692 SKUs as searchable data; recommendation uses only the 252 rows with current price.
  - Added guardrails for absent source stock: no stock claims, stock questions route to FAQ/knowledge.
  - Fixed review findings: hard budgets are enforced, unaccented budget text and decimal dimensions parse, equal price rows are not treated as discounts, external-water search works, order qty is validated, `/products` invalid pagination returns 422, and frontend session IDs are per browser session without hydration mismatch.
- Verification run:
  - `python -m scripts.import_refrigerators` PASS; snapshot SHA-256 `e4a8df9d43e33b058fb68d322ab7ff40b0c0318b775518f0bfc0c55f132e9b2a`.
  - `./scripts/verify.sh` PASS with refrigerator, hard-budget, stock FAQ, order-validation, memory, sandbox, and MCP API checks.
  - `./init.sh` PASS after the migration.
  - `cd frontend && npm run build` PASS.
  - `cd mcp && npm run build && SALEPILOT_API_BASE_URL=http://127.0.0.1:8000 npm run smoke && npm audit --omit=dev` PASS.
  - Browser `/chat` desktop/mobile verified with console clean, `POST /chat` 200, top-3 refrigerator reply, and Agent Trace visible. Screenshots: `/tmp/opencode/salepilot-refrigerator-chat.png`, `/tmp/opencode/salepilot-refrigerator-chat-mobile.png`.
- Known risk or unresolved issue:
  - The source sheet has no stock column and no product-name column; display names are derived and stock must be checked outside SalePilot.
  - `mcp/evaluations.xml` answers are tied to the checked-in snapshot; rerun/update evaluations if the sheet snapshot changes.
- Next best step: commit and push `feature/refrigerator-catalog`, then resume `dash-001` browser evidence or deployment work.

### Session 006

- Date: 2026-07-17
- Goal: MongoDB trong Docker làm nguồn catalog chính; mở rộng agent từ tủ lạnh sang **14 ngành hàng** (`Spec_cate_gia.xlsx`).
- Completed:
  - `docker-compose.yml`: service `mongo:7` (auth salepilot/salepilot, healthcheck, volume `mongo_data`); backend nhận `MONGODB_URI/MONGODB_DB`.
  - Package mới `backend/app/catalog/`: `normalize.py` (parser tiếng Việt: giá, m², dB min, kg, people-range...), `categories.py` (**registry rule sâu 14 ngành**: aliases nhận diện, specs chuẩn hóa, need slots + câu hỏi ngược, priorities, trade-offs), `repository.py` (Mongo primary → in-memory cache → snapshot fallback).
  - `scripts/import_spec_catalog.py`: đọc 14 sheet Excel → chuẩn hóa qua registry → upsert Mongo (indexes sku/category/brand/price) + ghi `data/catalog_snapshot.json`; xóa SKU không còn trong nguồn.
  - `catalog_domain.py` viết lại thành engine category-aware, giữ nguyên chữ ký cũ (search/compare/recommend_top3/recommendation_need/extract_need_from_text) + thêm `category` param, dedup model màu, preferred_styles back-compat.
  - Wiring: tools catalog (thêm `list_categories`, category+free_text), prompts đa ngành, offline path đa ngành, `/products` + `/products/categories`, MCP API (category param, back-compat), main.py warm cache + health catalog info, seed_db bỏ phụ thuộc products.json.
  - Fix memory extractor bắt nhầm "20m2" thành budget 20tr (dùng chung `_extract_budget` + `detect_category`).
  - Frontend chat: chips + welcome đa ngành.
  - `verify.sh` + `verify_mcp.py` viết lại cho đa ngành (giữ regression tủ lạnh).
- Verification run:
  - Import: TOTAL 8746 products / 14 categories vào Mongo (`tu_lanh` 1692/252 priced — khớp số cũ).
  - `./scripts/verify.sh` PASS: source=mongodb, fridge top3 khớp evidence cũ `[1751097000066, 1751097000058, 1751097000065]`, rules may_lanh/may_giat/dong_ho/may_tinh_bang/may_nuoc_nong, offline chat, memory, sandbox, stock guardrail, MCP đa ngành.
  - Fallback: MONGODB_URI sai cổng → source=snapshot, 8746 SKU, recommend chạy bình thường.
  - HTTP smoke: `/health` (catalog mongodb/8746/14), `/chat` top-3 máy lạnh + đồng hồ + hỏi ngược tủ lạnh, `/products/categories`.
- Known risk or unresolved issue:
  - `mcp/` TypeScript client chưa có tham số `category` trong tool schema (backend đã hỗ trợ, back-compat OK; nên bổ sung khi chạm vào mcp/).
  - `backend/data/products.json` cũ (fridge-only) còn trên đĩa nhưng không còn được import; `scripts/import_refrigerators.py` giữ lại để tham khảo.
  - Frontend `npm run build` chưa chạy lại sau khi đổi copy (chỉ đổi string, rủi ro thấp).
- Next best step: bổ sung `category` vào mcp/ client + evaluations; hoặc `dash-001`/`deploy-001`.

### Session 006 — addendum: Docker full-stack build & run

- Date: 2026-07-18
- Added `backend/.dockerignore` (loại `.venv` 554MB, chroma, *.db, trajectories) và `frontend/.dockerignore` (node_modules, .next).
- `docker compose up --build -d` PASS: 3 container Up — mongo (healthy) + backend :8000 + frontend :3000.
- Evidence:
  - Backend log: `seed_db done` → `[catalog] loaded 8746 products from mongodb` → Uvicorn running (kết nối Mongo qua hostname `mongo` trong compose network).
  - `curl :8000/health` → `catalog: {source: mongodb, products: 8746, categories: 14}`.
  - `POST :8000/chat` máy giặt 9kg cửa trước có sấy → top-3 đúng ngành + ngân sách; "Tư vấn tủ lạnh" → hỏi ngược 2 slot.
  - `curl :3000/chat` HTTP 200, render copy đa ngành mới ("Tư vấn điện máy & công nghệ" + chips máy lạnh/đồng hồ).

### Session 006 — fix: multi-turn need accumulation (offline path)

- Date: 2026-07-18
- Bug (từ screenshot người dùng): "tôi muốn mua 1 chiếc PC" → hỏi ngân sách đúng; trả lời "giá khoảng 10tr" → rơi về câu chào mặc định vì offline path xử lý từng câu độc lập, không kế thừa context.
- Fix:
  - `memory/store.py`: profile thêm key `need`; hàm `load_need`/`save_need` lưu need tích lũy per (channel, external_id).
  - `catalog_domain.merge_needs`: câu mới ghi đè slot cũ; đổi ngành → reset slot ngành cũ nhưng giữ `budget_vnd`; priorities union.
  - `offline.py`: merge stored+extracted need mỗi lượt, `follow_up` signal (đã có category lưu + câu mới có slot) kích hoạt catalog, persist need sau mỗi lượt product.
- Verification:
  - verify.sh thêm regression "PC → budget → switch to monitor": PASS toàn bộ.
  - Docker backend rebuild; HTTP repro đúng kịch bản screenshot: turn 2 "giá khoảng 10tr" → top 3 PC ≤10tr; turn 3 đổi sang màn hình giữ ngân sách.

### Session 006 — fix: unsupported-category guardrail + negation

- Date: 2026-07-18
- Bug (screenshot 2): "tư vấn laptop giá khoảng 20tr" → engine mặc định `shop_category=tu_lanh` khi không nhận diện được ngành → hỏi câu tủ lạnh; "lap tôi ko phải tủ lạnh" → match từ khóa "tủ lạnh" bất chấp phủ định, lưu nhầm `quan_tâm=tủ lạnh`.
- Fix:
  - `categories.py`: `_NEGATION` regex (không/ko/chẳng + phải/cần/mua; "chưa" loại trừ vì "chưa có tủ lạnh" = muốn mua); `detect_category` bỏ qua mention bị phủ định; `detect_negated_categories`; `UNSUPPORTED_TERMS` (laptop, điện thoại, tivi, tai nghe, loa, máy ảnh, quạt, bếp, lò vi sóng, máy lọc nước, máy hút bụi, nồi...) + gợi ý ngành gần nhất; `detect_unsupported`.
  - `catalog_domain.recommend_top3`: **bỏ fallback shop_category** — không rõ ngành → hỏi lại kèm danh sách 14 ngành.
  - `api/mcp.py`: recommendation không truyền category → mặc định `tu_lanh` tường minh (legacy contract).
  - `offline.py`: guardrail trung thực khi gặp ngành chưa hỗ trợ ("em không đoán bừa thông số/giá"); khách phủ định ngành đã lưu → xóa khỏi need; need thiếu budget → kế thừa từ memory profile.
- Verification: verify.sh thêm regression laptop guardrail + negation; full PASS; Docker rebuild; HTTP 3-turn repro: laptop → guardrail + gợi ý PC/tablet; "ko phải tủ lạnh" → không lưu nhầm memory; "vậy xem máy tính để bàn đi" → top 3 PC ≤20tr (budget kế thừa từ turn 1).
