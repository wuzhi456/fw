# Validation suite (Protocol v2)

**Owner:** C  
**Protocol:** `experiment-protocol-v2.md` §7.2  
**Endpoint:** A (co-primary, equal to rubric)

## Quick start

```powershell
# After agent run output is in experiments/runs/.../output/
cd FunctionWeaver
npm install   # in output dir first — operational gate
node experiments/validation/run-validation.mjs `
  --task task-list-page `
  --output experiments/runs/task-list-page/baseline/rep-01/output
```

Append results to `experiments/validation-results.csv`.

## Layout

| Path | Purpose |
| --- | --- |
| `CHECK_CATALOG.md` | Frozen check_id definitions |
| `run-validation.mjs` | CLI entry (C implements Phase 1) |
| `specs/` | Playwright test files per task |
| `fixtures/` | Mock API / viewport configs |

## Rules

1. Scripts are **operator-run after generation** — not given to agents during runs (fairness).
2. Same scripts for all four groups.
3. Build failure → skip validation, mark run failed-run in ledger.
4. Build pass → run full smoke + stress even if rubric later scores low.

## Status

**Phase 1 — scaffold only.** C implements Playwright specs before first v2 batch run.
