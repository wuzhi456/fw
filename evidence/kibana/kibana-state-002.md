---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: issue
path_or_issue_pr: "#97701"
excerpt_or_summary: Issue：Dashboard 异步搜索会话（相对时间）集成测试 flaky，讨论指向 Lens 无结果面板未正确上报渲染完成，导致「部分面板未加载」类竞态。
mapped_experience_claim: 时间范围与异步搜索叠加时，应显式等待或检测各 embeddable 的完成/错误态，避免将中间态误判为稳定态。
retrieval_time: 2026-05-12T12:00:00Z
confidence: high
---

## Note

Curated P1 evidence batch: path and claim distilled from public docs, tests, or issue titles without pasting copyrighted source. SHA pins repository HEAD at retrieval time for reproducibility; line-level drift is possible—re-validate before publication.

Verifier（2026-05-12）：已将 `path_or_issue_pr` 从占位号替换为可追溯的 GitHub Issue/PR，并改写摘要与 claim 以贴合工单主题；索引见 `docs/verification-spotcheck-2026-05-12.md` §4。
