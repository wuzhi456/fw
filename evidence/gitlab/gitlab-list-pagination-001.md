---
source_project: gitlab
repo_url: https://gitlab.com/gitlab-org/gitlab
immutable_ref: 4893c18f7ac74048afa35976b65261cd8c8e46b0
artifact_type: issue
path_or_issue_pr: "#583662"
artifact_url: "https://gitlab.com/gitlab-org/gitlab/-/work_items/583662"
artifact_title: "GLQL work item pagination returns empty results on load more"
verification_status: verified
claim_support: strong
excerpt_or_summary: "Load more 时 GraphQL 返回空 nodes 但 hasPreviousPage=true，首屏空、二次加载重复，根因在 ES 分页与 cursor 不一致。"
mapped_experience_claim: "游标分页必须保证 pageInfo 与 nodes 一致，否则用户看到跳页、空页或重复项。"
retrieval_time: 2026-05-22T08:00:00Z
confidence: medium
verification_notes: "Work item API 返回 closed；描述含 JSON 样例与 useES=false workaround。"
---
## Note

P1 备份样本（GitLab 未进 MVP 主样本）；候选对齐 C-008/C-012，decision 维持 merge 至既有 list EU。
