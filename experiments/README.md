# Experiments workspace

P4 and P5 are **human-controlled** per `experiment-protocol.md`.

Agents may add templates and scripts; batch execution, retries, anonymization, scoring, and conclusions require explicit human approval.

- `tasks/`: frozen requirement text per task.
- `run-log.csv`: append-only ledger populated during runs.
- Future: `runs/`, `anonymous-submissions/`, `scores.csv`, `analysis.md`.
