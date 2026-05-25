---
id: async-retry-recover
title: 可恢复错误应提供重试与降级路径
category: frontend-productization
tags:
  - async
  - retry
  - error-recovery
risk_severity: medium
triggers:
  - 依赖外部 API 或不稳定网络
  - mutation/query 失败需用户继续操作
risks:
  - 一次失败导致流程卡死
  - 用户不知道如何继续
  - 无上限自动重试引发限流或重试风暴
mature_practices:
  - 区分可重试与不可重试错误
  - 为可重试错误提供按钮与有界退避策略
  - 保证全局 notify/inline 错误与 dataProvider 错误一致可达
anti_patterns:
  - 仅 console.error
  - 失败后页面停留在半完成态
  - 假设框架会自动 notify 而省略 onError
injection:
  plan: 列出 4xx/5xx/超时各自的用户文案、自动重试次数与最终失败 UI。
  coding: 在 queryClient/数据层配置有界 retry；组件消费统一错误对象并提供重试 action。
  review: 确认重试不会放大重复提交风险；验证全局 notify 链路在 mutation 失败时可达。
  test: 注入一次失败再成功，验证状态恢复与 retry 次数上限。
verification:
  - 失败后出现可理解提示（非仅控制台）
  - 重试后进入一致的成功或再次失败态
  - 连续失败不会无限自动重试
evidence:
  - ../../evidence/react-admin/async-retry-001.md
  - ../../evidence/react-admin/async-retry-002.md
confidence: medium
---

## 经验解释

`async-explicit-states` 解决「有没有 error UI」；本条解决「失败后用户能否继续」。#10180 显示文档承诺的全局 notify 在 React Query 路径可能缺失，用户只能逐组件手写 onError——即流程卡死在半完成态。Admin 文档同时规定默认 query retry 与可配置上限，说明重试与最终失败通知应一并设计。

## 适用边界

适用于依赖远程 API 的读写操作。纯离线、或错误即整页不可恢复跳转的场景可简化。与 `form-duplicate-submit-guard` 交叉时，重试按钮须防连点重复提交。

## 成熟实践归纳

Issue 证明 notify 链路不可假设；文档证明应用级 queryClient 应显式配置 retry 次数/退避，并在重试耗尽后 surfacing error notification。

## 验收提示

mock 一次 503 再 200：确认用户看到失败反馈、自动或手动重试后状态一致；mock 连续失败：确认 retry 有上限且最终态明确，无 notify 真空。
