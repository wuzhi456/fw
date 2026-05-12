---
id: async-retry-recover
title: "可恢复错误应提供重试与降级路径"
category: frontend-productization
tags:
  - "async"
  - "retry"
  - "error-recovery"
risk_severity: medium
triggers:
  - "依赖外部 API 或不稳定网络"
risks:
  - "一次失败导致流程卡死"
  - "用户不知道如何继续"
mature_practices:
  - "区分可重试与不可重试错误"
  - "为可重试错误提供按钮与退避策略"
anti_patterns:
  - "仅 console.error"
  - "失败后页面停留在半完成态"
injection:
  plan: "列出 4xx/5xx/超时各自的用户文案与重试策略。"
  coding: "将重试封装在数据层或 hook，组件只消费统一错误对象。"
  review: "确认重试不会放大重复提交风险。"
  test: "注入一次失败再成功，验证状态恢复与次数。"
verification:
  - "失败后出现可理解提示"
  - "重试后进入一致的成功或再次失败态"
evidence:
  - "../../evidence/react-admin/async-retry-001.md"
  - "../../evidence/react-admin/async-retry-002.md"
confidence: medium
---

## 经验解释

该条目针对「可恢复错误应提供重试与降级路径」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：依赖外部 API 或不稳定网络。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
