# Batch: task-async-form (single-task full factorial)

- **When:** 2026-05-12  
- **Design:** 3 groups × 3 replicates = 9 parallel Cursor subagents (one run per agent).  
- **Frozen task:** `experiments/tasks/task-async-form.md`  
- **Deviation:** `full-prompt/rep-02` missing `src/index.css` after agent run; added minimal stylesheet so `npm run build` passes (log in `experiment-protocol.md` §12 if this batch is officially locked).  
- **Deviation:** `experience-skill/rep-03` wrote `metadata.json` under `output/`; moved to `rep-03/metadata.json`.

## Build verification (host)

Re-ran `npm run build` in each `*/output/` from WSL; all nine exit 0 after repair.

## CI note (shell wait)

A one-off poll script exited **1** after ~10.5 min when only **8/9** `full-rubric-review.json` files were present; the last file appeared shortly afterward. All nine reviews are on disk; see `experiments/task-async-form-full-rubric-summary.md` and `scores-full-rubric-task-async-form-wide.csv`.

## run-log.csv

Operator should append nine rows with model/temperature/timestamps per `experiment-protocol.md` §8. Placeholder `run_id` values are in each `metadata.json`.
