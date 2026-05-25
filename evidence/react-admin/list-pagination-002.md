---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: code
path_or_issue_pr: packages/ra-ui-materialui/src/list/List.tsx
artifact_url: https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/packages/ra-ui-materialui/src/list/List.tsx
artifact_title: Material UI List.tsx (pagination controller)
verification_status: verified_path
claim_support: partial
excerpt_or_summary: List 控制器将 query 分页状态（page/perPage/sort）与 Pagination 工具条绑定，按页请求而非客户端 slice 全量 records。
mapped_experience_claim: 列表容器应把 URL/状态中的 page 与 dataProvider.getList 参数同步，筛选变更时重置页码，避免页码与数据窗口错位。
retrieval_time: 2026-05-25T10:00:00Z
confidence: medium
verification_notes: Gate B 2026-05-25 HTTP 200；代码层 partial 支撑分页状态同步实践。
---

## Note

`List.tsx` 通过 ListContext 传递分页与 sort/filter，Datagrid 消费当前页数据。与文档 total 契约互补：控制器负责 query 同步，API 负责 total 与 slice 一致。
