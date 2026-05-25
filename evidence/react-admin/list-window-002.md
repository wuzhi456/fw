---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: issue
path_or_issue_pr: "#8075"
artifact_url: https://github.com/marmelab/react-admin/issues/8075
artifact_title: Datagrid is freezing the screen when receiving a large list
verification_status: verified
claim_support: strong
excerpt_or_summary: 用户报告数千行客户端 Datagrid 导致界面冻结；维护者建议使用虚拟化表格而非默认全量渲染。
mapped_experience_claim: 超大列表必须在架构上选择虚拟化或服务端分页，默认全量客户端渲染会造成用户可见卡顿与不可交互。
retrieval_time: 2026-05-25T10:00:00Z
confidence: high
verification_notes: Gate B 2026-05-25 HTTP 200；非 bot；与 virtualize-window failure mode 强一致。
---

## Note

Issue #8075 提供可复现的用户可见 failure mode（freeze），与 Datagrid 文档形成 strong+partial 证据对，支撑 `list-virtualize-window` 晋升。
