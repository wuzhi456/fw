# Full rubric blind review — Protocol v2 formal tasks

**Binding rubric:** [`rubric.md`](../../rubric.md)  
**Reviewer types:** `human` and `llm` (co-primary, equal weight)  
**Blind rule:** Score only `experiments/anonymous-submissions/anon-XXX/source/` + task text in `README.txt`. **Do not** open `run-log.csv`, `anon-map.operator-only.csv`, or parent run paths.

## Task-specific N/A guidance

### task-list-page (in README when list task)

| metric_id | Guidance |
| --- | --- |
| `form_robustness` | **N/A** — no form workflow in frozen task |
| `list_data_performance` | **Score** — pagination/bounded render/stale guard relevant |
| `responsive_layout` | **Score lightly** — desktop-first list; mobile not required but note overflow |

### task-responsive-dashboard

| metric_id | Guidance |
| --- | --- |
| `form_robustness` | **N/A** — no form workflow |
| `list_data_performance` | **N/A** — no large list scope |
| `responsive_layout` | **Score** — core requirement |

## Scoring (0–3 per metric)

Same formula as [`full-rubric-review-instructions.md`](full-rubric-review-instructions.md):

```text
category_points = average(non_null metrics) / 3 * category_weight
total_score_0_100 = functional + productization + code_quality
```

Weights: functional **20**, productization **45**, code **35**.

## Output

Write JSON to:

```text
experiments/anonymous-submissions/anon-XXX/reviews/<reviewer_id>-full-rubric-review.json
```

Then append summary row via:

```powershell
node experiments/scripts/append-scores-v2.mjs --run_id <from operator map after scoring> ...
```

Operator runs append after mapping anon → run_id; reviewers never see run_id.

## JSON schema

Same as async pilot (`full-rubric-review.json` schema in `full-rubric-review-instructions.md`).

Use `reviewer_id`: `llm-reviewer-v2` or `human-reviewer-v2`.
