# Session Handoff — SalePilot

## Verified Now

- What is currently working: offline multi-agent chat path (catalog+knowledge tools); `/health` + `/chat` HTTP; seed products/leads
- What verification actually ran: `scripts/verify.sh` / offline `run_agent`; HTTP chat smoke

## Changed This Session

- Code or behavior added: full scaffold + harness pack
- Infrastructure or harness changes: `AGENTS.md`, `feature_list.json`, `init.sh`, `claude-progress.md`, checklists

## Broken Or Unverified

- Known defect: offline product search may return related categories with sofa keyword
- Unverified path: frontend browser e2e, production deploy
- Risk for the next session: marking UI features `passing` without browser evidence

## Next Best Step

- Highest-priority unfinished feature: `dash-001` or `verify-001`
- Why it is next: closes feedback loop / demo polish
- What counts as passing: evidence in `feature_list.json`
- What must not change during that step: multi-agent graph contracts (`delegate`/`finalize`)

## Commands

- Startup: `./init.sh`
- Verification: `./scripts/verify.sh`
- Focused debug: `cd backend && source .venv/bin/activate && python -m scripts.simulate_zalo`
