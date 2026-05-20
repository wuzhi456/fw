---





id: responsive-long-text-overflow
title: "长文本与标识符需要截断、换行或详情展开"
category: frontend-productization
tags:
  - "responsive"
  - "overflow"
  - "text"
risk_severity: medium
triggers:
  - "表格列含长 ID、URL、邮箱"
risks:
  - "布局被撑破"
  - "复制困难"
mature_practices:
  - "ellipsis + tooltip"
  - "可复制详情抽屉"
anti_patterns:
  - "nowrap 全表"
  - "无展开阅读全文路径"
injection:
  plan: "列出长文本字段的展示策略。"
  coding: "分离显示值与完整值；注意 RTL。"
  review: "检查表头与单元格对齐。"
  test: "极端长字符串不破坏布局。"
verification:
  - "长字段不导致页面级横向滚动"
  - "用户可查看完整内容"
evidence:
  - "../../evidence/kibana/kibana-overflow-001.md"
  - "../../evidence/kibana/kibana-overflow-002.md"
confidence: medium
---

## 经验解释

该条目针对「长文本与标识符需要截断、换行或详情展开」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：表格列含长 ID、URL、邮箱。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
