---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: issue
path_or_issue_pr: "#36386"
artifact_url: "https://github.com/elastic/kibana/issues/36386"
artifact_title: "(Accessible) High Data Volume Bar Chart"
verification_status: verified
claim_support: partial
excerpt_or_summary: "高数据量图表的无障碍与文本替代需求，约束信息密度与非纯视觉呈现。"
mapped_experience_claim: "高数据量图表须在需求阶段规划长标签截断与非纯视觉文本承载，避免撑破容器。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: medium
verification_notes: "Gate B 2026-05-25：#36386 HTTP 200；partial+medium 与 #221577 strong 配对晋升 long-text-overflow。"
---
## Note

#36386 从高数据量柱状图无障碍需求侧约束信息密度，要求长标签/数值有可读替代而非撑破布局。Gate B 2026-05-25 重验 issue 可打开；支撑 `responsive-long-text-overflow` 的 overflow 规划维度。
