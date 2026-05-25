---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: 6c865bc
artifact_type: pull_request
path_or_issue_pr: "#4718"
artifact_url: https://github.com/marmelab/react-admin/pull/4718
artifact_title: Fix List Race Condition on Loading Pages Quickly
verification_status: verified
claim_support: strong
excerpt_or_summary: 合并 PR 修复 List 快速翻页竞态（Fixes #4658），框架层序列化/忽略乱序 getList 结果。
mapped_experience_claim: 列表控制器应在实现层处理请求竞态，而非依赖用户禁用分页或接受 UI 回跳。
retrieval_time: 2026-05-25T10:00:00Z
confidence: high
verification_notes: Gate B 2026-05-25 PR 200；immutable_ref 钉选 merge commit 6c865bc；换证原 useListController.spec（claim 偏空结果测试）。
---

## Note

PR 标题与 Fixes #4658 直接对应竞态修复。与 001 同一 failure mode，构成 issue（用户可见 bug）+ fix（成熟实践）双证。
