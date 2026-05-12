---
id: responsive-mobile-navigation-density
title: "管理后台在窄屏应调整导航密度与可达性"
category: frontend-productization
tags:
  - "responsive"
  - "mobile"
  - "admin"
risk_severity: medium
triggers:
  - "需要手机或平板可用的后台"
risks:
  - "横向滚动溢出"
  - "点击区域过小"
mature_practices:
  - "折叠侧栏、抽屉导航"
  - "触控目标尺寸与间距规范"
anti_patterns:
  - "桌面布局直接缩放"
  - "隐藏关键操作"
injection:
  plan: "定义断点与导航模式切换。"
  coding: "用 CSS 容器查询或媒体查询分层样式。"
  review: "检查横竖屏与折叠屏。"
  test: "320/375/768 宽度关键路径可点。"
verification:
  - "窄屏无横向整体滚动（除表格刻意）"
  - "主要按钮易于点击"
evidence:
  - "../../evidence/refine/refine-responsive-001.md"
  - "../../evidence/refine/refine-responsive-002.md"
confidence: medium
---

## 经验解释

该条目针对「管理后台在窄屏应调整导航密度与可达性」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：需要手机或平板可用的后台。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
