---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: issue
path_or_issue_pr: "#8075"
artifact_url: "https://github.com/marmelab/react-admin/issues/8075"
artifact_title: "Datagrid is freezing the screen when receiving a \"large\" list"
verification_status: verified
claim_support: strong
excerpt_or_summary: "用户报告数千行客户端 DataGrid 卡顿；维护者建议使用虚拟化表格。"
mapped_experience_claim: "超大列表必须在架构上选择虚拟化或服务端分页，而非默认全量客户端渲染。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: high
verification_notes: "非 bot；与 claim 强一致。"
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
