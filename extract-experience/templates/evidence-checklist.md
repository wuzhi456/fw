# Evidence verification checklist (Gate B → Gate E)

Use **in order**. Do not promote to Experience Unit until both gates pass.

## Gate B — Link integrity

| # | Check | Pass | Fail action |
| --- | --- | --- | --- |
| B1 | `artifact_url` opens (HTTP 200 / public issue) | ☐ | `replaced` or `downgraded` + `verification_notes` |
| B2 | `immutable_ref` pins commit/tag; URL includes that SHA when blob | ☐ | re-pin via `git ls-remote` |
| B3 | `verification_status` ≥ `verified_path` | ☐ | do not `add`; fix link first |
| B4 | `excerpt_or_summary` matches artifact title/theme | ☐ | rewrite summary or change artifact |
| B5 | `mapped_experience_claim` aligned with excerpt (same failure mode) | ☐ | fix claim or pick new artifact |

## Gate E — EU promotion (per Experience Unit)

| # | Check | Pass | Fail action |
| --- | --- | --- | --- |
| E1 | EU has **≥2** evidence paths | ☐ | `park` candidate or gather more evidence |
| E2 | ≥1 evidence has `claim_support: strong` **OR** (`partial` + `confidence: high`) | ☐ | no `add`; upgrade evidence |
| E3 | No promoting EU while any linked evidence is `claim_support: weak` only | ☐ | replace weak file or downgrade EU |
| E4 | At least one evidence `verification_status: verified` (issue/PR) when claim is user-visible UX | ☐ | prefer issue/PR over docs-only |
| E5 | `evidence-audit-table.md` row updated (`evidence_strength`, `action`, `notes`) | ☐ | mandatory for retrofit |

## Record

- Batch id: ___________
- EU id (if promoting): ___________
- Gate B date: ___________
- Gate E date: ___________
- Auditor: agent / human
