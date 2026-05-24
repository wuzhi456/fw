# Deep Interview Spec: extract-experience skill improvement

## Metadata

| Field | Value |
| --- | --- |
| Profile | Standard |
| Rounds | 6 |
| Final ambiguity | ~14% (threshold 0.20) |
| Context type | Brownfield |
| Context snapshot | `.omx/context/extract-experience-improve-20260520T124600Z.md` |
| Transcript | `.omx/interviews/extract-experience-improve-20260520T131500Z.md` |
| Task owner | Person A (`小组分工.md` §2) |
| Canonical skill path | `extract-experience/SKILL.md` (+ `.cursor/skills/extract-experience/` entrypoint) |

## Intent (why)

Improve `extract-experience` so P1 evidence collection and verification are **executable and auditable** at a bar modeled on Kibana batches (`extraction-notes.md` `B-kb-*`, `evidence/kibana/*`), not a thin checklist. Current SKILL (~146 lines) states outputs and merge/park/conflict priorities but does not operationalize batch retrieval, link/claim verification, or B/E acceptance gates—causing weaker batches than Kibana reference work.

Secondary alignment: P1/P2 in `docs/experience-augmented-vibe-coding-plan.md` and A deliverables (audit table, case study, candidate registry, conflict rules)—with **verification depth** as Week 1 priority over rewriting the audit script.

## Desired outcome

1. **SKILL.md** becomes a step-by-step P1 protocol: batch declaration → evidence files → claim/support check → candidate registry → optional EU draft handoff.
2. Every **new** evidence batch meets **Verification bar B+E** (below).
3. **Retrofit (Week 1):** only EU/evidence rows flagged in `extract-experience/evidence-audit-table.md` as replace / low confidence / needs-replacement—Agent may execute autonomously per decision boundaries.
4. **Steady state (long-term):** new batches must meet B+E; existing 18 EUs unchanged unless human points a unit (policy **C**).
5. `apply_evidence_audit.py` remains reference implementation; SKILL documents equivalent agent/human checks without requiring script changes.

## In-scope

- Expand `extract-experience/SKILL.md` with:
  - P1 batch workflow aligned to plan §5 P1 (`extraction-notes.md` batch log fields).
  - Evidence creation per `extract-experience/evidence-schema.md`.
  - **Verification bar B** and **Verification bar E** as mandatory gates before `add` or `merge` into EU corpus.
  - Agent/human steps mirroring `verification_status` / `claim_support` / `verification_notes` semantics used post-audit.
  - Pointer to `frontend-productization/experiences/` + `experience-index.json` when promoting candidates (P2 handoff section, not full P2 rewrite).
  - Merge/add/park/conflict procedure per `小组分工.md` §2.8 (five duplicate dimensions + registry fields)—Agent autonomous per boundaries below.
- Update `.cursor/skills/extract-experience/SKILL.md` entrypoint to match canonical skill (thin router or sync).
- Templates optional: `templates/batch-log.md`, `templates/evidence-checklist.md` under `extract-experience/`.

## Out-of-scope / Non-goals

1. **Do not rewrite** `scripts/apply_evidence_audit.py` or depend on re-running it for SKILL compliance.
2. No seventh sample project; no end-to-end auto repo mining (plan §3.2).
3. No `FunctionWeaver` / `webapp` product code changes.
4. **Week 1:** no mandatory full backfill of all 36 legacy evidence files to B+E (only audit-flagged replace set).
5. B-owned routing packets / P4 experiment execution (C lane).
6. Replacing `frontend-productization` SKILL routing logic (B lane).

## Decision boundaries (OMX / Agent without per-step confirmation)

Agent **may** autonomously:

| # | Action |
| --- | --- |
| 1 | Set `verification_status` (`verified_path`, `downgraded`, etc.) and `verification_notes` when links fail or claims are weak |
| 2 | Mark candidates `park` when B/E not met or out of MVP six risk classes |
| 3 | Mark candidates `merge` when duplicate on risk / trigger / failure mode / mature practice / injection semantics vs existing EU |
| 4 | Mark `add` and edit `frontend-productization/experiences/*.md` + `experience-index.json` when B+E satisfied |
| 5 | Resolve `conflict` with written rationale; update `candidate-registry.md` and audit notes |
| 6 | Execute `replace` / re-evidence **only** for audit-flagged EUs (Week 1); long-term only when human requests a specific EU |

Agent **should still** log batch decisions in `extraction-notes.md` and registry rows for auditability (no silent writes).

Human **should** be consulted for: changing frozen research protocol, adding sample projects, or promoting policy **C** → full corpus B+E backfill.

## Constraints

- Six frozen risk classes: async, list, form, state, ux, responsive.
- Evidence summaries only; immutable_ref pinning; GitHub-traceable artifacts.
- Research-grade asset package, not production plugin.
- Mirror skill entry under `.cursor/skills/extract-experience/`.
- Chinese default in SKILL unless user requests English.

## Testable acceptance criteria

### Verification bar B (link integrity)

- Every evidence record has working `artifact_url` and pinned `immutable_ref`.
- `verification_status` is at least `verified_path` (or `verified` / `replaced` with notes).
- Failed links → `downgraded` or `replaced` with `verification_notes`; no silent pass.

### Verification bar E (EU promotion)

- Each Experience Unit referenced by an `add` or post-merge EU has **≥2** evidence paths.
- At least **one** linked evidence has `claim_support: strong` **OR** (`partial` + `confidence: high`).
- `weak` evidence alone cannot justify `add` (park or gather more evidence first).

### P1 batch (per plan)

- Batch declares: project, risk class, source type, query, scope, cap (≤10 Issue/PR screen per class before distill).
- Batch row appended to `extraction-notes.md` with include/exclude reasons.
- Each candidate has ≥1 evidence at creation; promotion to EU obeys B+E.

### Week 1 retrofit (policy A)

- All rows in `evidence-audit-table.md` with `replace` / explicit low-confidence notes receive updated evidence meeting B+E, or EU confidence downgraded with caveat documented.

### Long-term (policy C)

- New batches: B+E required before registry `add`.
- Legacy 18 EUs: no bulk retrofit unless human names an EU id.

### A deliverables cross-check (`小组分工.md` §2.3)

- [ ] SKILL readable for manual one-EU extraction replay
- [ ] Evidence audit table complete with strength + action
- [ ] ≥1 case study under `case-studies/`
- [ ] `candidate-registry.md` supports merge/add/park/conflict columns

## Assumptions exposed + resolutions

| Assumption | Resolution |
| --- | --- |
| “Kibana batch” means highest claim strength everywhere | **Rejected.** Bar is process + B/E gates; Kibana files can be `weak` if downgraded honestly |
| Improvement requires rewriting audit script | **Rejected** (Non-goal A) |
| Agent needs confirmation for all registry writes | **Rejected**; 1–6 autonomous with logging |
| Full 18-EU B+E backfill in Week 1 | **Rejected**; only audit-flagged (**A**), then **C** for new work |
| merge/conflict deferred entirely | **Rejected**; in agent scope, secondary to P1 verification in SKILL ordering |

## Technical context (brownfield)

| Asset | Role |
| --- | --- |
| `extract-experience/SKILL.md` v1.1.0 | Current checklist; improvement target |
| `extract-experience/evidence-schema.md` | Evidence front matter |
| `extract-experience/evidence-audit-table.md` | 18 EU audit; retrofit scope |
| `extract-experience/candidate-registry.md` | 42 candidates, mostly merge |
| `extraction-notes.md` | Batch log incl. `B-kb-*` |
| `evidence/{react-admin,refine,kibana,gitlab}/` | 36+ evidence files |
| `frontend-productization/experiences/*.md` | 18 EUs |
| `scripts/apply_evidence_audit.py` | Reference only; frozen |

## Recommended SKILL structure (for implementer)

1. Trigger + execution root (keep)
2. **P1 batch protocol** (inputs, caps, batch log append)
3. **Evidence authoring** (schema link, excerpt/claim alignment check)
4. **Verification gates B → E** (checklists, fail actions)
5. **Candidate → registry** (candidate-registry columns)
6. **Merge/add/park/conflict** (five dimensions + priority order from plan §4.4 / 小组分工 §2.8)
7. **P2 handoff** (EU front matter, index update paths—do not duplicate full schema)
8. **Retrofit policy A vs steady-state C**
9. **Quality rubric + forbidden mistakes** (extend current §)
10. **Asset directory** + case study pointer

## Residual risks

- Broad agent autonomy (1–6) without script enforcement may drift; mitigate with mandatory registry + batch log writes.
- B bar alone allows `verified_path` + `partial`—E still required for EU promotion; SKILL must state order explicitly.
- Person B routing depends on EU stability; coordinate if audit-flagged EU ids change.

## Execution handoff

Requirements source of truth: **this file**. Do **not** re-interview unless user chooses “Refine further.”

| Option | Invocation | When |
| --- | --- | --- |
| **$ralplan** (recommended) | `$plan --consensus --direct .omx/specs/deep-interview-extract-experience-improve.md` | Architecture/section ordering for SKILL + templates |
| **$autopilot** | `$autopilot .omx/specs/deep-interview-extract-experience-improve.md` | Direct SKILL + registry edits |
| **$ralph** | `$ralph .omx/specs/deep-interview-extract-experience-improve.md` | Sequential completion against acceptance criteria |
| **$team** | `$team .omx/specs/deep-interview-extract-experience-improve.md` | Parallel lanes (SKILL vs case study vs audit-flagged replace) |
| **Refine further** | Continue deep-interview | If conflict section needs more rounds |

**Deep-interview does not implement SKILL changes in this session.**
