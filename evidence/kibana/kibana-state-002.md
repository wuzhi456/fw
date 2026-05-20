---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: issue
path_or_issue_pr: "#129020"
artifact_url: "https://github.com/elastic/kibana/issues/129020"
artifact_title: "[Discover] Show \"no matching indices found\" error inside the callout"
verification_status: verified
claim_support: strong
excerpt_or_summary: "将「无匹配索引」类错误从易忽略 toast 迁入 Discover 主 callout，与数据上下文绑定。"
mapped_experience_claim: "筛选/数据视图上下文变化时，错误与空态必须与当前查询绑定，避免用户基于过期或无关提示决策。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: high
verification_notes: "替换 kibanamachine 的 flaky CI Issue #97701。"
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
