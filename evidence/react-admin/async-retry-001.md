---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: issue
path_or_issue_pr: "#10180"
artifact_url: "https://github.com/marmelab/react-admin/issues/10180"
artifact_title: "useNotify not being called by dataprovider or from within React Query instance"
verification_status: verified
claim_support: strong
excerpt_or_summary: "自定义 dataProvider 抛出 HttpError 时，全局 notify 与 React Query 回调链路未按文档预期触发。"
mapped_experience_claim: "异步写操作与查询错误必须能稳定映射为可感知的通知或可恢复路径，而非仅依赖各组件手写 onError。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: medium
verification_notes: "Issue 以支持类结案；仍直接支撑「错误可见性/恢复」claim。"
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
