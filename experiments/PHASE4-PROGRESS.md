# Phase 4 Progress — Endpoint B blind rubric review

**Completed:** 2026-05-29  
**Orchestrator:** C

## Deliverables

| Artifact | Path |
| --- | --- |
| Anonymous packages | `experiments/anonymous-submissions/anon-001` … `anon-016` |
| Operator map (gitignored) | `experiments/anon-map.operator-only.csv` |
| Review JSONs | `anon-XXX/reviews/{llm,human}-reviewer-v2-full-rubric-review.json` |
| Score ledger | [`scores-v2.csv`](../scores-v2.csv) |
| Instructions | [`full-rubric-review-instructions-v2.md`](../full-rubric-review-instructions-v2.md) |

## Reviewer coverage

- **llm-reviewer-v2:** 16/16 runs
- **human-reviewer-v2:** 16/16 runs
- **Total score rows:** 32

## Notable human vs LLM total gaps (|Δ| ≥ 10)

| run_id | anon_id | LLM | Human | Δ | note |
| --- | --- | ---: | ---: | ---: | --- |
| list-skill-r01 | anon-001 | 91.67 | 75.67 | 16.0 | LLM rated productization higher |
| list-super-r02 | anon-003 | 88.67 | 75.00 | 13.67 | same |
| list-full-r01 | anon-004 | 86.45 | 70.45 | 16.0 | human penalized missing preview mock |
| dash-full-r01 | anon-013 | 80.95 | 78.73 | 2.22 | human: Manage Records not wired |

No single-metric band adjudication (≥2) flagged for runs with identical reviewer pairs on dash batch 9–12 and list 5–8.

## Scripts

```powershell
node experiments/scripts/anonymize-v2-runs.mjs
node experiments/scripts/batch-append-scores-v2.mjs
```

**Phase 4 status:** COMPLETE — ready for Phase 5 (`analysis-v2.md`).
