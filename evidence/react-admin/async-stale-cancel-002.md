---
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: fe80bf37758da3b1d0c35a456416a1c169399d99
artifact_type: test
path_or_issue_pr: "packages/ra-core/src/controller/list/useListController.spec.tsx"
artifact_url: "https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/packages/ra-core/src/controller/list/useListController.spec.tsx"
artifact_title: "useListController unit tests"
verification_status: verified_path
claim_support: partial
excerpt_or_summary: "列表控制器单测覆盖空结果等边界，提示测试应对非成功路径断言。"
mapped_experience_claim: "自动化测试应覆盖空结果与错误分支，而非仅断言有数据列表。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: medium
verification_notes: "路径自 useGetList.spec 更正；与竞态主题弱相关。"
---
## Note

本记录在 `scripts/apply_evidence_audit.py` 中由 **evidence-audit** 批次生成：已用浏览器/GitHub 页面核验可打开性，剔除 bot-only flaky 条目并替换 404 路径。文档类证据的 `immutable_ref` 已钉选具体 commit SHA（与 `docs/evidence-audit-result.json` 同源）。

**核验状态取值**：`verified`（Issue/PR 可打开且作者非 release bot）、`verified_path`（blob/tree 可打开）、`replaced`（已换证）、`downgraded`（支撑弱已降置信）。
