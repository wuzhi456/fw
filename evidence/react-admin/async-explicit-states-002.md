---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: code
path_or_issue_pr: packages/ra-ui-materialui/src/list/ListView.tsx
artifact_url: https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/packages/ra-ui-materialui/src/list/ListView.tsx
artifact_title: ListView — error / empty / offline branch rendering
verification_status: verified_path
claim_support: strong
excerpt_or_summary: ListView 用 errorState、isPending、shouldRenderEmptyPage 分支渲染 error、offline、empty 与列表内容，error 与 empty 互斥。
mapped_experience_claim: 列表容器层应集中判断 error 与 empty，禁止在子组件里假设 data 已就绪。
retrieval_time: 2026-05-25T08:00:00Z
confidence: high
verification_notes: Gate B 2026-05-25 blob 可打开；showError 与 shouldRenderEmptyPage 逻辑与 excerpt 一致。
---

## Note

源码在 `showError` 时渲染 `error` prop，在 `shouldRenderEmptyPage` 时渲染 `empty`；`isPending` 与 `emptyWhileLoading` 控制首屏加载。直接编码「error ≠ empty ≠ loading」分支，支撑 C-001/C-006。
