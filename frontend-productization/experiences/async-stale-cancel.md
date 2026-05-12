---
id: async-stale-cancel
title: "并发与导航场景下应取消或忽略过期请求"
category: frontend-productization
tags:
  - "async"
  - "race"
  - "cancellation"
  - "stale"
risk_severity: high
triggers:
  - "筛选、分页或路由切换会触发多次请求"
risks:
  - "旧请求晚到覆盖新结果"
  - "用户看到闪烁或错误数据"
mature_practices:
  - "在上下文变化时中止 fetch 或忽略过期 promise 结果"
  - "为每次请求绑定 request id"
anti_patterns:
  - "无差别 setState 最后一次响应"
  - "路由已离开仍更新页面状态"
injection:
  plan: "定义路由/筛选变化时的请求生命周期：取消、忽略或序列化。"
  coding: "使用 AbortController 或等价机制；在 effect cleanup 中处理。"
  review: "检查竞态窗口：快速连点筛选、分页回退。"
  test: "模拟乱序响应：旧响应后返回，断言 UI 仍匹配最新查询。"
verification:
  - "快速切换筛选后 UI 与最后一次查询一致"
  - "无不可解释的短暂回跳"
evidence:
  - "../../evidence/react-admin/async-stale-cancel-001.md"
  - "../../evidence/kibana/kibana-state-002.md"
confidence: high
---

## 经验解释

该条目针对「并发与导航场景下应取消或忽略过期请求」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：筛选、分页或路由切换会触发多次请求。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
