---
id: form-async-validation-feedback
title: 异步校验必须显式反馈每字段 pending 与错误
category: frontend-productization
tags:
  - form
  - validation
  - async
  - field-error
  - server-side
risk_severity: high
triggers:
  - 字段需远程唯一性、权限或业务规则校验
  - 服务端返回字段级 422/validation errors
  - 使用 react-hook-form 等支持 async validate 的表单库
risks:
  - 远程校验进行中用户不知等待原因而重复编辑或提交
  - 服务端错误未映射到字段，用户看不到 actionable 反馈
  - 校验请求风暴（每 keystroke 打满 API）导致卡顿
mature_practices:
  - 为每字段建模 validating/pending 与 error 状态并在 UI 展示
  - 将服务端 validation payload 映射到字段级 helperText/error
  - 对远程校验 debounce/throttle，避免 keystroke 风暴
  - 官方示例覆盖 server-side validation 与提交流程
anti_patterns:
  - 仅 console 打印校验错误而不更新字段 UI
  - 异步校验无 loading 指示，用户误以为表单卡死
  - 提交失败后不清除或混淆其他字段已有错误
injection:
  plan: 列出需远程校验的字段、debounce 策略、服务端错误结构与字段映射规则。
  coding: 使用库原生 async validate + fieldState；服务端错误 normalize 到字段；校验中显示 inline pending。
  review: 检查远程校验时是否有 per-field 反馈；422 是否精确落到触发字段而非全局 toast 了事。
  test: mock 慢校验与 422 响应；确认 pending 可见、错误可定位、连打键不会触发校验风暴。
verification:
  - 远程校验进行中目标字段有 validating/pending 指示
  - 服务端字段错误出现在对应输入旁且文案可读
  - debounce 后校验请求次数受控（非每键一次）
evidence:
  - ../../evidence/refine/form-async-validation-001.md
  - ../../evidence/refine/form-async-validation-002.md
confidence: high
---

## 经验解释

现代后台表单常需「用户名是否占用」「SKU 是否合法」等远程规则。若只实现同步 required 校验，异步路径要么缺失要么错误只出现在 console——用户在提交前看不到字段级反馈，或在校验飞行中反复修改触发 API 风暴。refine 通过 Issue #2955 追踪 MUI 服务端校验示例缺口，并在 useForm 文档中描述 async validate 与字段错误呈现，说明成熟框架把远程校验视为需显式 UX 的一等路径。

## 适用边界

适用于含远程/服务端校验的创建编辑表单、inline 编辑与 wizard 步骤。纯本地 regex/required 表单可简化。不覆盖提交按钮防连点（见 `form-duplicate-submit-guard`）或 mutation 乐观更新回滚（见 `form-submit-recovery`）。

## 成熟实践归纳

框架文档与 hook 集成层约定：async validator 返回字段 error；`formState.isValidating` 或字段级 validating 驱动 spinner/helper；服务端 422 经 adapter 映射到 `setError` 或等价 API。示例与文档应覆盖「校验中—失败—修正—再提交」完整闭环。

## 验收提示

对需远程唯一性的字段：输入后见 debounced 请求与 validating 指示；mock 冲突响应时错误紧贴字段；快速连打键时 network 面板请求数符合 debounce 设计。对照 refine useForm 文档检查 server-side validation 路径是否在你的 stack 中有等价实现。
