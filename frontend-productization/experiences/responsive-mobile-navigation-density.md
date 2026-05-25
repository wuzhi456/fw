---
id: responsive-mobile-navigation-density
title: 管理后台在窄屏应调整导航密度与可达性
category: frontend-productization
tags:
  - responsive
  - navigation
  - mobile
  - sidebar
  - admin
risk_severity: medium
triggers:
  - 管理端含固定侧栏或顶栏导航
  - 需在平板/手机宽度预览或交付后台
risks:
  - 汉堡菜单与页标题层叠导致无法点击
  - 侧栏常驻挤占内容区使关键操作不可达
  - 触控热区过小引发误触
mature_practices:
  - 在断点切换抽屉/折叠导航并预留标题区安全边距
  - 窄屏验收侧栏、面包屑与主操作按钮的 z-index 与间距
  - 路由布局文档化「小屏导航模式」与默认展开策略
anti_patterns:
  - 桌面侧栏布局直接缩放到移动预览
  - 未在移动断点单独测试菜单与 Heading 层叠
  - 隐藏导航后无替代入口返回列表/首页
injection:
  plan: 定义断点、导航模式（抽屉/底部/折叠）及与页标题的层叠规则。
  coding: 使用响应式布局容器分离导航与内容；窄屏下降低导航常驻宽度并保证触控目标 ≥44px。
  review: 在 375px 与 768px 视口检查菜单按钮、标题、主 CTA 是否重叠或不可点。
  test: 用移动仿真或真机走通「开菜单→选资源→返回」全流程。
verification:
  - 窄屏下导航可打开且不与页标题重叠
  - 主内容区在导航收起后仍可读且可滚动
  - 关键路由在移动断点有明确返回/首页入口
evidence:
  - ../../evidence/refine/refine-responsive-001.md
  - ../../evidence/refine/refine-responsive-002.md
confidence: medium
---

## 经验解释

后台框架常在桌面使用固定侧栏，窄屏若仅缩放比例而不调整导航密度，会出现菜单按钮与 Heading 重叠、内容区过窄等问题——这是布局与信息架构层面的产品化缺陷，而非单纯 CSS 美化。Refine #6323 报告了移动预览中的真实重叠缺陷，路由文档则给出布局集成的实现锚点。

## 适用边界

适用于带侧栏/顶栏的管理端与 internal tools。纯营销落地页、无全局导航的单页工具可不强制抽屉模式，但仍建议检查小屏触控目标。不覆盖表格长文本溢出（见 `responsive-long-text-overflow`）或仪表网格密度（见 `responsive-dense-dashboard-layout`）。

## 成熟实践归纳

在计划中写明断点与导航模式切换；实现层将导航与主内容解耦，窄屏采用抽屉或折叠并单独验收层叠；路由/布局文档记录与资源树配合的响应式策略，避免「桌面布局缩小」式适配。

## 验收提示

对照 `verification`：在 375px 宽度打开/关闭导航，确认无与标题重叠；收起导航后列表与表单主操作仍可见；从子页可返回上级或首页。若使用预览模式，应覆盖与生产一致的 meta viewport。
