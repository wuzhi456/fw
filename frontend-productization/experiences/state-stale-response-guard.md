---





id: state-stale-response-guard
title: "筛选上下文变化时必须丢弃不匹配响应"
category: frontend-productization
tags:
  - "state"
  - "stale"
  - "race"
risk_severity: high
triggers:
  - "搜索框、时间范围、租户切换会改变查询上下文"
risks:
  - "显示与当前筛选不符的数据"
  - "用户基于错误数据决策"
mature_practices:
  - "比较 request token 或查询签名"
  - "在 reducer 层拒绝过期 action"
anti_patterns:
  - "仅依赖最新一次 setState 竞态侥幸"
  - "无上下文签名"
injection:
  plan: "为每次查询定义 query signature。"
  coding: "在数据 hook 返回前比对 signature。"
  review: "检查快速输入与默认值变化。"
  test: "旧响应后到时被忽略。"
verification:
  - "任意时刻 UI 与当前筛选器展示的数据一致"
evidence:
  - "../../evidence/kibana/kibana-state-001.md"
  - "../../evidence/kibana/kibana-state-002.md"
confidence: high
---

## 经验解释

该条目针对「筛选上下文变化时必须丢弃不匹配响应」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：搜索框、时间范围、租户切换会改变查询上下文。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
