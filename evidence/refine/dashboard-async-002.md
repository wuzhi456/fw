---
source_project: refine
repo_url: https://github.com/refinedev/refine
immutable_ref: d9889ee24c719d34b8feaca5da2b42e8608a636d
artifact_type: pull_request
path_or_issue_pr: "#4896"
artifact_url: "https://github.com/refinedev/refine/pull/4896"
artifact_title: "refactor(core): fine-tuning in invalidations"
verification_status: verified
claim_support: strong
excerpt_or_summary: "PR 调整 mutation 后失效范围与 refetch 行为，并补充变更说明与测试计划。"
mapped_experience_claim: "单测/变更应覆盖查询失效与活动查询 refetch 的交互，避免仪表板状态机盲点。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: medium
verification_notes: "原单测路径在仓库重构后 404；改为已合并 PR 作为过程证据。"
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
