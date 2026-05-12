---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: issue
path_or_issue_pr: "#106085"
excerpt_or_summary: Issue：Lens 在「无结果」状态下未设置与有数据时一致的 data-render-complete 等属性，导致 Dashboard 异步测试与编排误判加载完成。
mapped_experience_claim: 异步面板在空结果、错误与成功路径上均应外显一致的「渲染完成」契约，避免竞态与假死加载。
retrieval_time: 2026-05-12T12:00:00Z
confidence: medium
---

## Note

Curated P1 evidence batch: path and claim distilled from public docs, tests, or issue titles without pasting copyrighted source. SHA pins repository HEAD at retrieval time for reproducibility; line-level drift is possible—re-validate before publication.

Verifier（2026-05-12）：已将 `path_or_issue_pr` 从占位号替换为可追溯的 GitHub Issue/PR，并改写摘要与 claim 以贴合工单主题；索引见 `docs/verification-spotcheck-2026-05-12.md` §4。
