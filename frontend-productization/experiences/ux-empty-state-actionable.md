---
id: ux-empty-state-actionable
title: 空数据状态应解释原因并给出下一步
category: frontend-productization
tags:
  - ux
  - empty-state
  - discover
  - guidance
  - search
risk_severity: medium
triggers:
  - 列表、Discover 或筛选结果可能为零条
  - 用户首次进入尚无数据的资源或索引
risks:
  - 空白表格被误认为系统故障
  - 用户不知道如何调整时间范围、筛选或创建数据
  - 错误态与真·无数据混用同一空白 UI
mature_practices:
  - 区分「无数据」「无匹配结果」与「请求错误」三种分支
  - 空状态提供标题、原因说明与主 CTA（改筛选、扩时间范围、创建资源）
  - 为常见空场景维护可复用 EmptyState 组件与 copy 变体
anti_patterns:
  - 只显示「0 results」或空白表格
  - 错误与 empty 共用同一组件且无视觉/文案差异
  - 空状态无任何可点击下一步
injection:
  plan: 为每类空场景（真无数据、筛选无匹配、权限/索引不可用）准备文案与 CTA 清单。
  coding: Empty 组件接收 context（no-data / no-match / error）；错误分支不走 empty 文案。
  review: 检查权限或索引缺失是否被误展示为「无结果」。
  test: 分别 mock 空数组、筛选零匹配、4xx/5xx，断言 UI 与 CTA 符合场景。
verification:
  - 空状态含标题、说明与至少一个主按钮或链接
  - 与 loading skeleton 和 error 态在视觉与文案上可区分
  - 无匹配时提示如何调整筛选或时间范围
evidence:
  - ../../evidence/kibana/kibana-empty-001.md
  - ../../evidence/kibana/kibana-empty-002.md
confidence: high
---

## 经验解释

搜索型界面最容易在「真的没有数据」与「查不到」之间让用户迷失。Kibana Discover 的 #128754 与 #79671 直接把无结果与错误拆成不同 message，并在无结果时建议调整时间范围、索引或筛选——这是把 empty state 当作 onboarding 而非占位符。若只渲染空表格，用户会反复刷新或提工单，而产品本可通过一句可操作建议自行恢复。

## 适用边界

适用于依赖查询/筛选且结果集可能为空的列表、Discover、搜索结果页。固定少量静态配置项、或 empty 即终态且无需引导的页面可简化。与 `async-explicit-states` 配合：loading/error 由容器处理，empty 组件专注「零条时的下一步」。

## 成熟实践归纳

用 props 或 discriminated union 区分 empty 原因；copy 针对场景（无索引数据 vs 筛选过严）；测试覆盖 error 与 empty 分支，避免 snapshot 掩盖文案回归。

## 验收提示

对照 `verification`：mock 空索引与过严 filter 两种夹具，确认文案与 CTA 不同；慢请求期间不出现 empty；API 失败时不展示「无结果」类引导。
