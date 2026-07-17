# Progress Log — SalePilot

## Current Verified State

- Repository root: `/home/vananh/Homeworks/hackathon_base`
- Standard startup path: `./init.sh` then backend `uvicorn` + frontend `npm run dev`
- Standard verification path: `./scripts/verify.sh`
- Current highest-priority unfinished feature: `dash-001` (dashboard browser evidence)
- Current blocker: none for local super-core smoke

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
  - Chat returns sofa under 15tr + ship FAQ; agents `lead,catalog,knowledge`
- Commits: (none required yet)
- Files or artifacts updated: entire scaffold under `backend/`, `frontend/`, `docs/`
- Known risk or unresolved issue:
  - Offline catalog filter can surface non-sofa items in keyword search
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
