---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: docs
path_or_issue_pr: docs/List.md
artifact_url: https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/docs/List.md
artifact_title: List component documentation (loading / error / empty)
verification_status: verified_path
claim_support: partial
excerpt_or_summary: List 文档定义 loading、error、empty、emptyWhileLoading 等 props，要求列表首屏与失败/空结果各有独立 UI 分支。
mapped_experience_claim: 列表页异步拉数必须显式区分 loading、error、empty，避免空白屏或误把失败当空数据。
retrieval_time: 2026-05-25T08:00:00Z
confidence: medium
verification_notes: Gate B 2026-05-25 HTTP 200；替换原空文件 DataFetchingGuide.md。
---

## Note

`docs/List.md` 的 `loading`、`error`、`empty`、`emptyWhileLoading` 章节直接描述列表异步态的可配置 UI。摘要与 claim 对齐同一失败模式：未建模 loading/error/empty 时用户看到空白或误判。
