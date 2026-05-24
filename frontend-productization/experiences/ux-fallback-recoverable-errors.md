---





id: ux-fallback-recoverable-errors
title: "可恢复错误应通过非阻塞反馈呈现"
category: frontend-productization
tags:
  - "toast"
  - "error-ux"
risk_severity: low
triggers:
  - "后台保存、自动同步"
risks:
  - "模态错误打断心流"
  - "用户忽略关键失败"
mature_practices:
  - "非阻塞 toast + 重试"
  - "关键失败再用 modal"
anti_patterns:
  - "所有错误 modal"
  - "toast 堆叠不可读"
injection:
  plan: "分级错误呈现策略表。"
  coding: "统一错误序列化与去重。"
  review: "检查可达性与自动消失时间。"
  test: "连续错误不丢失第一条关键信息。"
verification:
  - "次要错误不阻塞主任务"
  - "关键错误仍可获得足够注意"
evidence:
  - "../../evidence/gitlab/gitlab-ux-recoverable-errors-001.md"
  - "../../evidence/gitlab/gitlab-ux-recoverable-errors-002.md"
confidence: medium
---

## 经验解释

该条目针对「可恢复错误应通过非阻塞反馈呈现」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：后台保存、自动同步。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
