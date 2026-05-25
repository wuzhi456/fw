---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: issue
path_or_issue_pr: "#134306"
artifact_url: https://github.com/elastic/kibana/issues/134306
artifact_title: Lazy field list loading
verification_status: verified
claim_support: strong
excerpt_or_summary: Discover/Lens 字段列表一次性加载全量 field caps 导致慢/大响应；issue 提出滚动时分页加载、前缀搜索与错误降级，避免 UI 被单次 fetch 拖死。
mapped_experience_claim: 无限滚动/字段列表增量加载需分页预取与背压：仅加载视口附近页，慢响应时保持 UI 可用而非阻塞全列表。
retrieval_time: 2026-05-25T10:00:00Z
confidence: high
verification_notes: Gate B 2026-05-25 HTTP 200；换证自 PR #106163（empty state tags 与 incremental prefetch failure mode 不对齐）。
---

## Note

#134306 直接描述 field list 全量 upfront load 的产品化风险，并给出 scroll 分页、prefix load、graceful error 等 mature practice。与 `list-incremental-prefetch` 同一 failure mode。
