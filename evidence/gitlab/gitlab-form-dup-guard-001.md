---
source_project: gitlab
repo_url: https://gitlab.com/gitlab-org/gitlab
immutable_ref: 4893c18f7ac74048afa35976b65261cd8c8e46b0
artifact_type: pull_request
path_or_issue_pr: "!232653"
artifact_url: "https://gitlab.com/gitlab-org/gitlab/-/merge_requests/232653"
artifact_title: "Add loading state to submit buttons in MR form"
verification_status: verified
claim_support: strong
excerpt_or_summary: "MR 为 MR 表单的 Create/Save 按钮在提交时禁用并显示 spinner，且在导航前防止重复添加第二个 spinner。"
mapped_experience_claim: "写操作提交中必须禁用按钮并提供 pending 视觉反馈以防连点。"
retrieval_time: 2026-05-22T08:00:00Z
confidence: high
verification_notes: "API 核验 state=merged；描述含 guard 与 IssuableForm 范围说明。"
---
## Note

Resolves #348818；可作为 `form-duplicate-submit-guard` 的 GitLab 第三样本（主样本仍为 react-admin）。
