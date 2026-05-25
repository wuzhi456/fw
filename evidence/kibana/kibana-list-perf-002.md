---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: pull_request
path_or_issue_pr: "#152311"
artifact_url: https://github.com/elastic/kibana/pull/152311
artifact_title: "[Discover] Inline data fetching errors"
verification_status: verified
claim_support: strong
excerpt_or_summary: Discover 将重复数据获取错误从 toast 风暴改为内联单点反馈；review 明确「Toast storms hate this PR」，适合多段/增量 fetch 场景的背压与去重。
mapped_experience_claim: 增量加载链路上应合并重复错误反馈、限制并发预取深度，并在列表内联展示失败态而非无限弹 toast。
retrieval_time: 2026-05-25T10:00:00Z
confidence: high
verification_notes: Gate B 2026-05-25 HTTP 200；Resolves #149488；claim 对齐 incremental prefetch 背压/错误去重。
---

## Note

PR #152311 针对 Discover 多次 fetch 触发的 toast 风暴，是增量加载失败反馈的产品化修复。与 #134306 的「分页预取」形成互补：一个管 load 策略，一个管 error 背压。
