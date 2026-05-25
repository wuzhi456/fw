---
id: list-incremental-prefetch
title: 列表与无限滚动需要受控的增量加载与背压
category: frontend-productization
tags:
  - list
  - infinite-scroll
  - prefetch
  - backpressure
risk_severity: high
triggers:
  - 无限滚动或「加载更多」替代传统分页
  - 字段列表/Discover 侧边栏等可能超大规模的下拉列表
  - 触底或 scroll 事件会触发连续 fetch
risks:
  - 无背压的预取导致请求风暴与 UI 抖动
  - 重复 fetch 错误触发 toast 风暴，掩盖真实失败原因
  - 全量 upfront load 阻塞首屏，慢 ES/大 mapping 时列表不可用
mature_practices:
  - 定义触底阈值、最大 in-flight 请求数与预取深度上限
  - 滚动分页加载 field/list slice，前缀搜索按需 fetch
  - 增量链路错误内联去重，慢响应时保持 reduced UI 而非整页空白
anti_patterns:
  - scroll 事件无 throttle 地无限 trigger loadMore
  - 每次 chunk 失败弹独立 toast
  - 一次性加载全部 field caps/records 再 pretend infinite scroll
injection:
  plan: 定义触底阈值、最大预取深度、并发 in-flight 上限与错误重试/降级策略。
  coding: loadMore 带 cursor/offset 与 dedupe key；合并 error state；in-flight 达上限时暂停预取。
  review: 检查快速滚动是否堆积并行请求；失败时是否 toast 风暴。
  test: 模拟慢 chunk、连续 fail、快速滚到底；断言请求数有界且错误可恢复。
verification:
  - 快速滚到底时 in-flight 请求不超过设定上限
  - 连续 fetch 失败时仅一处内联/汇总错误，无 toast 风暴
  - 首屏不阻塞于全量 field/list 加载；滚动才触发下一页
evidence:
  - ../../evidence/kibana/kibana-list-perf-001.md
  - ../../evidence/kibana/kibana-list-perf-002.md
confidence: high
---

## 经验解释

无限滚动不是「去掉 Pagination」这么简单。Kibana #134306 指出 field list 全量 upfront load 在 mapping 爆炸或 ES 慢时拖死 UI，提出 scroll 分页与前缀加载；PR #152311 则修复 Discover 多次 fetch 的 toast 风暴，改为内联错误——两者分别覆盖**预取策略**与**错误背压**。failure mode 与 `list-pagination-server`（跳页/total）和 `list-virtualize-window`（DOM freeze）互不重叠。

## 适用边界

适用于 load-more/infinite scroll 字段列表、Discover 类增量结果流。传统页码分页且每页独立请求的场景优先用 `list-pagination-server`。纯虚拟化静态数组（无后续 fetch）不适用。

## 成熟实践归纳

Issue 层定义 lazy/paginated field load 与 graceful degradation；PR 层定义多段 fetch 的错误反馈去重。组合实践：cursor 分页 + in-flight 上限 + 内联 error，避免请求与通知双双失控。

## 验收提示

Throttle 网络并快速 scroll 到底：并行请求数 ≤ 计划上限；注入连续 500 时 toast 计数不随 chunk 线性增长；首屏 field/list 请求 payload 明显小于全量 caps（或仅加载首屏 window）。
