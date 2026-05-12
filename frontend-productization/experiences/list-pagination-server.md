---





id: list-pagination-server
title: "大数据列表应默认走服务端分页与稳定排序"
category: frontend-productization
tags:
  - "list"
  - "pagination"
  - "performance"
risk_severity: high
triggers:
  - "列表可能超过单页合理渲染量"
risks:
  - "一次拉全量导致卡顿或内存飙升"
  - "排序在客户端与服务器不一致"
mature_practices:
  - "使用 limit/offset 或 cursor"
  - "排序字段与索引策略在 API 层明确"
anti_patterns:
  - "useEffect 拉取全部记录再 slice"
  - "无总数字段导致分页控件不可用"
injection:
  plan: "确定分页模型、默认 pageSize、排序字段与空页行为。"
  coding: "列表查询参数与 URL 或状态管理同步，支持深链接。"
  review: "检查边界：第一页、最后一页、变更筛选后页码重置。"
  test: "大页码与空页请求的行为。"
verification:
  - "仅请求当前页数据"
  - "切换排序后数据与表头一致"
evidence:
  - "../../evidence/react-admin/list-pagination-001.md"
  - "../../evidence/react-admin/list-pagination-002.md"
confidence: medium
---

## 经验解释

该条目针对「大数据列表应默认走服务端分页与稳定排序」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：列表可能超过单页合理渲染量。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
