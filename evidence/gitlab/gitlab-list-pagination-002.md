---
source_project: gitlab
repo_url: https://gitlab.com/gitlab-org/gitlab
immutable_ref: 4893c18f7ac74048afa35976b65261cd8c8e46b0
artifact_type: pull_request
path_or_issue_pr: "!212764"
artifact_url: "https://gitlab.com/gitlab-org/gitlab/-/merge_requests/212764"
artifact_title: "Fix Infinite scroller not loading commits"
verification_status: verified
claim_support: partial
excerpt_or_summary: "合并请求修复 commits 列表无限滚动不加载，属于前端列表增量加载失败模式。"
mapped_experience_claim: "无限滚动需在游标/offset 变更时正确触发 fetch 并处理空页，避免静默停载。"
retrieval_time: 2026-05-22T08:00:00Z
confidence: medium
verification_notes: "API 核验 merged；描述简短，与 GLQL 分页 issue 互补覆盖不同列表场景。"
---
## Note

与 gitlab-list-pagination-001 组成 list 风险类 GitLab 备份证据对。
