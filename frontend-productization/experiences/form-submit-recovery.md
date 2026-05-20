---





id: form-submit-recovery
title: "提交失败应保留用户输入并支持安全重试"
category: frontend-productization
tags:
  - "form"
  - "error"
  - "recovery"
risk_severity: high
triggers:
  - "多步表单或长表单"
risks:
  - "失败清空用户输入"
  - "用户不敢再次提交"
mature_practices:
  - "保留 draft 与服务器返回字段错误"
  - "区分网络错误与业务错误"
anti_patterns:
  - "失败后 reset 整个表单"
  - "无区分可恢复/不可恢复"
injection:
  plan: "定义失败时哪些字段保留、哪些从服务器覆盖。"
  coding: "错误对象映射到字段；全局 toast 仅作补充。"
  review: "检查部分成功（多资源）场景。"
  test: "模拟 422 字段错误与 500 网络错误。"
verification:
  - "422 时字段级错误保留其他已填内容"
  - "500 时提供重试且不丢草稿"
evidence:
  - "../../evidence/refine/form-submit-recover-001.md"
  - "../../evidence/refine/form-submit-recover-002.md"
confidence: high
---

## 经验解释

该条目针对「提交失败应保留用户输入并支持安全重试」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：多步表单或长表单。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
