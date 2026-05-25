---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: issue
path_or_issue_pr: "#4658"
artifact_url: https://github.com/marmelab/react-admin/issues/4658
artifact_title: Pagination resets to page 1 when stacking page changes with a slow data provider
verification_status: verified
claim_support: strong
excerpt_or_summary: 快速连点分页时多个 getList 并发，晚到的旧页响应把 UI 重置到 page 1，与用户最后一次选择不一致。
mapped_experience_claim: 筛选/分页/路由切换触发并发请求时，必须取消或忽略过期响应，禁止旧结果覆盖最新查询。
retrieval_time: 2026-05-25T10:00:00Z
confidence: high
verification_notes: Gate B 2026-05-25 Issue 200；换证原 Actions.md（与竞态 claim 不对齐）。
---

## Note

Issue 复现步骤明确：page 2 加载中再点 next，全部请求结束后落在 page 1 而非 page 3。failure mode 为「旧请求晚到覆盖新结果」，与 `async-explicit-states`（loading/error/empty 不可见）正交。
