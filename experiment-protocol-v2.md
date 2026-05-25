# Experiment Protocol v2

Status: **frozen pending sign-off** (intervention texts + endpoint formulas)  
Supersedes: `experiment-protocol.md` for all **formal v2** runs  
Last updated: 2026-05-24  
Owner: **C — Evaluation / Report**  
Source spec: `.omx/specs/deep-interview-experiment-redesign.md`

---

## 0. Version delta (v1 → v2)

| Dimension | v1 (P0) | v2 |
| --- | --- | --- |
| Groups | 3 (baseline / skill / full-prompt) | **4** (+ `superpowers`) |
| Tasks (formal) | 3 × 3 × 3 = 27 runs | **2 × 4 × 2 = 16 runs** |
| Formal tasks | async + list + dashboard | **list-page + responsive-dashboard** |
| async 9 runs | mixed into analysis | **exploratory pilot only** |
| Endpoints | rubric-primary | **双 co-primary：validation + rubric（同等重要）** |
| Build gate | implicit | **仅 build 为 failed-run 硬门槛** |
| Smoke/stress | checklist in 分工 | **frozen 自动脚本 → Endpoint A** |
| Strong baseline | none | **Superpowers 全开** |
| Appendix | none | **mini-repo pilot（RepoZero-inspired）** |

---

## 1. Research question

> 在相同工具权限、相同 frozen task text、相同验收脚本下，`frontend-productization` 经验路由是否比 baseline、full-prompt checklist、Superpowers 通用工作流，带来更高的前端产品化质量？

**双 co-primary 证据（同等重要，禁止分主次）：**

1. **Endpoint A — 行为可验证性：** smoke + stress 自动通过率（`validation_pass_rate`）
2. **Endpoint B — 工程质量：** `rubric.md` 盲评总分（`rubric_total` /100）

**Exploratory（报告必引，非 co-primary）：** B 的 routing metrics；experience-skill 组的 evidence-of-use（可由 C 在分析阶段基于 B 已有 routing packet 做只读对照）。

---

## 2. Scope (unchanged from v1)

Six frontend productization risk classes only. No backend/DevOps/platform scope.

---

## 3. Experiment groups (4 arms)

| `group_id` | Intervention file | Condition | `injected_experience_count` |
| --- | --- | --- | ---: |
| `baseline` | `experiments/interventions/baseline.md` | Frozen task text only | 0 |
| `full-prompt` | `experiments/interventions/full-prompt.md` | Task + full 18-EU checklist | 18 |
| `experience-skill` | `experiments/interventions/experience-skill.md` | Task + `frontend-productization` router (3–5 EU) | 3–5 |
| `superpowers` | `experiments/interventions/superpowers.md` | Task + Superpowers plugin skills **fully enabled** | N/A |

**Fairness (frozen):**

1. **Capability parity:** All groups get identical shell/npm/test/browser tool access. Superpowers adds skill **instructions only** — no pre-installed Playwright/Cypress helpers beyond what other groups receive.
2. **Budget parity (recommended, sign-off):** Max **45 min** wall-clock per run; record `duration_minutes`. Retries at most once.
3. **Validation parity:** All groups evaluated with the **same** frozen scripts under `experiments/validation/`.

---

## 4. Formal tasks

| `task_id` | File | Stress focus |
| --- | --- | --- |
| `task-list-page` | `experiments/tasks/task-list-page.md` | empty, slow/fail+retry, stale filter, large dataset |
| `task-responsive-dashboard` | `experiments/tasks/task-responsive-dashboard.md` | narrow viewport, long text, partial card error, dense KPI |

Base requirement text **must not change** across groups within a task.

### Exploratory pilot (out of formal v2 analysis)

- `task-async-form`: 9 existing runs (2026-05-12). Cite in report §Exploratory only. Do not pool with v2 formal statistics.

---

## 5. Run matrix

```text
2 tasks × 4 groups × 2 replicates = 16 accounted runs
```

Randomization: `experiments/randomization-table-v2-16.csv` (seed `20260524`).

Every run → one row in `experiments/run-log.csv` with all §8 fields populated **before** scoring.

---

## 6. Environment constants

Same as v1 §6, plus:

| Field | v2 value |
| --- | --- |
| Protocol version | `v2` |
| Agent surface | Cursor Agent (or equivalent); record exact product in `notes` |
| Superpowers | Plugin enabled; all bundled skills available per `superpowers.md` |
| Validation runner | Playwright (default; Cypress allowed if C documents deviation) |

---

## 7. Operational gate vs endpoints

### 7.1 Operational gate (not an endpoint)

```powershell
npm install
npm run build
```

- **Exit ≠ 0** → `status=failed-run`, `failure_reason=build_failed`. Exclude from Endpoint A/B means; keep ledger row.
- **Exit = 0** → proceed to **both** Endpoint A and Endpoint B regardless of downstream results.

### 7.2 Endpoint A — Automated validation

**Formula:**

```text
validation_pass_rate = passed_checks / applicable_checks
```

**Check catalog:** `experiments/validation/CHECK_CATALOG.md` (frozen before first v2 run).

**Runner:**

```powershell
# from repo root, after build in run output dir
node experiments/validation/run-validation.mjs --task <task_id> --output <path-to-run-output>
```

**Output:** append rows to `experiments/validation-results.csv`:

```csv
run_id,task_id,group,rep,check_id,check_type,status,evidence_path,notes
```

`status`: `pass` | `fail` | `not_applicable` | `not_testable`

**Per-task minimum checks:**

| task_id | smoke | stress |
| --- | --- | --- |
| `task-list-page` | `smoke-list-render`, `smoke-list-filter` | `stress-list-empty`, `stress-list-slow-fail-retry`, `stress-list-stale-filter`, `stress-list-large-page` |
| `task-responsive-dashboard` | `smoke-dash-render`, `smoke-dash-resize` | `stress-dash-narrow`, `stress-dash-long-text`, `stress-dash-partial-error`, `stress-dash-dense-kpi` |

### 7.3 Endpoint B — Rubric blind review

**Formula:**

```text
rubric_total = functional (20) + productization (45) + code (35)   # max 100
```

Scoring rules: `rubric.md` + `experiments/full-rubric-review-instructions.md`.

**Procedure:**

1. Anonymize to `experiments/anonymous-submissions/<anon_id>/` (no group paths in tree).
2. Score with **human reviewer(s)** and **LLM reviewer** as **parallel channels** — both reported; neither labeled supplementary.
3. Metric diff ≥ 2 on any 0–3 band → adjudication.
4. If two humans available → Cohen's kappa; else document single-human + LLM parallel in threats.

**Output:** `experiments/scores-v2.csv`:

```csv
run_id,anon_id,reviewer_id,reviewer_type,rubric_total,functional,productization,code,review_json_path
```

### 7.4 Conjunction rule (reporting)

| Pattern | Allowed claim |
| --- | --- |
| A↑ and B↑ for experience-skill vs baseline | Consistent improvement in **both** validation and rubric |
| A↑ B↓ or A↓ B↑ | Report **divergence** + mechanism subsection; no “overall superior” |
| Only one endpoint significant | Scope claim to that endpoint only |
| Superpowers A↑ B↓ | Discuss generic verification vs domain EU |

---

## 8. Run ledger (required fields)

All v1 §8 fields, plus:

| Field | Required |
| --- | --- |
| `protocol_version` | `v2` |
| `validation_pass_rate` | yes after Endpoint A |
| `validation_checks_passed` | yes |
| `validation_checks_applicable` | yes |
| `rubric_total_human` | yes if human scored |
| `rubric_total_llm` | yes if LLM scored |
| `build_status` | `pass` / `fail` |

---

## 9. Appendix — Mini-repo pilot (RepoZero-inspired)

**Not part of 16-run formal matrix.**

| Field | Value |
| --- | --- |
| Task | `experiments/tasks/task-mini-admin-repo.md` (C drafts → user review) |
| Groups | `baseline`, `experience-skill` only |
| Reps | 1 each → **2 pilot runs** |
| Acceptance | `scripts/validate_mini_repo.py` or Playwright fixture equivalence |
| Report slot | Appendix / future work |

Borrow **output-equivalence** idea from [RepoZero](https://arxiv.org/abs/2605.07122); do **not** run official Python RepoZero toolchain in formal path.

---

## 10. Analysis outputs (C deliverables)

| Artifact | Path |
| --- | --- |
| Validation results | `experiments/validation-results.csv` |
| Rubric scores | `experiments/scores-v2.csv` |
| Dual-endpoint analysis | `experiments/analysis-v2.md` |
| Final report | `docs/experience-augmented-vibe-coding-report.md` |

**analysis-v2.md must include:**

- Per-group mean ± CI for **both** `validation_pass_rate` and `rubric_total` (same table)
- Cliff's delta or rank-biserial (small N)
- Conjunction rule applied explicitly
- Exploratory async pilot summary (separate section)
- Threats: N=16, platform-controlled params, reviewer subjectivity, Superpowers fairness

---

## 11. Deviation log

| Date | Deviation | Reason | Impact |
| --- | --- | --- | --- |
| 2026-05-24 | Protocol v2 issued; v1 superseded for formal runs | Deep interview + ralplan | async pilot demoted to exploratory |
| 2026-05-24 | Groups 3→4; matrix 27→16 | Course timeline + stronger baselines | Wider CI; report must note power |
| 2026-05-24 | Dual co-primary endpoints | User requirement | No primary/secondary language in report |

Append new rows before analyzing any batch that deviates.

---

## 12. Sign-off checklist (before first v2 run)

- [ ] `experiments/interventions/superpowers.md` approved
- [ ] `experiments/validation/CHECK_CATALOG.md` + scripts smoke-tested on stub
- [ ] Endpoint formulas in §7.2–7.3 approved
- [ ] `randomization-table-v2-16.csv` frozen
- [ ] C confirms read-only use of B routing assets (no EU edits)
