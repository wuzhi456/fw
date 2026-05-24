# Deep Interview Transcript: extract-experience skill improvement

**Profile:** Standard (threshold ≤ 0.20, max 12 rounds)  
**Completed:** 2026-05-20 (6 rounds)  
**Final ambiguity:** ~14%  
**Context snapshot:** `.omx/context/extract-experience-improve-20260520T124600Z.md`

## Q&A Summary

| Round | Focus | Question (condensed) | Answer |
| --- | --- | --- | --- |
| 1 | Intent | Primary failure mode for A / extract-experience? | P1 evidence collection weak; verification depth below Kibana batch bar |
| 2 | Success | What defines “Kibana batch” verification bar? | **B+E** (see spec) |
| 3 | Non-goals | What is explicitly out of scope? | **A:** Do not rewrite `apply_evidence_audit.py`; SKILL defines agent/human steps only |
| 4 | Decision boundaries | What may Agent do without asking? | **1–6** autonomous; not “all need human” |
| 5 | Pressure | Replace scope vs B+E for existing 18 EUs? | **A** now (audit-flagged only); **C** long-term (new batches only) |

## Clarity breakdown (final)

| Dimension | Score | Notes |
| --- | ---: | --- |
| Intent | 0.90 | P1 + verification depth is the bottleneck |
| Outcome | 0.85 | SKILL encodes B/E gates + batch logging; retrofit minimal |
| Scope | 0.88 | Skill-only process; script frozen; merge/conflict in agent scope |
| Constraints | 0.78 | Plan P1/P2, 小组分工 A, six risk classes |
| Success criteria | 0.88 | B+E operationalized; A vs C retrofit policy |
| Context | 0.88 | Brownfield assets mapped |

## Pressure-pass finding

Round 1 claimed “Kibana batch” as benchmark; Round 5 narrowed **replace** to audit-flagged EUs only (**A**), with **C** as steady-state for legacy corpus—avoids implicit full 36-file backfill while keeping Agent autonomy on 1–6 bounded for Week 1.

## Readiness gates

- Non-goals: explicit (no script rewrite)
- Decision boundaries: explicit (1–6 autonomous)
- Pressure pass: complete (Round 5)
