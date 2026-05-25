---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: issue
path_or_issue_pr: "#221577"
artifact_url: "https://github.com/elastic/kibana/issues/221577"
artifact_title: "[Lens] add better accessibility descriptions to elastic-charts"
verification_status: verified
claim_support: strong
excerpt_or_summary: "要求图表输出维度/字段/操作等可读描述，提高信息密度下的可消费性。"
mapped_experience_claim: "密集可视化须为长字段名/维度文本提供截断、tooltip 或展开策略，避免布局溢出。"
retrieval_time: 2026-05-12T20:00:00Z
confidence: high
verification_notes: "Gate B 2026-05-25：#221577 HTTP 200；Lens 明确要求维度/字段文本模型；E2 strong+high。"
---
## Note

#221577 要求 elastic-charts 输出可读的维度/字段/操作描述，直接推动长标识符在密集仪表中的显式化与截断策略。Gate B 2026-05-25 重验；与 #36386 形成 strong+partial 证据对，晋升 `responsive-long-text-overflow`。
