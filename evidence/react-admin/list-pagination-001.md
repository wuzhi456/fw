---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: docs
path_or_issue_pr: docs/List.md
artifact_url: https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/docs/List.md
artifact_title: List component documentation (pagination / total)
verification_status: verified_path
claim_support: strong
excerpt_or_summary: List 文档定义 perPage、page、sort、filter 与 total：服务端分页必须回传 total，否则 Pagination 无法正确渲染末页与页码。
mapped_experience_claim: 大数据列表应走服务端分页并在 API 层提供稳定 total；缺 total 会导致分页控件错位或跳页异常。
retrieval_time: 2026-05-25T10:00:00Z
confidence: high
verification_notes: Gate B 2026-05-25 HTTP 200；excerpt ↔ claim 对齐缺 total/服务端分页 failure mode。
---

## Note

`docs/List.md` 的 Pagination 章节将 `total` 作为服务端分页契约的一部分。摘要与 claim 同一失败模式：未提供 total 或分页参数不同步时，用户可见跳页/末页不可用。
