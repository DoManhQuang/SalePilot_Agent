# Architecture — SalePilot × Điện Máy Xanh

## Product

AI **so sánh & tư vấn máy lạnh theo nhu cầu thật**: need discovery → catalog rank → trade-off → top 3. Guardrail: numbers only from tools.

## Modules

| Module | Role |
|--------|------|
| **Lead** | `delegate` / `finalize` + need loop |
| **Catalog domain** | `search`, `compare`, `recommend_top3` |
| **Knowledge** | FAQ policy |
| **CRM / Escalation** | lead + human handoff |
| **Channel bus** | web (+ Zalo stub) via gateway |

## Critical path

User → gateway → run_agent (or offline) → catalog/knowledge tools → Vietnamese reply

## Data

- `data/products.json` — AC SKUs  
- `data/faq.json` — install/warranty/installment  
- `data/need_scenarios.json` — test cases  
