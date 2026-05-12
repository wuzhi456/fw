---
id: ux-error-boundary-granularity
title: "错误边界粒度应平衡隔离与信息密度"
category: frontend-productization
tags:
  - "error-boundary"
  - "resilience"
risk_severity: medium
triggers:
  - "多模块页面或插件化布局"
risks:
  - "单组件错误白屏整页"
  - "错误信息过度技术化"
mature_practices:
  - "按路由或大卡片设边界"
  - "边界内提供重载模块动作"
anti_patterns:
  - "全局一个 boundary 吞掉一切"
  - "错误页无下一步"
injection:
  plan: "划分边界层级与降级组件清单。"
  coding: "边界内记录错误 id 便于支持工单。"
  review: "检查 SSR/CSR 差异下的边界行为。"
  test: "人为 throw，验证邻域模块仍可用。"
verification:
  - "局部失败时其他区域可操作"
  - "用户看到可行动恢复选项"
evidence:
  - "../../evidence/kibana/kibana-error-boundary-001.md"
  - "../../evidence/kibana/kibana-error-boundary-002.md"
confidence: medium
---

## 经验解释

该条目针对「错误边界粒度应平衡隔离与信息密度」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：多模块页面或插件化布局。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
