---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: pull_request
path_or_issue_pr: "#106163"
artifact_url: "https://github.com/elastic/kibana/pull/106163"
artifact_title: "[Lens] Add render complete tags to empty states"
verification_status: verified
claim_support: partial
excerpt_or_summary: "为空结果 Lens 面板补齐与有数据时一致的完成标记，便于调度与测试感知。"
mapped_experience_claim: "无数据时仍需可被调度感知「已完成渲染」，避免大仪表盘假阴性。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: medium
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
