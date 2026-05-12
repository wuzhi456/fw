---
id: state-cache-invalidation
title: "变更后缓存失效范围应精确且可预测"
category: frontend-productization
tags:
  - "state"
  - "cache"
  - "invalidation"
risk_severity: medium
triggers:
  - "仪表板多卡片共享底层查询"
risks:
  - "过宽失效导致全局 refetch"
  - "过窄失效导致脏读"
mature_practices:
  - "按实体与查询键维度失效"
  - "批量变更用事务式 invalidation"
anti_patterns:
  - "任何 mutation 都 invalidate all"
  - "忘记失效导致旧 KPI"
injection:
  plan: "画出实体关系图与查询键命名规则。"
  coding: "封装 invalidate helpers，禁止魔法字符串散落。"
  review: "检查级联删除、多标签页场景。"
  test: "变更后相关卡片更新、无关卡片不抖动。"
verification:
  - "更新后相关列表/统计在单次刷新内一致"
  - "无关组件请求量不明显上升"
evidence:
  - "../../evidence/refine/mutation-invalidation-001.md"
  - "../../evidence/kibana/kibana-state-001.md"
confidence: medium
---

## 经验解释

该条目针对「变更后缓存失效范围应精确且可预测」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：仪表板多卡片共享底层查询。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
