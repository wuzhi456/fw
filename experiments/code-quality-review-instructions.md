# Code quality review (single reviewer, task-async-form batch)

Use **only** `rubric.md` §5 (Code Quality Metrics). Each metric is **0–3** per rubric §1.

| Metric key | Rubric name |
| --- | --- |
| `component_boundaries` | Component boundaries |
| `request_state_modeling` | Request/state modeling |
| `reuse_consistency` | Reuse and local consistency |
| `test_coverage` | Test coverage |
| `maintainability` | Maintainability |

## Category score (code quality only, weight 35)

```text
code_quality_points = (mean of five metrics) / 3 * 35
```

If a metric is impossible to assess, use best judgment from repo files; do **not** mark N/A unless truly no signal (then exclude from mean and note in `na_metrics`).

## Output file

Write **exactly one** JSON file at the path given in the task prompt (`code-quality-review.json` next to `output/`). Schema:

```json
{
  "run_path": "experiments/runs/task-async-form/...",
  "metrics": {
    "component_boundaries": 0,
    "request_state_modeling": 0,
    "reuse_consistency": 0,
    "test_coverage": 0,
    "maintainability": 0
  },
  "code_quality_points": 0.0,
  "summary_comment": "one paragraph",
  "files_reviewed": ["relative paths under output/"]
}
```

Do **not** use the folder name (`baseline` / `experience-skill` / `full-prompt`) to change scores; base scores only on code under `output/`.
