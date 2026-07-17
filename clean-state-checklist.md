# Clean State Checklist

- [ ] The standard startup path still works (`./init.sh` or documented uvicorn + npm).
- [ ] The standard verification path still runs (`./scripts/verify.sh`).
- [ ] Current progress is recorded in `claude-progress.md`.
- [ ] Feature state in `feature_list.json` reflects what is actually passing versus unverified.
- [ ] No half-finished step is left undocumented.
- [ ] The next session can continue without manual repair.
- [ ] No secrets committed (`.env` gitignored).
