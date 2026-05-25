---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: docs
path_or_issue_pr: docs/Datagrid.md
artifact_url: https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/docs/Datagrid.md
artifact_title: Datagrid documentation (performance / optimized)
verification_status: verified_path
claim_support: partial
excerpt_or_summary: Datagrid 文档说明大数据场景应约束列数，并提及 optimized 等性能选项，暗示不宜默认全量 DOM 渲染。
mapped_experience_claim: 超长列表在渲染层需要窗口化/虚拟化或 optimized 模式，否则行×列 DOM 规模导致滚动卡顿。
retrieval_time: 2026-05-25T10:00:00Z
confidence: medium
verification_notes: Gate B 2026-05-25 HTTP 200；文档 partial 支撑虚拟化/性能 failure mode。
---

## Note

`docs/Datagrid.md` 的性能章节与 #8075 用户报告互补：文档给出预防性约束，issue 给出用户可见 freeze failure mode。
