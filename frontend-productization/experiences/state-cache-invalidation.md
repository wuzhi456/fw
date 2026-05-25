---
id: state-cache-invalidation
title: 变更后缓存失效范围应精确且可预测
category: frontend-productization
tags:
  - state
  - cache
  - invalidation
  - query
  - refetch
risk_severity: medium
triggers:
  - mutation 成功后需刷新列表/详情/仪表板多卡片
  - 多组件共享底层 query key 或 resource 维度缓存
  - 级联删除、批量更新或表单提交影响多个视图
risks:
  - invalidate 过宽导致全局 refetch 与界面抖动
  - invalidate 过窄导致脏读、旧 KPI 或列表项残留
  - 失效策略散落魔法字符串，难以预测副作用
mature_practices:
  - 按 entity/resource 与 query key 维度精确 invalidate
  - mutation 成功路径与 useForm/useUpdate 钩子统一调用 invalidate helpers
  - 文档化哪些 mutation 失效哪些 queries，避免 invalidate all
anti_patterns:
  - 任何写操作都 invalidate 全部 queries
  - mutation 成功却忘记失效导致仪表板卡片显示旧数据
  - 失效范围与 mutation 影响面无映射表
injection:
  plan: 画出实体关系图与 query key 命名规则；标注每种 mutation 的 invalidate 范围。
  coding: 封装 invalidate helpers；mutation onSuccess 按 resource/id 失效；禁止散落魔法字符串。
  review: 检查级联变更是否遗漏关联 query；无关卡片请求量是否异常上升。
  test: 变更后相关列表/统计在单次刷新内一致；无关组件不触发多余 refetch。
verification:
  - 更新后相关列表/统计在单次刷新内与服务器一致
  - 无关组件请求量不明显上升
  - invalidate 调用点可追溯到 mutation 类型与影响面
evidence:
  - ../../evidence/refine/mutation-invalidation-001.md
  - ../../evidence/refine/mutation-invalidation-002.md
confidence: medium
---

## 经验解释

客户端 query cache 让列表/仪表板更快，但 mutation 后若失效范围随意，要么全局 refetch 造成抖动，要么漏失效留下脏读。refine `useInvalidate` 文档说明按资源维度失效与可选 refetch；`useForm` 等 mutation 钩子文档将 invalidate 与 mutationMode、服务器往返绑定，要求把失效策略写进成功路径而非事后补刷。

## 适用边界

适用于多视图共享 query cache 的管理后台、仪表板、资源 CRUD。单页无缓存或每次 mutation 后全页 hard reload 的场景可弱化。不覆盖 optimistic 失败回滚（见 `state-optimistic-rollback`）或乱序响应丢弃（见 `state-stale-response-guard`）。

## 成熟实践归纳

成熟项目把 invalidate 当作 mutation 契约的一部分：文档定义 hook 级失效粒度，实现层用 helpers 避免过宽/过窄。评审时应对照「该 mutation 影响哪些 queries」清单，而非假设 React Query 会自动猜对范围。

## 验收提示

执行 create/update/delete 后，相关列表与统计卡片应更新而无关区域不抖动；grep invalidate 调用是否集中封装。对照 useInvalidate 文档检查 resource/id/filter 参数是否与实体关系一致。
