---
source_project: refine
repo_url: https://github.com/refinedev/refine
immutable_ref: d9889ee24c719d34b8feaca5da2b42e8608a636d
artifact_type: docs
path_or_issue_pr: "documentation/docs/data/hooks/use-list/index.md"
artifact_url: "https://github.com/refinedev/refine/blob/d9889ee24c719d34b8feaca5da2b42e8608a636d/documentation/docs/data/hooks/use-list/index.md"
artifact_title: "useList hook documentation"
verification_status: verified_path
claim_support: strong
excerpt_or_summary: "useList 文档描述列表查询状态、错误与加载等钩子语义。"
mapped_experience_claim: "密集仪表多卡片应各自暴露 loading/error 并保留网格单元最小高度，避免空白挤塌布局。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: high
verification_notes: "Gate B 2026-05-25：useList docs HTTP 200；strong+high；复用晋升 responsive-dense-dashboard-layout。"
---
## Note

useList 文档描述列表/卡片级查询的 loading、error 等状态钩子，支撑密集仪表中每卡片独立状态边界，避免无 min-height 的空白单元破坏网格。Gate B 2026-05-25 重验；与 #4896 配对晋升 `responsive-dense-dashboard-layout`。
