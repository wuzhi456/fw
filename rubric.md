# Evaluation Rubric

Status: frozen for P0  
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

For each category, average its metrics on the 0 to 3 scale, divide by 3, and multiply by the category weight.

```text
category_score = average_metric_score / 3 * category_weight
total_score = functional_quality + productization_quality + code_quality
```

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
