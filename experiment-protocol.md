# Experiment Protocol

Status: frozen for P0  
Last updated: 2026-05-12  
Scope: experience-augmented vibe coding for frontend productization

## 1. Research Question

This experiment evaluates whether a small, retrieval-oriented `frontend-productization` Skill can improve the productization quality of AI-generated frontend work compared with a baseline prompt, while controlling for the possibility that quality gains come only from adding more prompt context.

The protocol is limited to frontend productization quality. It does not evaluate backend architecture, database design, DevOps, security compliance, or an end-to-end vibe-coding platform.

## 2. Frozen Scope

The experiment covers six frontend productization risk classes:

1. Async request state: loading, error, empty, retry, stale response, and cancellation behavior.
2. List rendering performance: pagination, incremental loading, virtualized lists, and large dataset rendering.
3. Form robustness: validation, duplicate-submit prevention, pending state, and failure recovery.
4. State consistency: optimistic updates, stale request overwrite, and old/new data synchronization.
5. Error and empty-state experience: error boundaries, fallback UI, and empty-data messaging.
6. Responsive layout boundaries: mobile adaptation, long text overflow, and container-size changes.

The prototype may produce structured research assets, routing rules, templates, and dry-run records. It must not expand into a full plugin runtime, VS Code extension, server, or automated repository-mining system during the MVP.

## 3. Experiment Groups

| Group | Input condition | Purpose |
| --- | --- | --- |
| Baseline | Agent receives only the ordinary user requirement. | Measures normal generation quality. |
| Experience Skill | Agent receives the same requirement plus 3 to 5 routed experience units selected by `frontend-productization`. | Measures targeted experience injection. |
| Full Prompt | Agent receives the same requirement plus the full experience checklist. | Controls for the effect of simply adding more context. |

The Full Prompt group is recommended. If time is insufficient, it may be marked as an extension, but the report must then avoid claiming that Skill routing is superior to complete checklist prompting.

## 4. Main Tasks

The main experiment uses three fixed tasks:

1. Data list page: includes search and filtering, but the requirement does not explicitly mention loading, empty state, pagination, or request race handling.
2. Async form page: includes async validation and submit, but the requirement does not explicitly mention duplicate-submit prevention, pending state, or failure recovery.
3. Responsive admin/dashboard page: includes data overview and management actions, but the requirement does not explicitly mention mobile layout, long text, or container overflow.

Optional extension task:

4. Mobile-first admin page with dense management actions.

Each task must keep its base requirement text identical across all groups. Only the group intervention may change.

## 5. Run Counts

MVP minimum:

```text
3 tasks * 2 groups * 3 runs = 18 accounted runs
```

Recommended full comparison:

```text
3 tasks * 3 groups * 3 runs = 27 accounted runs
```

Every run counts as either valid or failed-run. Failed runs remain in the ledger.

## 6. Model And Environment Constants

These constants are frozen before execution:

| Field | Frozen value |
| --- | --- |
| Primary agent surface | Codex App / Codex CLI equivalent agent session |
| Target model | `gpt-5.4` if selectable; otherwise record platform-selected model |
| Reasoning effort | `high` if selectable; otherwise record platform-controlled |
| Temperature | `0` if exposed; otherwise `platform-controlled` |
| Network/tool access | Same permissions for all groups |
| Workspace seed | Same starter project and dependency versions for all groups |
| Context budget | Base requirement plus intervention must fit within the same session context; record approximate input token count per run |
| Skill injection limit | 3 to 5 experience units; do not exceed 5 |
| Full Prompt limit | Include the full checklist once; do not add extra commentary beyond the frozen checklist |

If a platform does not expose temperature, model, context, or seed controls, record the field as `platform-controlled` and lower the strength of causal claims in the final report.

## 7. Randomization

For each task, generate run slots before execution using this shape:

```csv
task_id,group,run_id,execution_order
```

Rules:

1. Randomize group execution order within each task.
2. Do not run all Baseline outputs first unless the randomization result requires it.
3. Keep run identifiers opaque during scoring.
4. Preserve the randomization table in `experiments/run-log.csv`.

## 8. Run Ledger

Every run must record:

| Field | Required |
| --- | --- |
| run_id | yes |
| task_id | yes |
| group | yes, before anonymization only |
| base_requirement_path | yes |
| intervention_path | yes |
| model | yes |
| temperature | yes or `platform-controlled` |
| reasoning_effort | yes or `platform-controlled` |
| context_length_estimate | yes |
| injected_experience_count | yes; `0` for Baseline |
| output_file_count | yes |
| start_time | yes |
| end_time | yes |
| duration_minutes | yes |
| status | `valid`, `failed-run`, or `retried` |
| failure_reason | required for failed-run |
| retry_of | required for retries |

A run is a failed-run if it exceeds 30 minutes, cannot produce runnable/core files, or omits the central requested artifact. Each failed-run may be retried at most once, and the original failed record must remain.

## 9. Blind Review Procedure

1. Copy outputs into `experiments/anonymous-submissions/` using anonymous IDs.
2. Remove group labels, run order, and prompt/intervention names from the scoring packet.
3. At least two reviewers score each anonymous output with `rubric.md`.
4. Reviewers must not inspect `run-log.csv` until after scores are finalized.
5. Any single metric score difference of 2 or more points triggers adjudication or re-review.
6. Compute Cohen's kappa for reviewer agreement. If kappa is below `0.65`, align on anchor examples and re-score.

## 10. Skill Routing Protocol

The `frontend-productization` Skill uses two routing channels.

### 10.1 Core Mandatory

Select 1 to 2 mandatory Experience Units when:

1. The task directly contains hard triggers such as `async`, `request`, `form`, `list`, `dashboard`, `responsive`, or `error state`.
2. `trigger_match >= 2`.
3. `risk_severity = high` and the current stage would amplify that risk.

### 10.2 Contextual Top-K

After mandatory selection, add 2 to 3 contextual units using this score:

```text
score =
  0.35 * trigger_match +
  0.25 * risk_match +
  0.20 * stage_match +
  0.10 * tech_stack_match +
  0.10 * evidence_confidence
```

The final injected set must contain 3 to 5 units unless fewer than 3 genuinely meet the threshold.

### 10.3 Deduplication And Conflict Rules

1. Merge units with similar category, trigger, and injection intent.
2. Resolve conflicts by this priority: risk severity, current-stage fit, evidence confidence, then more specific trigger.
3. Do not add unrelated units just to reach the target count.
4. Manual spot checks must find relevance scores of 2 or 3 for at least 80% of injected units.

## 11. Analysis Rules

The report must include mean, median, standard deviation, and a small-sample effect-size discussion such as Cliff's delta where appropriate.

Claims are bounded as follows:

1. If Experience Skill beats Baseline but Full Prompt is not run, claim only that experience injection helped in this setup.
2. If Full Prompt and Experience Skill are close, but Full Prompt uses substantially more context or causes more off-task behavior, claim lower-interference organization rather than absolute quality superiority.
3. If platform parameters cannot be locked, report directional observations rather than strong causal conclusions.
4. Do not generalize beyond frontend productization or beyond the selected sample/project/task mix.

## 12. Deviation Log

Any deviation from this protocol must be recorded before analysis.

| Date | Deviation | Reason | Impact | Approved by |
| --- | --- | --- | --- | --- |
| 2026-05-12 | Initial protocol frozen. | P0 setup. | None. | Project owner / agent record |
| 2026-05-12 | P4 single-task batch `task-async-form`: nine parallel agent runs; `full-prompt/rep-02` missing `src/index.css` repaired before scoring; `experience-skill/rep-03` metadata relocated from `output/` to `rep-03/`. | Automated batch + agent omission. | Minor artifact hygiene; logged in `experiments/runs/task-async-form/BATCH_SUMMARY.md` and run notes. | Operator review |
| 2026-05-12 | `rubric.md` amended: §2.1 explicit N/A averaging, §2.2 metric ids, §9 supplementary LLM reviewer rules. | Enable reproducible subagent scoring without replacing §6 formal review. | P5 claims must label LLM-assisted scores vs human blind. | Operator review |
| 2026-05-12 | Nine `llm-reviewer` full-rubric passes for `task-async-form` (`full-rubric-review.json` + `scores-full-rubric-task-async-form-wide.csv`). | User-requested complete functional/productization/code scoring. | Exploratory; not dual-reviewer kappa. | Operator review |
