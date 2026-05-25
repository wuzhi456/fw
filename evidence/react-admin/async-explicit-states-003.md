---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: code
path_or_issue_pr: packages/ra-ui-materialui/src/detail/ShowView.tsx
artifact_url: https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/packages/ra-ui-materialui/src/detail/ShowView.tsx
artifact_title: ShowView — detail loading / error / offline branches
verification_status: verified_path
claim_support: strong
excerpt_or_summary: ShowView 在 record 未就绪时用 isPending、emptyWhileLoading 控制占位，errorState 时渲染 error，与 offline 分支并列。
mapped_experience_claim: 详情页切换记录时必须独立处理 loading 与 error，避免在 record 未定义时渲染子布局。
retrieval_time: 2026-05-25T08:00:00Z
confidence: high
verification_notes: Gate B 2026-05-25 blob 可打开；Show 将 redirectOnError 交给 ShowView 处理 error 展示。
---

## Note

详情页与列表页采用对称模式：`showError` / `showOffline` / `emptyWhileLoading` 先于 children 渲染。支撑 list/detail 加载态与 error 分支同一 EU。
