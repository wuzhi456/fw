---
id: form-submit-recovery
title: 表单提交失败须按 mutation 模式可恢复或回滚
category: frontend-productization
tags:
  - form
  - submit
  - mutation
  - rollback
  - error-recovery
risk_severity: high
triggers:
  - 表单 submit 触发 create/update/delete mutation
  - 需要 optimistic、undoable 或 pessimistic 等不同提交语义
  - 服务端 4xx/5xx 或网络中断后用户需继续编辑或重试
risks:
  - 乐观更新失败后 UI 仍显示已成功数据
  - mutationMode 误用导致缓存与表单状态不一致且难回滚
  - 422 校验错误未清理其他字段，用户不知哪些仍有效
  - 失败后无重试/保留草稿路径，用户丢失输入
mature_practices:
  - 显式选择 pessimistic/optimistic/undoable mutationMode 并文档化语义
  - 乐观更新失败时回滚缓存或重新 fetch 权威实体
  - 将服务端 validation errors 映射回表单字段，保留未出错字段值
  - 非校验类失败提供重试或保留编辑态，而非静默关闭表单
anti_patterns:
  - 默认 optimistic 却不处理 onError 回滚
  - 失败后清空整个表单或关闭对话框而不解释原因
  - 列表 optimistic patch 合并错误导致字段变 undefined
injection:
  plan: 定义每种写操作的 mutationMode、失败时 UI 状态、422 vs 5xx 分支与是否保留用户输入。
  coding: onError 回滚/query invalidate；422 走字段映射；5xx/网络错误保留表单并 expose retry。
  review: 检查 optimistic 路径失败是否恢复旧数据；422 是否仅标记相关字段。
  test: mock optimistic 成功再失败、422 部分字段错误、断网重试三类夹具。
verification:
  - optimistic 失败后面板/列表数据回到提交前或 refetch 权威值
  - 422 时出错字段有 inline 错误，其他字段值保留
  - 可恢复错误下用户可重试 submit 而不必重新填写全部
evidence:
  - ../../evidence/refine/form-submit-recover-001.md
  - ../../evidence/refine/form-submit-recover-002.md
confidence: high
---

## 经验解释

表单提交不仅是「发请求」，还涉及 mutation 语义： pessimistic 等服务器确认、optimistic 先改 UI、undoable 给撤销窗口。若模式与错误处理不匹配，用户会看到「已保存」的假象，或 PR #3657 类 bug——乐观列表合并错误把未改字段写成 undefined。refine 在 useUpdate 文档中解释 mutationMode 与缓存回滚，并用修复 optimistic list 的 PR 证明失败路径必须可恢复。

## 适用边界

适用于含远程写操作且可能 optimistic/缓存更新的表单与 inline 编辑。只读表单或无客户端缓存的简单 POST 可弱化 pessimistic 即可。不覆盖字段级 async validate（见 `form-async-validation-feedback`）或提交中防连点（见 `form-duplicate-submit-guard`）。

## 成熟实践归纳

文档层定义 mutationMode 三态及 onSuccess/onError 钩子职责；实现层 optimistic 必须配对 rollback/invalidate；PR 级修复说明列表 optimistic patch 需 merge 完整 entity 而非 partial undefined。422 与 5xx 应分支：前者字段级、后者保留输入 + 重试。

## 验收提示

Mock optimistic update 后 API 500：UI 回滚至旧值或 refetch；mock 422 仅 email 字段错：password 等保留；断网后 retry 成功且不丢未提交修改。对照 useUpdate 文档检查所选 mutationMode 与 onError 是否与产品预期一致。
