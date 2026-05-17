# Case study: form-duplicate-submit-guard

## 链路概览

evidence → candidate claim → Experience Unit → audit decision

## Evidence

- `evidence/react-admin/form-dup-guard-001.md`：表单文档说明提交与保存交互，提示重复提交风险。
- `evidence/react-admin/form-dup-guard-002.md`：SaveButton 通过 saving/pending 状态禁用按钮。

## Candidate claim

在 mutation 进行中必须阻止重复提交，并让提交按钮显式反映 pending 状态，避免双建与竞态写入。

## Experience Unit draft

- EU：`frontend-productization/experiences/form-duplicate-submit-guard.md`
- 触发：表单提交、保存按钮、异步 mutation。
- 风险：重复提交、重复创建、状态错乱。
- 成熟实践：pending 时禁用按钮/显示进度，提交完成后恢复交互。

## Audit decision

- evidence strength：**partial**（文档 + 代码，覆盖可操作实现但仍需跨项目验证）。
- decision：**keep**（继续保留在 EU 集合中，后续优先补充来自非 react-admin 的强证据）。
