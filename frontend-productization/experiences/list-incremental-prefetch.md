---





id: list-incremental-prefetch
title: "列表与无限滚动需要受控的增量加载与背压"
category: frontend-productization
tags:
  - "list"
  - "infinite"
  - "prefetch"
risk_severity: medium
triggers:
  - "需要无限滚动或懒加载更多"
risks:
  - "并发请求造成重复块"
  - "快速滚动触发风暴请求"
mature_practices:
  - "维护游标与 in-flight 标志"
  - "触底防抖与最大并发"
anti_patterns:
  - "每次滚动到底无节流连续请求"
  - "重复 append 相同页"
injection:
  plan: "定义触底阈值、最大预取深度与错误重试。"
  coding: "将 fetch-next 与列表 reducer 隔离，合并重复 key。"
  review: "检查快速滑动与网络抖动。"
  test: "乱序返回块时顺序正确。"
verification:
  - "无重复 key 警告"
  - "快速滚动不会无限触发请求"
evidence:
  - "../../evidence/kibana/kibana-list-perf-001.md"
  - "../../evidence/kibana/kibana-list-perf-002.md"
confidence: medium
---

## 经验解释

该条目针对「列表与无限滚动需要受控的增量加载与背压」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：需要无限滚动或懒加载更多。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
