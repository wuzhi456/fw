# Evaluation Rubric

Status: frozen for P0; amended for subagent full-rubric runs  
Last updated: 2026-05-12

## 1. Score Scale

Every metric uses the same 0 to 3 score band.

| Score | Meaning |
| ---: | --- |
| 0 | Missing, non-runnable, or does not address the concern. |
| 1 | Rough handling exists, but recovery, testability, or edge-case coverage is clearly weak. |
| 2 | Clear handling exists and most target scenarios are usable. |
| 3 | Mature handling: recoverable, testable, structurally clear, and maintainable. |

Scores must be assigned from observable output only. Do not infer intent from the prompt or group label during blind review.

## 2. Weighted Categories

Total score: 100.

| Category | Weight |
| --- | ---: |
| Functional quality | 20 |
| Productization quality | 45 |
| Code quality | 35 |

For each category, average its **scored** metrics on the 0 to 3 scale (see §2.1), divide by 3, and multiply by the category weight.

```text
category_score = average_metric_score / 3 * category_weight
total_score = functional_quality + productization_quality + code_quality
```

### 2.1 Metrics marked N/A

When a metric is **genuinely out of scope** for the artifact (see §4), record `N/A` with a one-line `na_reason`. **Exclude** that metric from the category mean: only **non-N/A** metrics participate in `average_metric_score`. If every metric in a category were N/A (invalid), treat the category as unscorable and document the failure; for normal form-only tasks, `List/data performance` is typically N/A.

### 2.2 Machine-readable metric ids

Use these keys in JSON/CSV tooling (aligned with §3–§5):

| Category | `metric_id` | § |
| --- | --- | --- |
| functional | `requirement_completion` | 3 |
| functional | `primary_path_operability` | 3 |
| functional | `interaction_completeness` | 3 |
| productization | `async_state_handling` | 4 |
| productization | `list_data_performance` | 4 |
| productization | `form_robustness` | 4 |
| productization | `state_consistency` | 4 |
| productization | `error_empty_ux` | 4 |
| productization | `responsive_layout` | 4 |
| code_quality | `component_boundaries` | 5 |
| code_quality | `request_state_modeling` | 5 |
| code_quality | `reuse_consistency` | 5 |
| code_quality | `test_coverage` | 5 |
| code_quality | `maintainability` | 5 |

## 3. Functional Quality Metrics

Weight: 20.

| Metric | Review question |
| --- | --- |
| Requirement completion | Does the output implement the explicit user-facing requirement? |
| Primary path operability | Can the main workflow be run or reasoned through without missing core files or broken imports? |
| Interaction completeness | Are expected user actions wired through instead of being only static placeholders? |

## 4. Productization Quality Metrics

Weight: 45.

| Metric | Review question |
| --- | --- |
| Async state handling | Are loading, success, error, empty, retry, and stale request cases handled where relevant? |
| List/data performance | Are pagination, incremental loading, virtualization, or bounded rendering considered for large datasets where relevant? |
| Form robustness | Are validation, pending state, duplicate-submit prevention, and failure recovery handled where relevant? |
| State consistency | Are optimistic updates, cache invalidation, stale responses, and old/new data synchronization handled where relevant? |
| Error and empty-state experience | Are fallback UI, actionable messages, and empty-state guidance present where relevant? |
| Responsive and layout boundaries | Does the UI handle mobile widths, long text, dense content, and container overflow where relevant? |

If a metric is genuinely irrelevant to a task, mark it `N/A` and exclude it from that category average. Reviewers must justify every `N/A`.

## 5. Code Quality Metrics

Weight: 35.

| Metric | Review question |
| --- | --- |
| Component boundaries | Are components split around coherent responsibilities without over-fragmentation? |
| Request/state modeling | Are request and mutation states represented explicitly enough to avoid success-path-only logic? |
| Reuse and local consistency | Does the output reuse local helpers/patterns and avoid unnecessary new abstractions? |
| Test coverage | Are tests or testable structures present for important edge cases? |
| Maintainability | Is the result readable, minimally scoped, and easy to modify? |

## 6. Review Process

1. Two reviewers independently score every anonymous submission.
2. Reviewers use only the anonymous output packet and this rubric.
3. Any metric score difference of `>= 2` triggers adjudication or re-review.
4. Compute Cohen's kappa across reviewer score bands.
5. If kappa is below `0.65`, reviewers align on anchor examples and re-score.
6. Keep original and post-adjudication scores in `experiments/scores.csv`.

## 7. Score Record Format

Use this CSV shape:

```csv
anonymous_id,reviewer_id,metric,score,na_reason,comment
```

For summarized output, use:

```csv
anonymous_id,functional_quality,productization_quality,code_quality,total_score,review_status
```

## 8. Anchor Examples

### Score 0

The generated page only renders static happy-path data and crashes or omits the requested workflow.

### Score 1

The generated page has a loading flag but no retry path, no empty state, and duplicate form submissions are possible.

### Score 2

The generated page handles loading, empty, and error states, prevents duplicate submit, and has mostly clear state flow, but lacks tests for race or failure recovery.

### Score 3

The generated page models request states explicitly, guards stale responses, gives recoverable UI feedback, handles layout boundaries, and includes focused tests for the key edge cases.

## 9. Supplementary LLM reviewer runs (non-replacing §6)

Course or automation batches may use **one** LLM reviewer per artifact to pre-fill scores against §1–§5, using the same 0–3 band and §2.1 N/A rules. Such runs:

1. **Do not** satisfy the two-human blind review or Cohen's kappa requirements in §6.
2. Must label the reviewer as `llm-reviewer` (or similar) in score ledgers.
3. Must not use directory names (`baseline`, `experience-skill`, `full-prompt`) as evidence when assigning points; score only observable code and runnable docs under the artifact path.

Formal P5 claims should still follow §6 or explicitly downgrade claims to “LLM-assisted exploratory scoring.”
