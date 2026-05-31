# Phase 3 Progress (v2 formal runs)

**Started:** 2026-05-29  
**Completed:** 2026-05-29  
**Orchestrator:** C (main agent + subagents)

| order | run_id | status | build | validation_pass_rate | notes |
| ---: | --- | --- | --- | --- | --- |
| 1 | list-skill-r01 | valid | pass | 1.0 (6/6) | 5 EU injected |
| 2 | list-base-r01 | valid | pass | 1.0 (6/6) | baseline |
| 3 | list-super-r02 | valid | pass | 1.0 (6/6) | superpowers |
| 4 | list-full-r01 | valid | pass | 0.833 (5/6) | smoke-list-filter fail |
| 5 | list-base-r02 | valid | pass | 1.0 (6/6) | baseline |
| 6 | list-super-r01 | valid | pass | 1.0 (6/6) | superpowers |
| 7 | list-full-r02 | valid | pass | 1.0 (6/6) | full-prompt 18 EU |
| 8 | list-skill-r02 | valid | pass | 1.0 (6/6) | 5 EU injected |
| 9 | dash-full-r02 | valid | pass | 1.0 (6/6) | full-prompt |
| 10 | dash-super-r01 | valid | pass | 1.0 (6/6) | superpowers |
| 11 | dash-skill-r01 | valid | pass | 1.0 (6/6) | 4 EU injected |
| 12 | dash-base-r02 | valid | pass | 1.0 (6/6) | baseline |
| 13 | dash-full-r01 | valid | pass | 1.0 (6/6) | full-prompt |
| 14 | dash-base-r01 | valid | pass | 1.0 (6/6) | baseline |
| 15 | dash-skill-r02 | valid | pass | 1.0 (6/6) | 4 EU injected |
| 16 | dash-super-r02 | valid | pass | 1.0 (6/6) | superpowers |

## Batch A summary (task-list-page)

| group | mean validation_pass_rate (2 reps) |
| --- | ---: |
| baseline | 1.0 |
| experience-skill | 1.0 |
| full-prompt | 0.917 |
| superpowers | 1.0 |

## Batch B summary (task-responsive-dashboard)

| group | mean validation_pass_rate (2 reps) |
| --- | ---: |
| baseline | 1.0 |
| experience-skill | 1.0 |
| full-prompt | 1.0 |
| superpowers | 1.0 |

**Phase 3 status:** COMPLETE — ready for Phase 4 (anonymous rubric blind review).

Canonical ledger: [`run-log.csv`](run-log.csv) · Check results: [`validation-results.csv`](../validation-results.csv)
