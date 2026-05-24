---
source_project: gitlab
repo_url: https://gitlab.com/gitlab-org/gitlab
immutable_ref: 4893c18f7ac74048afa35976b65261cd8c8e46b0
artifact_type: issue
path_or_issue_pr: "#381151"
artifact_url: "https://gitlab.com/gitlab-org/gitlab/-/issues/381151"
artifact_title: "Excessive error alerts shown on when UI components fail to load"
verification_status: verified
claim_support: partial
excerpt_or_summary: "多个组件同时加载失败时，每个失败都弹出告警，说明缺少按组件/区域收敛的错误呈现策略。"
mapped_experience_claim: "错误边界过细或过散会导致用户看到重复告警噪音，需按区域聚合或抑制重复展示。"
retrieval_time: 2026-05-22T08:00:00Z
confidence: medium
verification_notes: "与 recoverable-errors-001 同源 issue，claim 角度为边界/粒度而非 toast 去重；晋升 EU 时与 epic-6359 配对满足 Gate E。"
---
## Note

同一 issue 可支撑不同 failure mode 主张，但 excerpt 已按粒度角度撰写；审计时注意与 gitlab-ux-recoverable-errors-001 区分 claim。
