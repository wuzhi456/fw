---
id: ux-fallback-recoverable-errors
title: 可恢复错误应通过非阻塞反馈呈现
category: frontend-productization
tags:
  - ux
  - error-recovery
  - toast
  - flash
  - non-blocking
risk_severity: medium
triggers:
  - 后台保存、自动同步或局部组件异步加载可能失败
  - 多个请求并发失败时曾出现 alert/toast 堆叠
risks:
  - 重复 modal/alert 打断主流程，用户忽略关键失败
  - 可重试错误被当成致命错误，缺少恢复路径
  - 每处 ad-hoc 弹窗导致反馈风格不一致
mature_practices:
  - 按严重度分级：可恢复用非阻塞 flash/toast，仅致命阻断用 modal
  - 合并或去重同类并发错误，避免 N 条相同红条
  - 用户可见反馈与 logError/Sentry 分层，统一 helper 序列化错误
anti_patterns:
  - 每个组件失败各弹一次全屏或顶部 alert
  - 可重试网络错误只用 blocking modal
  - 只 console.error 无任何用户可见反馈
injection:
  plan: 定义错误分级表（info/warning/recoverable/fatal）及每级的 UI 载体与去重规则。
  coding: 经统一 createFlash/logError 或等价 helper 呈现；并发失败走 dedupe key。
  review: 检查局部加载失败是否堆叠重复告警；可恢复错误是否提供 retry。
  test: mock 多组件同时 500，断言 alert 数量受控；单点失败可 retry 且不阻断其他操作。
verification:
  - 可恢复错误以非阻塞方式出现且可 dismiss
  - 多个相同失败不会无限堆叠相同 alert
  - 用户仍可在页面上继续未受影响的操作
evidence:
  - ../../evidence/gitlab/gitlab-ux-recoverable-errors-001.md
  - ../../evidence/gitlab/gitlab-ux-recoverable-errors-002.md
confidence: medium
---

## 经验解释

GitLab #381151 描述多个 UI 组件加载失败时页面堆满红色告警——用户感到「过度惊吓」且难以分辨该先修什么。Frontend RFC #94 补充：应用 createFlash 与集中 logError，把观测与用户提示分层，而不是每处手写 modal。可恢复错误（网络抖动、单块加载失败）应让用户知道发生了什么、能否重试，同时不打断整页心流。

## 适用边界

适用于后台自动保存、并行 widget 加载、非关键 mutation 失败等可继续浏览的场景。支付确认、权限拒绝、数据丢失类致命错误仍可用 blocking 对话框。与 `async-retry-recover` 互补：后者偏请求层重试策略，本条偏呈现与去重。

## 成熟实践归纳

统一错误 helper；flash 默认非阻塞；同类错误合并；关键路径失败才升级 modal。归档 RFC 与 closed issue 共同定义「GitLab 式」反馈边界，换证后不再依赖低置信 refine Result 样本。

## 验收提示

对照 `verification`：并发 mock 三个 widget 失败，alert 条数 ≤ 配置上限或合并为一条摘要；单 widget 失败可 retry；其余 widget 仍可操作。
