---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: issue
path_or_issue_pr: "#10180"
excerpt_or_summary: 自定义 dataProvider 抛出 HttpError 时，useNotify 未在 React Query 默认回调中弹出，与文档所述“自动通知”预期不一致。
mapped_experience_claim: 异步写操作与查询错误必须能稳定映射为可感知的通知或可恢复路径，而非仅依赖各组件手写 onError。
retrieval_time: 2026-05-12T12:00:00Z
confidence: medium
---

## Note

Curated P1 evidence batch: path and claim distilled from public docs, tests, or issue titles without pasting copyrighted source. SHA pins repository HEAD at retrieval time for reproducibility; line-level drift is possible—re-validate before publication.

Verifier（2026-05-12）：已将 `path_or_issue_pr` 从占位号替换为可追溯的 GitHub Issue/PR，并改写摘要与 claim 以贴合工单主题；索引见 `docs/verification-spotcheck-2026-05-12.md` §4。
