# A 任务执行说明（Experience Extraction Owner）

本文档说明我已完成的 A 任务工作、对应要求，以及每一项任务涉及的文件操作。

> 说明：未修改「Viable Options」D 项。

## 一、A 任务要求与完成情况清单

### 1) 新建 extract-experience skill 资产包（已完成）

**任务要求**
- 新增 `extract-experience/` 目录与以下文件：
  - `extract-experience/SKILL.md`
  - `extract-experience/case-studies/*.md`（至少 1 个案例）
  - `extract-experience/evidence-audit-table.md`
  - `extract-experience/candidate-registry.md`
- `SKILL.md` 必须包含：
  - 抽取输入/输出规范
  - 固化抽取流程
  - evidence strength 定义
  - 经验裁决规则（merge/add/park/conflict）
  - 冲突裁决要素
  - 经验登记流程

**我做了什么**
- 创建了完整的 `extract-experience` 资产包，并补齐所有必填规范。

**文件操作**
- 新增：`extract-experience/SKILL.md`
- 新增：`extract-experience/evidence-audit-table.md`
- 新增：`extract-experience/candidate-registry.md`
- 新增：`extract-experience/case-studies/form-duplicate-submit-guard.md`

---

### 2) 完成 Evidence Audit（已完成）

**任务要求**
- 产物：`extract-experience/evidence-audit-table.md`
- 覆盖现有 **18** 条 Experience Units
- 标注 evidence strength + action（keep/replace/downgrade/merge）
- 重点处理低置信度 EU：
  - `ux-error-boundary-granularity`
  - `ux-fallback-recoverable-errors`

**我做了什么**
- 在审计表中覆盖 18 条 EU，标注证据强度与动作；对低置信度 EU 标记为 `replace` 并说明原因。

**文件操作**
- 新增：`extract-experience/evidence-audit-table.md`

---

### 3) 完成候选经验维护登记表（已完成）

**任务要求**
- 产物：`extract-experience/candidate-registry.md`
- 每条候选经验必须包含：
  - risk class
  - triggers
  - failure mode
  - decision（merge/add/park/conflict）
  - conflict 说明（如有）

**我做了什么**
- 建立候选经验登记表，逐条补全字段并标注裁决。

**文件操作**
- 新增：`extract-experience/candidate-registry.md`

---

### 4) 完成 1 个完整 Extraction Case Study（已完成）

**任务要求**
- 产物：`extract-experience/case-studies/*.md`
- 必须展示链路：evidence → claim → Experience Unit → audit decision

**我做了什么**
- 选用 `form-duplicate-submit-guard`，展示证据到 EU 的完整链路与审计结论。

**文件操作**
- 新增：`extract-experience/case-studies/form-duplicate-submit-guard.md`

---

### 5) 更新 P1 相关产物（证据与候选经验）（已完成）

**任务要求**
- `experience-candidates.md`
  - ≥30 条候选经验
  - 六类问题每类 ≥3 条
  - 每条候选经验至少 1 条 evidence
- `extraction-notes.md`
  - 每批次必须记录：检索 query、范围、采样上限、入选理由、排除理由
- `evidence/` 记录补充

**我做了什么**
- 更新候选经验表风险类标注为六类（async/list/form/state/ux/responsive）。
- 补充 Kibana 错误边界证据以支撑低置信度 EU。
- 扩展批次记录，加入入选/排除理由列。

**文件操作**
- 修改：`experience-candidates.md`（风险类统一 + 证据链接更新）
- 修改：`extraction-notes.md`（新增 include_reason / exclude_reason）
- 新增：`evidence/kibana/kibana-error-boundary-003.md`

---

## 二、总体变更文件清单（路径）

**新增文件**
- `extract-experience/SKILL.md`
- `extract-experience/evidence-audit-table.md`
- `extract-experience/candidate-registry.md`
- `extract-experience/case-studies/form-duplicate-submit-guard.md`
- `evidence/kibana/kibana-error-boundary-003.md`
- `A-task-summary.md`（本文档）

**修改文件**
- `experience-candidates.md`
- `extraction-notes.md`

