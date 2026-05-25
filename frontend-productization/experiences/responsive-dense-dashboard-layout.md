---
id: responsive-dense-dashboard-layout
title: 数据密集仪表需自适应网格与最小宽度策略
category: frontend-productization
tags:
  - responsive
  - dashboard
  - grid
  - layout
  - kpi
risk_severity: medium
triggers:
  - 页面含多卡片/KPI/图表的仪表板布局
  - 需在窄屏下保持关键指标可见
risks:
  - 多列网格在小屏挤压导致 KPI 不可读
  - 卡片加载空白无 min-height 造成布局塌陷
  - 多查询 refetch 后部分卡片状态错位
mature_practices:
  - 使用 minmax/auto-fit 等响应式网格并定义卡片 min-width/min-height
  - 每卡片独立建模 loading/error，避免静默空白占格
  - 变更 invalidate/refetch 逻辑时覆盖多卡片仪表场景测试
anti_patterns:
  - 固定四列网格在所有断点不变
  - 仪表卡片共用一个全局 loading 掩盖单卡失败
  - 无堆叠顺序导致小屏先隐藏关键 KPI
injection:
  plan: 定义断点下网格列数、卡片堆叠顺序与 KPI 隐藏/折叠规则。
  coding: 为网格项设置 min-width/min-height；每 widget 使用独立查询状态边界。
  review: 检查窄屏是否仍展示首要 KPI；单卡 error 是否局部化。
  test: 在 320px 与 1024px 视口验证网格 reflow 与各卡 loading/error。
verification:
  - 窄屏下网格自动 reflow 且无水平溢出
  - 单卡慢请求/失败不导致整页空白或邻卡被挤没
  - mutation 后各卡片数据与布局状态一致
evidence:
  - ../../evidence/refine/dashboard-async-001.md
  - ../../evidence/refine/dashboard-async-002.md
confidence: medium
---

## 经验解释

数据密集仪表往往在桌面使用多列网格，小屏若缺少 minmax/reflow 规则会把 KPI 挤成细条或触发横向滚动。同时，每卡片通常绑定独立数据查询；若未分别处理 loading/error，会出现空白网格单元或整页 loading，破坏密度与可读性。Refine useList 文档与 invalidate 相关 PR 体现了「每卡状态边界 + 多查询一致性」的成熟做法。

## 适用边界

适用于多 widget 仪表板与概览页。单卡片详情页、纯静态报表可弱化网格规则但仍建议保留卡级错误边界。不覆盖移动端全局导航（见 `responsive-mobile-navigation-density`）。

## 成熟实践归纳

计划层定义断点列数与 KPI 优先级；实现层为网格项设最小尺寸并为每卡建模异步状态；变更缓存失效时通过测试覆盖多卡 refetch，防止密集布局下状态错位。

## 验收提示

对照 `verification`：缩窄视口确认 reflow 与无横向溢出；模拟单卡慢/失败请求，邻卡仍正常；mutation 后抽查各卡数据是否刷新一致。与 `async-explicit-states` 互补：本条强调网格密度与多卡边界，而非单列表请求。
