---
id: state-stale-response-guard
title: 筛选上下文变化时必须丢弃不匹配响应
category: frontend-productization
tags:
  - state
  - stale
  - race
  - context
  - discover
risk_severity: high
triggers:
  - 搜索框、时间范围、数据视图或租户切换会改变查询上下文
  - Discover/列表并行或连续 fetch 可能乱序返回
  - 错误/空态需与当前查询绑定而非全局 toast
risks:
  - 旧响应覆盖新筛选结果，UI 与当前上下文不符
  - 用户基于过期或无关错误提示决策
  - 易忽略的 toast 在上下文切换后仍误导用户
mature_practices:
  - 为每次查询定义 query signature 或 request token，commit 前比对
  - 在 reducer/hook 层拒绝过期 action 或忽略乱序 promise
  - 错误与空态内联到当前视图 callout，与数据上下文绑定
anti_patterns:
  - 仅依赖最后一次 setState 竞态侥幸
  - 无上下文签名的 fetch 直接写 UI
  - 全局 toast 展示与当前筛选无关的错误
injection:
  plan: 为每次查询定义 query signature；列出时间范围/索引切换时的乱序验收场景。
  coding: hook 返回前比对 signature；AbortController 或 ignore stale flag；错误迁入与当前查询绑定的 callout。
  review: 检查快速改时间范围、切换 data view、连点搜索时的 UI 一致性。
  test: 模拟旧响应后到时被忽略；上下文切换后旧错误不再显示。
verification:
  - 任意时刻 UI 与当前筛选器/时间范围展示的数据一致
  - 快速切换上下文后无旧错误 toast 或 callout 残留
  - 乱序响应不会把 Discover/列表写回非当前查询结果
evidence:
  - ../../evidence/kibana/kibana-state-001.md
  - ../../evidence/kibana/kibana-state-002.md
confidence: high
---

## 经验解释

筛选上下文变化时，慢请求或并行 fetch 可能让**旧响应最后到达**，Discover 会短暂展示错误时间范围或索引下的数据/错误。Kibana #149488 将多次 fetch 错误从 toast 改为内联展示；#129020 把「无匹配索引」迁入与当前查询绑定的 callout——两者共同说明：state 层必须丢弃不匹配响应，并把反馈锚定在当前 query context。

## 适用边界

适用于搜索、时间范围、分页、数据视图/租户切换会重新 fetch 的分析页、列表、仪表板。静态页或 queryKey 已严格隔离且框架自动丢弃乱序的场景可弱化，但仍建议显式验收快速输入。与 `async-stale-cancel` 互补：后者偏 react-admin 列表竞态取消；本 EU 强调**查询上下文签名与 UI 反馈绑定**。

## 成熟实践归纳

Issue 级证据表明 mature 产品会把错误/空态从全局 toast 迁入与当前 Discover 上下文绑定的 inline/callout，并从 UX 角度等价于丢弃过期噪声。实现上需 request token 或 query signature，在 reducer/hook 层拒绝过期 commit。

## 验收提示

快速切换时间范围或 data view：UI 始终匹配最后一次筛选；mock 旧响应晚到应被忽略。检查错误是否出现在当前视图 callout 而非无关 toast。对照 #149488/#129020 验收上下文切换后旧提示是否清除。
