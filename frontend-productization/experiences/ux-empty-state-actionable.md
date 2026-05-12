---





id: ux-empty-state-actionable
title: "空数据状态应解释原因并给出下一步"
category: frontend-productization
tags:
  - "empty-state"
  - "ux"
risk_severity: medium
triggers:
  - "列表、搜索结果、筛选结果可能为空"
risks:
  - "用户认为系统坏掉"
  - "无路径添加数据或调整筛选"
mature_practices:
  - "区分无数据 vs 无匹配"
  - "提供 CTA 或清除筛选"
anti_patterns:
  - "显示空白表格"
  - "只显示 0 条"
injection:
  plan: "为每类空状态准备文案与 CTA。"
  coding: "空状态组件接收 context: no-data vs no-match。"
  review: "检查权限导致的空与真无数据。"
  test: "空数据与筛选无结果截图/断言。"
verification:
  - "空状态有标题、说明与主按钮或链接"
  - "与加载态明显区分"
evidence:
  - "../../evidence/kibana/kibana-empty-001.md"
  - "../../evidence/kibana/kibana-empty-002.md"
confidence: high
---

## 经验解释

该条目针对「空数据状态应解释原因并给出下一步」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：列表、搜索结果、筛选结果可能为空。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
