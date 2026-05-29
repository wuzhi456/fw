# Validation suite (Protocol v2)

**Owner:** C  
**Protocol:** [`experiment-protocol-v2.md`](../../experiment-protocol-v2.md) §7.2  
**Endpoint:** A (co-primary, equal to rubric)

## Quick start

```powershell
cd FunctionWeaver

# Golden stub acceptance (Phase 1)
node experiments/validation/run-validation.mjs `
  --task task-list-page `
  --output experiments/validation/fixtures/golden-stub-list `
  --run-id golden-stub-list

node experiments/validation/run-validation.mjs `
  --task task-responsive-dashboard `
  --output experiments/validation/fixtures/golden-stub-dash `
  --run-id golden-stub-dash

# After agent run output is in experiments/runs/.../output/
node experiments/validation/run-validation.mjs `
  --task task-list-page `
  --output experiments/runs/task-list-page/baseline/rep-01/output `
  --run-id list-base-r01 `
  --group baseline `
  --rep 1
```

Results append to [`experiments/validation-results.csv`](../validation-results.csv).

## CLI behavior (frozen)

1. `npm install` in `--output` if `node_modules` missing
2. `npm run build` — failure prints `gate-build: fail` and exits 1 (Playwright not run)
3. Build pass → start `npm run preview`, run task smoke + stress checks
4. Each check prints `pass`/`fail`; rows append to `validation-results.csv`

## Layout

| Path | Purpose |
| --- | --- |
| `CHECK_CATALOG.md` | Frozen `check_id` definitions |
| `run-validation.mjs` | CLI entry |
| `check-catalog.mjs` | Shared check map |
| `playwright.config.ts` | Playwright config (`VALIDATION_BASE_URL` env) |
| `specs/` | Playwright tests per task |
| `fixtures/golden-stub-list/` | Phase 1 list-page acceptance stub |
| `fixtures/golden-stub-dash/` | Phase 1 dashboard acceptance stub |

## Checks per task

See [`CHECK_CATALOG.md`](CHECK_CATALOG.md). Each task has 6 checks (2 smoke + 4 stress).

## Rules

1. Scripts are **operator-run after generation** — not given to agents during runs (fairness).
2. Same scripts for all four groups.
3. Build failure → skip validation, mark run `failed-run` in ledger.
4. Build pass → run full smoke + stress even if rubric later scores low.

## Status

**Phase 1 complete.** Golden stubs pass validation CLI (exit 0).

**Phase 2 complete.** Run directories scaffolded; ledger extended.

**Agent contract:** [`../tasks/VALIDATION-CONTRACT.md`](../tasks/VALIDATION-CONTRACT.md) — required `data-testid` + API paths for all four groups before Phase 3 runs.
