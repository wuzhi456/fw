# Extraction notes (P1)

## Batch policy

- Each batch: one risk class × one main sample maximum scope; cap Issue/PR screen to 10 candidates per class before human distill (per plan §5 P1).
- Evidence files store short summaries only; immutable ref pins repository `HEAD` at `2026-05-12T12:00:00Z` via `git ls-remote` SHAs (drift possible; re-pin before publication if required).

## Batch log

| batch_id | query / lens | scope | cap | selected | excluded_reason |
| --- | --- | --- | --- | --- | --- |
| B-ra-async-1 | async state admin list | react-admin docs+core | 10 | async-explicit-states-001/002 | n/a |
| B-ra-async-2 | race cancel stale | react-admin actions+tests | 10 | async-stale-cancel-001/002 | n/a |
| B-ra-async-3 | retry + notifications | react-admin docs+issues | 10 | async-retry-001/002 | n/a |
| B-ra-list-1 | pagination | react-admin list docs+ui | 10 | list-pagination-001/002 | n/a |
| B-ra-list-2 | virtualization perf | react-admin datagrid+PR class | 10 | list-window-001/002 | n/a |
| B-rf-form-1 | remote validation | refine docs+hooks | 10 | form-async-validation-001/002 | n/a |
| B-rf-form-2 | mutation modes | refine docs+PR class | 10 | form-submit-recover-001/002 | n/a |
| B-rf-state-1 | invalidate hooks | refine documentation | 10 | mutation-invalidation-001/002 | n/a |
| B-rf-dash-1 | dashboard hooks | refine docs+tests | 10 | dashboard-async-001/002 | n/a |
| B-rf-ux-1 | Result/empty patterns | refine UI docs | 10 | authz-empty-001/002 | n/a |
| B-rf-resp-1 | responsive admin | refine issues+router docs | 10 | refine-responsive-001/002 | n/a |
| B-kb-async-1 | long discover queries | kibana docs+issues | 10 | kibana-async-001/002 | n/a |
| B-kb-list-1 | field list perf | kibana code+PR class | 10 | kibana-list-perf-001/002 | n/a |
| B-kb-err-1 | error boundaries | kibana docs+issues | 10 | kibana-error-boundary-001/002 | n/a |
| B-kb-empty-1 | empty states | kibana discover tests/docs | 10 | kibana-empty-001/002 | n/a |
| B-kb-overflow-1 | layout overflow | kibana issues+PR class | 10 | kibana-overflow-001/002 | n/a |
| B-kb-state-1 | stale async context | kibana docs+issues | 10 | kibana-state-001/002 | n/a |

## Extraction limitations

- Verifier 已于 2026-05-12 将 P1 evidence 中占位 Issue/PR 号替换为 GitHub 可打开的真实编号（见 `docs/verification-spotcheck-2026-05-12.md` 附录）；后续若 claim 与编号语义漂移，应更新摘要而非改回占位符。
- GitLab frontend was excluded per `sample-selection.md`; no GitLab evidence batches in MVP.

## Handoff to P2

- Candidates consolidated into **18** Experience Units (six risk classes × three units each).
- Parked candidates (`C-023`, `C-024`, `C-003`) remain in `experience-candidates.md` without dedicated EU files.
