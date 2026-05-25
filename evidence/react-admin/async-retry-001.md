---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: issue
path_or_issue_pr: "#10180"
artifact_url: https://github.com/marmelab/react-admin/issues/10180
artifact_title: useNotify not being called by dataprovider or from within React Query instance
verification_status: verified
claim_support: strong
excerpt_or_summary: dataProvider 抛 HttpError 时文档承诺的全局 notify 未触发，开发者被迫在每个 mutation 手写 onError 才能给用户可恢复反馈。
mapped_experience_claim: 可恢复错误须有一条稳定的全局→UI 通知链路；不能假设框架会自动 notify 而省略重试/降级设计。
retrieval_time: 2026-05-25T10:00:00Z
confidence: high
verification_notes: Gate B 2026-05-25 Issue 200；与 explicit-states 的 loading/empty 分支不同，聚焦失败后流程卡死。
---

## Note

Issue 描述文档与实现 gap：错误已抛出但用户无 toast。支撑「可恢复错误需显式 notify + 重试/降级路径」，非竞态也非首屏 loading。
