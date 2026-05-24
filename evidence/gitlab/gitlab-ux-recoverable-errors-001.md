---
source_project: gitlab
repo_url: https://gitlab.com/gitlab-org/gitlab
immutable_ref: 4893c18f7ac74048afa35976b65261cd8c8e46b0
artifact_type: issue
path_or_issue_pr: "#381151"
artifact_url: "https://gitlab.com/gitlab-org/gitlab/-/issues/381151"
artifact_title: "Excessive error alerts shown on when UI components fail to load"
verification_status: verified
claim_support: strong
excerpt_or_summary: "多个 UI 组件加载失败时，页面会堆叠大量红色告警，用户感到过度惊吓；提议重试与避免重复展示同类错误。"
mapped_experience_claim: "可恢复/局部失败应合并或去重非阻塞反馈，避免 toast/alert 堆叠打断心流。"
retrieval_time: 2026-05-22T08:00:00Z
confidence: high
verification_notes: "GitLab API v4 核验 issue 存在且为 closed；标题与描述与 claim 一致。"
---
## Note

Week 1 watchlist 换证样本：`ux-fallback-recoverable-errors` 主证据由 refine 低置信替换为本条。
