---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: docs
path_or_issue_pr: docs/Admin.md
artifact_url: https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/docs/Admin.md
artifact_title: Admin queryClient — default query retry and error notification
verification_status: verified_path
claim_support: partial
excerpt_or_summary: Admin 文档说明失败 query 默认静默重试 3 次（指数退避），仍失败才向 UI 展示 error notification；可通过 queryClient 配置 retry。
mapped_experience_claim: 可重试错误应区分自动退避重试与最终失败态，并配置 retry 上限避免重试风暴。
retrieval_time: 2026-05-25T10:00:00Z
confidence: medium
verification_notes: Gate B 2026-05-25 blob 200；queryClient 章节与 C-005 重试风暴风险对齐。
---

## Note

文档 `queryClient` 节描述 React Query 默认 retry 与自定义 `retry: false` / 次数上限。与 001（notify 链路缺失）互补：成熟产品同时约定重试策略与最终用户可见失败。
