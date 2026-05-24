---
source_project: gitlab
repo_url: https://gitlab.com/gitlab-org/frontend/rfcs
immutable_ref: archived-readonly
artifact_type: docs
path_or_issue_pr: "frontend/rfcs#94"
artifact_url: "https://gitlab.com/gitlab-org/frontend/rfcs/-/issues/94"
artifact_title: "Better client-side error logging for GitLab frontend development"
verification_status: verified_path
claim_support: partial
excerpt_or_summary: "RFC 建议在 createFlash 与 Apollo error 回调中使用 logError，将可观测性与用户可见反馈分层，避免散落的手动弹窗。"
mapped_experience_claim: "可恢复错误应通过统一 helper 记录并选择非阻塞 flash，而非每处 ad-hoc modal。"
retrieval_time: 2026-05-22T08:00:00Z
confidence: medium
verification_notes: "项目已归档为只读；页面可打开，与 #381151 形成「去重呈现 + 统一记录」互补。"
---
## Note

归档 RFC 仍可作为 partial 证据；若 claim 升级需再补一条 merged MR 中的 createFlash 用法。
