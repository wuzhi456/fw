---
id: state-optimistic-rollback
title: "乐观更新必须可回滚且与权限一致"
category: frontend-productization
tags:
  - "state"
  - "optimistic"
  - "mutation"
risk_severity: high
triggers:
  - "列表内联编辑或点赞类交互"
risks:
  - "失败仍显示成功"
  - "回滚后排序错乱"
mature_practices:
  - "先本地补丁，失败拉取权威状态"
  - "对不可逆操作避免乐观"
anti_patterns:
  - "无回滚路径"
  - "乐观更新跨分页边界未处理"
injection:
  plan: "列出允许乐观的操作清单与回滚数据源。"
  coding: "版本号或更新时间戳检测冲突。"
  review: "检查并发编辑与权限变更。"
  test: "失败路径 UI 与数据一致。"
verification:
  - "失败后在可接受时间内恢复与服务端一致"
  - "无不一致闪烁"
evidence:
  - "../../evidence/refine/mutation-invalidation-001.md"
  - "../../evidence/refine/mutation-invalidation-002.md"
confidence: high
---

## 经验解释

该条目针对「乐观更新必须可回滚且与权限一致」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：列表内联编辑或点赞类交互。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
