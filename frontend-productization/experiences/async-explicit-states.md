---
id: async-explicit-states
title: 异步请求必须显式建模用户可感知状态
category: frontend-productization
tags:
  - async
  - request
  - loading
  - error
  - empty-state
risk_severity: high
triggers:
  - 页面需要从 API 加载数据
  - 列表或详情页首屏拉取远程记录
risks:
  - 慢请求期间界面无反馈
  - 空数据被误认为系统故障
  - 请求失败被渲染成空白列表
mature_practices:
  - 区分 loading、success、error、empty
  - 列表与详情在容器层集中分支，再渲染业务子树
  - 为错误提供可读文案与重试或返回入口
anti_patterns:
  - 只渲染成功路径数据
  - 用空白屏代替加载态
  - 在 data/record 未定义时直接访问字段
injection:
  plan: 在计划中写明列表/详情请求的 loading、empty、error、retry 行为与文案。
  coding: 用有限状态或 discriminated union 建模请求状态，容器组件先处理 error/empty/loading 再渲染 children。
  review: 检查是否仍存在仅假设数据已到达的分支，以及 error 与 empty 是否混用。
  test: 用慢网络、失败响应、空数组三种夹具覆盖列表与详情 UI 行为。
verification:
  - 慢请求时出现 skeleton 或明确加载提示
  - 空列表有说明性 empty state，且与 error 态视觉/文案可区分
  - 失败时可重试或返回上一步
evidence:
  - ../../evidence/react-admin/async-explicit-states-001.md
  - ../../evidence/react-admin/async-explicit-states-002.md
  - ../../evidence/react-admin/async-explicit-states-003.md
confidence: medium
---

## 经验解释

后台类界面大量依赖远程列表与详情接口。若只实现 success path，用户在慢网络、权限失败或 genuinely 空数据时会看到空白屏、旧数据或误导性「无结果」——这些都不是样式问题，而是未把异步结果建模为用户可感知状态的产品化缺陷。react-admin 在 List/Show 文档与 ListView/ShowView 实现中把 loading、error、empty 提升为一等 props 与分支，说明成熟框架默认要求外显这些状态。

## 适用边界

适用于从 API 加载列表或详情的 CRUD/管理页。纯静态展示、本地 mock 无网络、或数据已在 SSR 保证就绪且不再刷新的页面可弱化，但仍建议保留 error 兜底。本条目不覆盖竞态取消（见 `async-stale-cancel`）或全局重试策略（见 `async-retry-recover`）。

## 成熟实践归纳

文档层约定 `loading` / `error` / `empty` / `emptyWhileLoading` 等扩展点；视图层在容器内用 `isPending`、`errorState` 与 empty 判定（如无 filter 且 total===0）互斥分支，再渲染 Datagrid 或 ShowLayout。这样业务字段组件不必重复处理「数据是否已到」。

## 验收提示

对照 `verification`：人为节流或 mock 慢请求，确认首屏有加载反馈；mock 4xx/5xx 时展示 error 而非 empty；mock 空数组且无筛选时展示 empty 文案。详情页切换 id 时，在 record 未返回前不得访问 `record.field`。
