---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: pull_request
path_or_issue_pr: "#128754"
artifact_url: "https://github.com/elastic/kibana/pull/128754"
artifact_title: "[Discover] Show a fallback empty message when no results are found"
verification_status: verified
claim_support: strong
excerpt_or_summary: "为无结果 Discover 增加可操作建议（时间范围、索引、筛选等）的回退文案。"
mapped_experience_claim: "空数据应解释原因并给出下一步（调整筛选/数据视图等）。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: high
verification_notes: "替换不存在的源码目录路径。"
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
