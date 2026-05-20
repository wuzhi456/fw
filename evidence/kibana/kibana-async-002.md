---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: issue
path_or_issue_pr: "#106085"
artifact_url: "https://github.com/elastic/kibana/issues/106085"
artifact_title: "Lens embeddable doesn't set proper attributes when no results found"
verification_status: verified
claim_support: strong
excerpt_or_summary: "无结果 Lens 面板未上报 render-complete，导致 Dashboard 异步编排误判加载完成。"
mapped_experience_claim: "异步面板在空/错/成功路径上应外显一致的渲染完成契约，避免竞态与假死加载。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: high
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
