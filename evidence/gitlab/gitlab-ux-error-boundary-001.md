---
source_project: gitlab
repo_url: https://gitlab.com/groups/gitlab-org
immutable_ref: epic-6359
artifact_type: docs
path_or_issue_pr: "epic/6359"
artifact_url: "https://gitlab.com/groups/gitlab-org/-/epics/6359"
artifact_title: "Frontend errors: use ErrorBoundary for error handling"
verification_status: verified_path
claim_support: strong
excerpt_or_summary: "Epic 规划用 Vue errorCaptured 的 ErrorBoundary 集中展示 GlAlert，按应用逐步迁移，减少手工 toggle 错误并拆分组件链责任。"
mapped_experience_claim: "多模块页面应按路由或大卡片设错误边界，局部失败用降级 UI 而非整页崩溃。"
retrieval_time: 2026-05-22T08:00:00Z
confidence: medium
verification_notes: "Group epic 页面可公开访问；immutable_ref 为 epic 标识（非 commit），与代码类证据互补。"
---
## Note

与 kibana-error-boundary-003 同属「边界粒度」主张；GitLab 侧强调 GlAlert 封装与 Sentry 分工。
