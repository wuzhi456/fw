---
source_project: refine
repo_url: https://github.com/refinedev/refine
immutable_ref: d9889ee24c719d34b8feaca5da2b42e8608a636d
artifact_type: issue
path_or_issue_pr: "#6323"
artifact_url: "https://github.com/refinedev/refine/issues/6323"
artifact_title: "[BUG] Menu Button and Heading Overlap in Mobile Preview."
verification_status: verified
claim_support: strong
excerpt_or_summary: "移动预览中菜单按钮与标题重叠的实际缺陷报告。"
mapped_experience_claim: "窄屏下侧栏/汉堡菜单与页标题层叠，导致导航不可点或误触。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: high
verification_notes: "Gate B 2026-05-25：issue HTTP 200；用户可见 overlap failure mode 与 mobile-navigation-density 一致；E2 strong+high。"
---
## Note

Issue #6323 直接报告移动预览中菜单按钮与 Heading 重叠，属于可复现的响应式导航密度/层叠失败，支撑 `responsive-mobile-navigation-density`。Gate B 2026-05-25 重验 URL 可打开。
