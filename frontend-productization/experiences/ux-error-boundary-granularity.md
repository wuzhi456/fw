---
id: ux-error-boundary-granularity
title: 错误边界粒度应平衡隔离与信息密度
category: frontend-productization
tags:
  - ux
  - error-boundary
  - isolation
  - dashboard
  - resilience
risk_severity: medium
triggers:
  - 页面由多个插件、卡片或嵌入面板组成
  - 局部组件异常曾导致整页空白或导航不可用
risks:
  - 单点异常拖垮整页，用户无法继续其他操作
  - 边界过细导致重复告警，难以定位真正失败区域
  - 降级 UI 缺少上下文，调试与恢复成本高
mature_practices:
  - 在路由、仪表板卡片或大区块层级设置错误边界，保留壳层导航
  - 降级面板展示失败区域标题与可读错误摘要
  - 对同类并发失败做区域级聚合，避免 alert 堆叠
anti_patterns:
  - 整页单一顶层边界，局部失败即全白屏
  - 每个小组件各自弹窗或 toast，造成噪音
  - 捕获错误后只显示 generic「Something went wrong」
injection:
  plan: 列出页面模块树，标注每块错误边界层级与降级组件（inline panel / alert / retry）。
  coding: 在路由或大卡片包裹 ErrorBoundary；失败时渲染局部 fallback 并上报，不 unmount 全局布局。
  review: 检查局部失败是否仍可使用导航与其他面板；是否出现重复告警。
  test: 模拟单 embeddable/子路由抛错，断言其余区域可操作且 fallback 含区域标识。
verification:
  - 单个面板失败时页面其他区域仍可交互
  - 降级 UI 能指出失败模块或 embeddable 名称
  - 多个组件同时失败时错误呈现被收敛而非无限堆叠
evidence:
  - ../../evidence/kibana/kibana-error-boundary-002.md
  - ../../evidence/kibana/kibana-error-boundary-003.md
  - ../../evidence/gitlab/gitlab-ux-error-boundary-001.md
  - ../../evidence/gitlab/gitlab-ux-error-boundary-002.md
confidence: medium
---

## 经验解释

多模块后台页（Dashboard、规则/告警页）常见「一个子组件抛错 → React 卸载整棵子树 → 用户连导航都看不到」的产品化事故。Kibana #139710 与 Dashboard embeddable 调试 PR 说明成熟产品会把边界放在「仍希望保留的壳层」之下，而不是 app root。GitLab epic/6359 与 #381151 则从反面说明：边界与告警策略失衡时，要么整页崩溃，要么每个失败都弹红条——两种都伤害可用性。

## 适用边界

适用于由多个独立加载块组成的 SPA/管理页。纯静态页、单表单页或错误已由上层数据层统一处理的简单 CRUD 可只用页面级兜底。本条目不替代 async 显式状态（见 `async-explicit-states`）或可恢复 toast 策略（见 `ux-fallback-recoverable-errors`）。

## 成熟实践归纳

按「用户仍应能继续的任务」划分边界：保留顶栏/侧栏，在 embeddable、路由 outlet 或业务大卡上捕获；fallback 带区域标识便于 support；对并发失败采用区域聚合或抑制重复展示，而非 N 个相同 alert。

## 验收提示

对照 `verification`：在 Storybook 或 E2E 中令单一子模块 throw，确认导航与其余面板仍渲染；检查 fallback 文案是否含模块名；并发 mock 多个加载失败时 alert 数量有上限或合并策略。
