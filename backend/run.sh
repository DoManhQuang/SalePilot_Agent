#!/usr/bin/env bash
# Chạy backend local (hot-reload): uvicorn --reload :8000 · DB Neon/Atlas (.env) · catalog snapshot.
cd "$(dirname "$0")"   # để .venv/ và ../.env đúng đường dẫn dù chạy từ đâu
exec .venv/bin/python -m uvicorn app.main:app \
  --env-file ../.env --reload --reload-dir app --host 0.0.0.0 --port 8000

