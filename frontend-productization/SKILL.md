---
name: frontend-productization
description: >-
  Routed injection of 3-5 frontend productization experience units (async/list/form/state/UX/responsive)
  for Plan/Coding/Review/Test; used in experience-augmented vibe-coding experiments.
---

# Skill: frontend-productization

Purpose: inject **3 to 5** high-signal frontend productization experience units into Plan / Coding / Review / Test stages without dumping a full checklist.

## When to activate

Use this Skill when the user task touches any of the six frozen risk classes:

1. Async request state (loading, error, empty, retry, stale, cancel)
2. List performance (pagination, incremental load, virtualization)
3. Form robustness (validation, duplicate submit, pending, recovery)
4. State consistency (optimistic updates, cache invalidation, stale responses)
5. Error and empty-state UX (boundaries, fallbacks, messaging)
6. Responsive layout boundaries (mobile, overflow, dense dashboards)

Do **not** activate for pure static marketing pages with no remote data unless the user explicitly asks for productization review.

## Asset layout

```text
frontend-productization/
├─ SKILL.md                 (this file)
├─ experience-index.json    (machine-readable index)
├─ experiences/*.md         (Experience Units with YAML front matter)
├─ templates/*.md           (stage prompt scaffolds)
├─ dry-runs/*.md            (worked routing examples)
└─ (evidence lives at repo root evidence/<project>/...)
```

Path resolution: Experience Units reference evidence with paths like `../../evidence/<project>/<file>.md` relative to `experiences/`. Resolve against the repository root that contains both `evidence/` and `frontend-productization/`.

## Reading order

1. Read `experience-index.json` for ids, tags, triggers, `risk_severity`, and `evidence_confidence`.
2. Skim only the **selected** files under `experiences/` (never all 18 at once).
3. Open linked evidence files only if a claim needs audit; do not paste long excerpts into user chat.

## Routing algorithm (frozen)

### Channel A — `core-mandatory` (1 to 2 units)

Pick mandatory units when:

- Hard triggers appear in the task text (examples: `async`, `request`, `form`, `list`, `dashboard`, `responsive`, `error`, `filter`, `search`, `submit`), **or**
- `trigger_match >= 2` after tokenizing task + stage context, **or**
- `risk_severity = high` and the current stage amplifies that risk (e.g., Coding for async state).

### Channel B — `contextual-topk` (2 to 3 units)

Score remaining candidates:

```text
score =
  0.35 * trigger_match +
  0.25 * risk_match +
  0.20 * stage_match +
  0.10 * tech_stack_match +
  0.10 * evidence_confidence_weight
```

Map `evidence_confidence` from unit front matter: high=1.0, medium=0.7, low=0.4.

### Injection limits

- Total injected units: **3 to 5** (mandatory + contextual).
- If fewer than 3 units genuinely clear the threshold, inject only those and **record the shortfall** in the run log / dry-run notes.
- Deduplicate by similar intent (same risk class + overlapping triggers). Conflict arbitration: `risk_severity` > stage fit > evidence confidence > more specific trigger match.

## Stage usage

Use `templates/plan.md`, `templates/coding.md`, `templates/review.md`, `templates/test.md` as wrappers. For each stage, copy **only** the `injection.<stage>` strings from selected units into the working prompt, capped at five bullets total unless the human operator expands the budget.

## Human spot check

For each batch, at least **80%** of injected units should rate 2 or 3 on a 0 to 3 relevance scale (see `dry-runs/` examples). If not, tighten triggers or lower `tech_stack_match` noise.

## Full Prompt control group

For the Full Prompt experiment arm, concatenate **all** unit `injection.*` fields into one frozen checklist document (maintain separately; do not load into normal Skill runs).

## References

- Frozen protocol: `experiment-protocol.md`
- Rubric: `rubric.md`
- Schemas: `evidence-schema.md`
- Plan: `docs/experience-augmented-vibe-coding-plan.md` or `.omx/plans/experience-augmented-vibe-coding-plan.md`
