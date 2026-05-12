---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: issue
path_or_issue_pr: "#149488"
artifact_url: "https://github.com/elastic/kibana/issues/149488"
artifact_title: "[Discover] Inline toast error message in Discover main"
verification_status: verified
claim_support: strong
excerpt_or_summary: "将多次数据获取错误从 toast 改为内联/弹层展示，明确多请求场景 UX。"
mapped_experience_claim: "查询上下文变化或并行请求时，应以显式 UI 状态取代易错过的 toast，从用户角度等价于丢弃「过期」噪声反馈。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: high
verification_notes: "替换 404 的 building_plugins.md；与 stale-response 叙事一致。"
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
