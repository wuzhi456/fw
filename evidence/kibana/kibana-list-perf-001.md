---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: pull_request
path_or_issue_pr: "#106163"
excerpt_or_summary: PR：为 Lens 空结果状态补充与有数据时一致的 render-complete / shared-item 标记，并附带单测更新。
mapped_experience_claim: 字段列表与可视化在无数据时仍需可被调度与测试感知「已完成渲染」，否则大仪表盘场景易出现性能/稳定性假阴性。
retrieval_time: 2026-05-12T12:00:00Z
confidence: medium
---

## Note

Curated P1 evidence batch: path and claim distilled from public docs, tests, or issue titles without pasting copyrighted source. SHA pins repository HEAD at retrieval time for reproducibility; line-level drift is possible—re-validate before publication.

Verifier（2026-05-12）：已将 `path_or_issue_pr` 从占位号替换为可追溯的 GitHub Issue/PR，并改写摘要与 claim 以贴合工单主题；索引见 `docs/verification-spotcheck-2026-05-12.md` §4。
