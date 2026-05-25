---
id: state-optimistic-rollback
title: 乐观更新必须可回滚且与权限一致
category: frontend-productization
tags:
  - state
  - optimistic
  - rollback
  - mutation
  - cache
risk_severity: high
triggers:
  - 列表/详情/仪表板卡片采用 optimistic mutation 先改 UI
  - mutation 失败、权限拒绝或补丁合并错误需恢复权威状态
  - 多资源共享 query cache 且写操作可能部分成功
risks:
  - 失败后 UI 仍显示已成功或字段被 undefined 覆盖
  - 乐观 patch 与服务器实体不一致且未 invalidate/refetch
  - 用户基于错误缓存继续操作或重复提交
mature_practices:
  - 显式选择 pessimistic/optimistic/undoable 并定义 onError 回滚或 refetch
  - 乐观 patch 合并完整 entity，避免 partial merge 把未改字段写成 undefined
  - 失败时 invalidate 相关 query 或 restore snapshot，而非仅 toast
anti_patterns:
  - 默认 optimistic 却无 onError 回滚路径
  - 列表项 optimistic update 只 patch 变更字段导致其余字段丢失
  - 失败后仍保留乐观 UI 等待用户手动刷新
injection:
  plan: 列出允许 optimistic 的操作清单、回滚数据源（snapshot/refetch/invalidate）与权限失败分支。
  coding: mutation onError 回滚 cache 或 refetch 权威实体；optimistic patch merge 完整 record；与 useUpdate mutationMode 文档语义一致。
  review: 检查 optimistic 失败是否恢复旧值；列表/卡片字段是否出现 undefined 闪变。
  test: mock optimistic 成功再 4xx/5xx；断言 UI 回到提交前或 refetch 后权威值。
verification:
  - optimistic 失败后面板/列表数据回到提交前或 refetch 权威值
  - 未变更字段在 optimistic patch 后不为 undefined
  - 权限/业务拒绝时 UI 不保留虚假成功态
evidence:
  - ../../evidence/refine/form-submit-recover-001.md
  - ../../evidence/refine/form-submit-recover-002.md
confidence: high
---

## 经验解释

乐观更新把「写成功」前置到 UI，但若失败路径未设计，用户会看到比 pessimistic 更糟的假象：列表字段变 undefined、卡片 KPI 与后台不符。refine useUpdate 文档定义 mutationMode 三态及回滚语义；PR #3657 修复 optimistic list merge 错误，说明 state 层必须把 rollback/invalidate 当作一等路径，而非表单专属细节。

## 适用边界

适用于含客户端 query cache 且可能 optimistic 更新的列表、详情、仪表板卡片。纯 pessimistic 写操作或无不共享 cache 的简单 POST 可弱化。不替代表单字段级 async validate（见 `form-async-validation-feedback`）或提交中防连点（见 `form-duplicate-submit-guard`）；与 `form-submit-recovery` 互补——本 EU 强调**缓存/UI 权威态回滚**，后者强调**表单输入保留与 422 映射**。

## 成熟实践归纳

文档层定义 mutationMode 与 onError 职责；PR 级修复表明 optimistic list patch 需 merge 完整 entity。失败时应 rollback snapshot、invalidate 相关 keys 或 refetch，使 UI 与服务器权威态一致，而非依赖用户刷新。

## 验收提示

Mock optimistic update 后 API 500：列表/卡片回滚至旧值或 refetch；检查 optimistic patch 是否保留未改字段；权限 403 后 UI 不显示已成功。对照 useUpdate 文档确认所选 mutationMode 与 onError 是否覆盖回滚。
