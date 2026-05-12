---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: pull_request
path_or_issue_pr: "#152311"
artifact_url: "https://github.com/elastic/kibana/pull/152311"
artifact_title: "[Discover] Inline data fetching errors"
verification_status: verified
claim_support: partial
excerpt_or_summary: "Discover 将数据获取错误改为内联展示并覆盖移动端布局，减少 toast 风暴。"
mapped_experience_claim: "多请求场景下应合并/抑制重复反馈并明确完成态，接近增量加载背压诉求。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: medium
verification_notes: "替换不存在的 unified-field-list 路径；与「字段元数据窗口化」为部分相关。"
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
