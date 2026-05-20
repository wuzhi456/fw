# Full rubric review (functional + productization + code)

**Binding rubric:** `rubric.md` (§1 scale, §2 weighted categories, §2.1 N/A averaging, §2.2 metric ids, §3–§5 questions).

**Reviewer role:** single `llm-reviewer` pass per §9 (does **not** replace formal dual blind review).

**Scored artifact:** only files under the run’s `output/` directory (plus `README`/`PLAN` in that tree if present). Read `experiments/tasks/task-async-form.md` only to judge **requirement completion** against the frozen task text.

**Bias control:** Do **not** use the parent folder names (`baseline`, `experience-skill`, `full-prompt`) as evidence for scores.

## Task-specific N/A guidance (`task-async-form`)

- **`list_data_performance`:** almost always **N/A** (no large list / pagination / virtualization scope). Set the numeric field to `null` and set `list_data_performance_na_reason` to one sentence. **Exclude** from the productization mean.

## Scoring (0–3 per metric)

Use integers 0–3 per `rubric.md` §1. For each category:

```text
average_metric_score = sum(non_null metric values) / count(non_null metrics)
category_points = average_metric_score / 3 * category_weight
```

Weights: functional **20**, productization **45**, code quality **35**.

```text
total_score_0_100 = category_functional_points + category_productization_points + category_code_quality_points
```

Round **category** and **total** to **two** decimal places in JSON.

## Output file

Write **exactly one** JSON file to the path given in the task prompt: `full-rubric-review.json` (sibling of `output/`).

### Required JSON schema

```json
{
  "reviewer_id": "llm-reviewer",
  "rubric_ref": "rubric.md",
  "run_path": "experiments/runs/task-async-form/…",
  "functional": {
    "requirement_completion": 0,
    "primary_path_operability": 0,
    "interaction_completeness": 0
  },
  "productization": {
    "async_state_handling": 0,
    "list_data_performance": null,
    "list_data_performance_na_reason": "string or empty if scored",
    "form_robustness": 0,
    "state_consistency": 0,
    "error_empty_ux": 0,
    "responsive_layout": 0
  },
  "code_quality": {
    "component_boundaries": 0,
    "request_state_modeling": 0,
    "reuse_consistency": 0,
    "test_coverage": 0,
    "maintainability": 0
  },
  "category_functional_points": 0.0,
  "category_productization_points": 0.0,
  "category_code_quality_points": 0.0,
  "total_score_0_100": 0.0,
  "summary_comment": "2–4 sentences",
  "files_reviewed": ["paths relative to output/"]
}
```

**Rules:** Any productization key other than `list_data_performance` should normally be an integer 0–3. If you must mark another metric N/A (rare for this task), use `null` plus `<metric_id>_na_reason` and exclude it from the productization mean (document in `summary_comment`).
