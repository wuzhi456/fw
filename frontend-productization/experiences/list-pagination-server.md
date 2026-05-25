---
id: list-pagination-server
title: 大数据列表应默认走服务端分页与稳定排序
category: frontend-productization
tags:
  - list
  - pagination
  - performance
  - server-side
risk_severity: high
triggers:
  - 列表可能超过单页合理渲染量
  - 后端 API 支持 limit/offset 或 cursor 但未在前端接入
  - 分页控件需要 total 或 hasNext 才能正确跳页
risks:
  - 一次拉全量导致卡顿或内存飙升
  - API 未返回 total 时分页控件错位或末页不可用
  - 排序在客户端与服务器不一致，翻页后表头与数据不匹配
mature_practices:
  - 使用 limit/offset 或 cursor，仅请求当前页 slice
  - 服务端返回稳定 total 或明确的 hasNext/hasPrevious
  - 筛选/排序变更时重置 page 并同步 URL 或 query key
anti_patterns:
  - useEffect 拉取全部记录再客户端 slice
  - 无 total 仍渲染完整 Pagination 导致跳页异常
  - 切换 sort 后不重置 page，出现空页或重复数据
injection:
  plan: 确定分页模型、默认 pageSize、排序字段、total 契约与筛选变更时的页码重置规则。
  coding: 列表查询参数与 dataProvider/API 同步；Pagination 绑定 total；禁止全量 fetch 后 slice。
  review: 检查边界：第一页、最后一页、缺 total 降级、变更筛选后页码重置。
  test: 大页码、空页、缺 total 与 sort 切换后的数据/表头一致性。
verification:
  - 网络请求仅携带当前页 window（page/perPage 或 cursor）
  - 切换排序后列表数据与表头 sort 指示一致
  - 缺 total 时有明确降级 UX（cursor/hasNext 或禁用末页跳转）
evidence:
  - ../../evidence/react-admin/list-pagination-001.md
  - ../../evidence/react-admin/list-pagination-002.md
confidence: medium
---

## 经验解释

管理后台列表常默认「先拉全量再渲染」。当数据规模上来后，问题不仅是性能，还有**分页语义错误**：API 不提供 total 时 Pagination 无法计算末页；筛选变更后 page 未重置会出现空页或重复项。react-admin 在 List 文档与 List 控制器中把 total 与 query 分页状态作为一等契约，说明成熟框架默认服务端分页而非客户端 slice。

## 适用边界

适用于远程大数据列表、需要跳页/排序/筛选组合的管理页。本地小数据集（<100 条且不会增长）可简化。不覆盖虚拟化渲染（见 `list-virtualize-window`）或无限滚动背压（见 `list-incremental-prefetch`）。

## 成熟实践归纳

文档层定义 perPage/page/sort/filter/total 组合；控制器层将 query 状态与 Pagination 绑定，筛选变化时 reset page。API 层必须返回与当前 window 一致的 slice 及 total（或 cursor 等价物）。

## 验收提示

Mock 1000+ 条后端数据：DevTools 中仅见单页请求；改 sort 后首条记录与表头一致；mock 无 total 时 Pagination 行为符合设计的降级策略，不得出现可点的无效末页。
