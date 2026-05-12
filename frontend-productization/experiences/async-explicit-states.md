---
id: async-explicit-states
title: "异步请求必须显式建模用户可感知状态"
category: frontend-productization
tags:
  - "async"
  - "request"
  - "loading"
  - "error"
  - "empty-state"
risk_severity: high
triggers:
  - "页面需要从 API 加载数据"
risks:
  - "慢请求期间界面无反馈"
  - "空数据被误认为系统故障"
mature_practices:
  - "区分 loading、success、error、empty"
  - "为错误提供可读文案与重试入口"
anti_patterns:
  - "只渲染成功路径数据"
  - "用空白屏代替加载态"
injection:
  plan: "在计划中写明列表/详情请求的 loading、empty、error、retry 行为与文案。"
  coding: "用有限状态或 discriminated union 建模请求状态，避免散落布尔值。"
  review: "检查是否仍存在仅假设数据已到达的分支。"
  test: "用慢网络、失败响应、空数组三种夹具覆盖 UI 行为。"
verification:
  - "慢请求时出现 skeleton 或明确加载提示"
  - "空列表有说明性 empty state"
  - "失败时可重试或返回上一步"
evidence:
  - "../../evidence/react-admin/async-explicit-states-001.md"
  - "../../evidence/react-admin/async-explicit-states-002.md"
confidence: high
---

## 经验解释

该条目针对「异步请求必须显式建模用户可感知状态」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：页面需要从 API 加载数据。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
