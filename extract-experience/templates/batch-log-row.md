# Batch log row template (append to `../extraction-notes.md` when running from `extract-experience/`)

Copy one row into the **Batch log** table after each P1 batch completes.

| batch_id | query / lens | scope | cap | selected | include_reason | exclude_reason |
| --- | --- | --- | --- | --- | --- | --- |
| `B-{sample}-{risk}-{n}` | _keywords, module, issue label_ | _project + docs/code/issue path_ | `10` | _evidence ids, e.g. `kibana-error-boundary-002`_ | _why kept_ | _why dropped (overlap / weak / out of MVP)_ |

**Naming:** `B-ra-async-1` = react-admin async batch 1; `B-kb-err-1` = kibana error-boundary batch 1.

**Cap rule:** ≤10 Issue/PR candidates screened per risk class before human distill (plan §P1).
