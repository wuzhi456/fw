# Context Snapshot: extract-experience skill improvement

**Task slug:** `extract-experience-improve`  
**Timestamp:** 20260520T124600Z

## Task statement

Improve `extract-experience` SKILL design so it aligns with P1/P2 in `docs/experience-augmented-vibe-coding-plan.md`, and handles merge/add/park/conflict (user also mentioned "drop") when adding experiences to an existing library. Scope is Person A deliverables in `小组分工.md`.

## Desired outcome (stated)

A research-grade, reproducible extraction skill that agents/humans can follow for P1 evidence+candidate work and P2 EU distillation, including explicit conflict resolution against the existing ~18 EU corpus.

## Stated solution

Revise `extract-experience/SKILL.md` (and `.cursor/skills/extract-experience/` entrypoint).

## Probable intent hypothesis

Current skill is a compact checklist (~146 lines) but lacks executable P1 batch protocol, P2 EU schema handoff, and operational duplicate/conflict procedure against `frontend-productization/experiences/` + `experience-index.json`. User wants the skill to be the single source of truth for Task A, not duplicated vague bullets.

## Known facts / evidence

- Canonical skill: `extract-experience/SKILL.md` v1.1.0; mirror at `.cursor/skills/extract-experience/SKILL.md`.
- Supporting assets exist: `evidence-schema.md`, `evidence-audit-table.md`, `candidate-registry.md`, `case-studies/*.md`.
- Plan P1: directed retrieval, batch notes, `evidence/<project>/*.md`, `experience-candidates.md`, ≥30 candidates.
- Plan P2: ~18 EUs in `frontend-productization/experiences/`, index JSON, ≥2 evidence per EU.
- `小组分工.md` §2: A must define merge/add/park/conflict with duplicate dimensions (risk class, trigger, failure mode, mature practice, injection text).
- Current skill: 1 evidence minimum for candidates; conflict priority list present but no step-by-step against existing EU ids.
- `candidate-registry.md` has 42 rows, mostly `merge`; low-confidence ux EUs flagged in audit.
- 23 EU files under `frontend-productization/experiences/`.

## Constraints

- No full auto repo mining (plan + 小组分工).
- MVP six risk classes frozen.
- Research prototype, not FunctionWeaver product code.
- Week 1 A deliverables: skill, audit table, case study, registry rules.

## Unknowns / open questions

- Primary pain: agent execution failure vs human audit failure vs missing templates?
- Should "drop" replace "park" or mean reject permanently?
- How deep should P2 EU authoring live inside this skill vs `frontend-productization`?
- Boundaries: what OMX/agent may decide without user (file paths, thresholds, auto-merge)?

## Decision-boundary unknowns

- Auto-merge vs human gate for conflict resolution?
- Who owns updates to `frontend-productization/experiences/` after `add`?

## Likely codebase touchpoints

- `extract-experience/*`
- `evidence/`, `experience-candidates.md`, `extraction-notes.md`
- `frontend-productization/experiences/*.md`, `experience-index.json`
- `docs/experience-augmented-vibe-coding-plan.md` §P1/P2
- `小组分工.md` §2
