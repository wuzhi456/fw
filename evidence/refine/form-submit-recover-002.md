---
source_project: refine
repo_url: https://github.com/refinedev/refine
immutable_ref: d9889ee24c719d34b8feaca5da2b42e8608a636d
artifact_type: pull_request
path_or_issue_pr: "#3657"
artifact_url: "https://github.com/refinedev/refine/pull/3657"
artifact_title: "Fix optimistic updates of lists"
verification_status: verified
claim_support: strong
excerpt_or_summary: "PR 修复乐观更新列表项合并错误，避免未变更字段在 mutation 中变 undefined。"
mapped_experience_claim: "乐观更新失败或补丁合并错误时必须回滚或重新拉取权威实体。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: high
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
