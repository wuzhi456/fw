---
source_project: refine
repo_url: https://github.com/refinedev/refine
immutable_ref: d9889ee24c719d34b8feaca5da2b42e8608a636d
artifact_type: pull_request
path_or_issue_pr: "#4896"
artifact_url: "https://github.com/refinedev/refine/pull/4896"
artifact_title: "refactor(core): fine-tuning in invalidations"
verification_status: verified
claim_support: strong
excerpt_or_summary: "PR 调整 mutation 后失效范围与 refetch 行为，并补充变更说明与测试计划。"
mapped_experience_claim: "仪表板多查询失效/refetch 变更须纳入测试，防止密集网格下卡片状态错位或 KPI 被挤没。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: medium
verification_notes: "Gate B 2026-05-25：PR #4896 HTTP 200；strong+medium；与 useList docs 配对晋升 dense-dashboard-layout。"
---
## Note

#4896 调整 mutation 后 invalidate/refetch 行为并含测试计划，支撑密集仪表多卡片查询在布局变更时仍保持一致状态。Gate B 2026-05-25 重验 PR 可打开；晋升 `responsive-dense-dashboard-layout`。
