---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: issue
path_or_issue_pr: "#126594"
artifact_url: "https://github.com/elastic/kibana/issues/126594"
artifact_title: "[Discover] Empty state's description can be completely blank"
verification_status: verified
claim_support: partial
excerpt_or_summary: "Discover 在无时间字段等组合下空状态描述缺失，讨论数据视图与空/错误反馈边界。"
mapped_experience_claim: "重数据视图在部分失败或信息不全时仍须给出可理解的进度或空状态，而非空白。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: medium
verification_notes: "替换 404 的 dev_docs data_views；与「重数据加载进度」为部分相关。"
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
