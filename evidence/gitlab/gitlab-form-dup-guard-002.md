---
source_project: gitlab
repo_url: https://gitlab.com/gitlab-org/gitlab
immutable_ref: 4893c18f7ac74048afa35976b65261cd8c8e46b0
artifact_type: code
path_or_issue_pr: "app/assets/javascripts/issuable/issuable_form.js"
artifact_url: "https://gitlab.com/gitlab-org/gitlab/-/blob/4893c18f7ac74048afa35976b65261cd8c8e46b0/app/assets/javascripts/issuable/issuable_form.js"
artifact_title: "IssuableForm showSubmitLoading"
verification_status: verified_path
claim_support: strong
excerpt_or_summary: "showSubmitLoading 在按钮已 disabled 时直接返回，否则 prepend loader 并 setAttribute disabled，与 MR 描述的双重提交防护一致。"
mapped_experience_claim: "提交处理器应幂等：已处于 submitting 状态时不再叠加 loading UI。"
retrieval_time: 2026-05-22T08:00:00Z
confidence: high
verification_notes: "GitLab API repository/files 核验 blob 存在于钉选 SHA。"
---
## Note

与 !232653 配对；服务端表单依赖页面导航自然清除 loading 状态。
