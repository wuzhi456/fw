# Evidence And Experience Unit Schemas

Status: frozen for P0  
Last updated: 2026-05-12

## 1. Purpose

Evidence records make every Experience Unit traceable back to concrete project material. They are not intended to copy source code or documentation. They preserve only enough source metadata and short summary to support a transferable experience claim.

Experience Unit records turn those evidence-backed claims into reusable, stage-specific guidance for the `frontend-productization` Skill.

## 2. Evidence Record Format

Each evidence file must use YAML front matter followed by a short note.

```yaml
---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: commit-or-tag-or-release
artifact_type: code | issue | pull_request | docs | test | commit
path_or_issue_pr: packages/... or #12345
excerpt_or_summary: Short evidence summary, maximum 120 Chinese characters or 80 English words.
mapped_experience_claim: The transferable claim supported by this evidence.
retrieval_time: 2026-05-12T00:00:00Z
confidence: low | medium | high
---

## Note

Explain how this artifact supports the mapped claim. Do not paste long copyrighted text.
```

## 3. Required Fields

| Field | Required | Rules |
| --- | --- | --- |
| `source_project` | yes | One of the selected samples unless explicitly marked as external support. |
| `repo_url` | yes | Canonical repository or documentation URL. |
| `immutable_ref` | yes | Prefer commit SHA, release tag, or versioned docs URL. If unavailable, write `unavailable` and explain why in the note. |
| `artifact_type` | yes | Must be one of `code`, `issue`, `pull_request`, `docs`, `test`, or `commit`. |
| `path_or_issue_pr` | yes | File path, issue number, PR/MR number, docs path, or commit SHA. |
| `excerpt_or_summary` | yes | Short summary only; no long copied passages. |
| `mapped_experience_claim` | yes | One precise claim the evidence supports. |
| `retrieval_time` | yes | ISO 8601 UTC timestamp. |
| `confidence` | yes | `low`, `medium`, or `high`. |

## 4. Confidence Rules

| Confidence | Meaning |
| --- | --- |
| high | Source directly encodes the behavior, bug, test, or documented practice. |
| medium | Source strongly implies the practice, but requires some interpretation. |
| low | Source is relevant background only and cannot support a claim by itself. |

Low-confidence evidence cannot be the only evidence for an Experience Unit.

## 5. Traceability Rules

1. Every Experience Unit must reference at least two evidence records.
2. At least one evidence record for each Experience Unit must come from a main sample project.
3. Evidence must map to one transferable claim, not a broad theme.
4. Evidence must not preserve long copyrighted passages or reusable code snippets.
5. If immutable refs cannot be captured, record retrieval time and reason.
6. Evidence paths must remain stable enough for later audit.

## 6. File Naming

Use this shape:

```text
evidence/<project>/<experience-id>-NNN.md
```

Examples:

```text
evidence/react-admin/async-request-state-001.md
evidence/refine/form-submit-duplicate-001.md
evidence/kibana/layout-overflow-001.md
```

## 7. Experience Unit Reference Shape

Experience Units reference evidence by relative path:

```yaml
evidence:
  - evidence/react-admin/async-request-state-001.md
  - evidence/kibana/async-request-state-002.md
```

## 8. Validation Checklist

Before an evidence record is accepted:

1. The URL or repo path resolves.
2. The immutable ref is present or the missing-ref reason is explicit.
3. The summary is short and does not copy a large passage.
4. The mapped claim is narrow and productization-relevant.
5. The confidence rating matches the source strength.
6. The record belongs to one of the six frozen risk classes.

## 9. Minimal Example

```yaml
---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: docs
path_or_issue_pr: docs or package docs path to be fixed during P1
excerpt_or_summary: Documentation shows admin data flows should expose request status instead of assuming success.
mapped_experience_claim: Admin UIs should model async request state explicitly so loading, empty, and error paths are reviewable.
retrieval_time: 2026-05-12T03:30:00Z
confidence: medium
---

## Note

Replace the provisional docs path with the exact immutable artifact during P1 evidence collection.
```

## 10. Experience Unit Record Format

Each Experience Unit must be a Markdown file with YAML front matter.

```yaml
---
id: async-request-state
title: Async requests must expose user-perceivable state
category: frontend-productization
tags: [async, request, loading, error, empty-state]
risk_severity: high
triggers:
  - page loads data from an API
risks:
  - user receives no feedback while slow requests are pending
mature_practices:
  - distinguish loading, error, empty, success, and retry states
anti_patterns:
  - only implementing the success path
injection:
  plan: Define loading, error, empty, retry, and stale-response behavior before implementation.
  coding: Model async state explicitly instead of scattering boolean flags.
  review: Check for success-path-only components and missing recovery UI.
  test: Cover slow request, failed request, empty data, and stale response scenarios.
verification:
  - slow requests show loading or skeleton UI
  - failed requests expose a recoverable error state
evidence:
  - evidence/react-admin/async-request-state-001.md
  - evidence/kibana/async-request-state-002.md
confidence: high
---

## Explanation

Describe the hidden productization problem this experience prevents.

## Applicability

State when this experience applies and when it is unnecessary.

## Mature Practice

Summarize the transferable practice without copying source code.

## Acceptance Prompt

Explain how an agent or reviewer can tell whether the generated result implemented this experience.
```

## 11. Experience Unit Required Fields

| Field | Required | Rules |
| --- | --- | --- |
| `id` | yes | Stable kebab-case identifier. |
| `title` | yes | One concise experience claim. |
| `category` | yes | Use `frontend-productization` for MVP records. |
| `tags` | yes | Include risk-class and technical trigger tags. |
| `risk_severity` | yes | `low`, `medium`, or `high`. |
| `triggers` | yes | Observable task cues that activate this unit. |
| `risks` | yes | Product risks prevented by this unit. |
| `mature_practices` | yes | Transferable practices, not copied code. |
| `anti_patterns` | yes | Common failure modes to detect. |
| `injection.plan` | yes | Planning-stage instruction. |
| `injection.coding` | yes | Implementation-stage instruction. |
| `injection.review` | yes | Review-stage check. |
| `injection.test` | yes | Test-stage check. |
| `verification` | yes | Observable acceptance checks. |
| `evidence` | yes | At least two evidence paths. |
| `confidence` | yes | Overall confidence based on evidence strength. |

## 12. Experience Unit Body Requirements

The Markdown body must include:

1. Experience explanation: what hidden productization problem this prevents.
2. Applicability boundary: when it applies and when it does not.
3. Mature-practice summary: why mature projects handle the concern this way.
4. Acceptance prompt: how an agent or reviewer can verify the experience was implemented.

## 13. Cross-Validation Rules

Before an Experience Unit is accepted:

1. It references at least two evidence records.
2. At least one evidence record comes from a main sample project.
3. It includes all four injection stages: Plan, Coding, Review, and Test.
4. It has at least one observable verification item.
5. Its claim maps to one of the six frozen frontend productization risk classes.
6. Its confidence does not exceed the confidence supported by its evidence.
