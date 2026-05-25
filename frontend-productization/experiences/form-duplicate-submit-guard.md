---
id: form-duplicate-submit-guard
title: 表单提交飞行中必须阻止重复提交并显式 pending
category: frontend-productization
tags:
  - form
  - submit
  - duplicate
  - pending
  - mutation
risk_severity: high
triggers:
  - 表单含保存/创建/提交按钮且触发异步 mutation
  - 用户可能在网络慢时连点 Save 或 Enter 重复提交
  - 写操作可能导致重复创建或竞态写入
risks:
  - 连点导致重复创建记录或重复 side effect
  - 提交中按钮仍可点击，用户误以为未响应而再次提交
  - 并发 mutation 造成状态错乱或后写覆盖先写
mature_practices:
  - 提交飞行中禁用主操作按钮并显示 saving/pending 视觉反馈
  - 从表单上下文读取 saving 状态，而非各按钮各自维护布尔量
  - 文档层约定提交与保存按钮的 pending 交互契约
anti_patterns:
  - 仅依赖 onClick 内 if (!loading) 而无 UI 禁用
  - 提交中仍允许键盘 Enter 触发第二次 submit
  - 多个 Save 入口不同步 pending 状态
injection:
  plan: 列出所有写操作入口（按钮、快捷键、自动保存）及 pending 期间的可交互范围。
  coding: 主提交控件绑定 mutation/form saving 状态；pending 时 disabled + 进度指示；必要时 debounce 或 ignore 重复 handler 调用。
  review: 检查慢网络 mock 下连点是否仅产生一次 mutation；Enter 与按钮是否共享同一 guard。
  test: 节流网络 + 快速连点 Save/Enter；断言仅一次 API 调用且按钮在响应前保持 disabled。
verification:
  - mutation 进行中主提交按钮 disabled 且可见 pending 反馈
  - 快速连点或重复 Enter 不产生第二次写请求
  - 提交完成或失败后按钮恢复可交互且状态与表单一致
evidence:
  - ../../evidence/react-admin/form-dup-guard-001.md
  - ../../evidence/react-admin/form-dup-guard-002.md
confidence: medium
---

## 经验解释

CRUD 表单的 Save/Create 按钮是最常见的写操作入口。若未在 mutation 飞行中锁定交互，慢网络下用户连点会产生重复 POST、双建记录或竞态 patch——这是产品化缺陷而非「用户手快」。react-admin 在 Forms 文档中约定提交交互，并在 SaveButton 源码中从表单上下文读取 saving/pending 以禁用按钮，说明成熟框架默认把防重复提交作为一等表单契约。

## 适用边界

适用于触发远程 mutation 的创建/编辑表单、对话框内提交与多步向导的最终步。纯本地表单（无网络写操作）可弱化。不覆盖异步字段校验反馈（见 `form-async-validation-feedback`）或 mutation 失败后的回滚/重试策略（见 `form-submit-recovery`）。

## 成熟实践归纳

文档层描述保存按钮与提交生命周期；组件层 SaveButton 绑定 `saving`/`isSubmitting`，在 pending 时 disabled 并可选展示 spinner。所有提交入口应共享同一 pending 源，避免按钮 disabled 但 Enter 仍可触发第二次 submit。

## 验收提示

Mock 3s 延迟的 create/update：连点 Save 仅见一次 network write；pending 期间按钮 disabled 且有 loading 指示；完成后恢复。若存在 GitLab 类 MR 表单参考，提交中亦应防双 spinner 与连点（备份证据见 registry `B-gl-form-1`）。
