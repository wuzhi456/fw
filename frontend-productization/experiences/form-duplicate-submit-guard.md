---





id: form-duplicate-submit-guard
title: "表单提交必须防重复点击与重复 mutation"
category: frontend-productization
tags:
  - "form"
  - "mutation"
  - "duplicate-submit"
risk_severity: high
triggers:
  - "创建/支付/审批等写操作"
risks:
  - "双次提交产生重复记录"
  - "重复扣费或副作用"
mature_practices:
  - "pending 时禁用提交控件"
  - "幂等键或服务端去重配合"
anti_patterns:
  - "仅依赖用户不会连点"
  - "无提交中视觉反馈"
injection:
  plan: "写清幂等策略：前端防抖、后端 token 或自然键约束。"
  coding: "用状态机锁定 submitting；按钮 aria-busy。"
  review: "检查键盘重复提交与双击。"
  test: "连点三次只产生一次有效请求或受控错误。"
verification:
  - "提交中按钮不可用且有视觉态"
  - "网络慢时不会重复 POST"
evidence:
  - "../../evidence/react-admin/form-dup-guard-001.md"
  - "../../evidence/react-admin/form-dup-guard-002.md"
confidence: medium
---

## 经验解释

该条目针对「表单提交必须防重复点击与重复 mutation」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：创建/支付/审批等写操作。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
