---
name: extract-experience
description: >-
  Research-grade experience extraction skill package with traceable evidence, audit flow,
  and registry outputs for the P1 frontend productization corpus.
argument-hint: "[project | risk-class | source-type]"
version: "1.0.0"
user-invocable: true
allowed-tools: Read, Write, Edit, Bash
---

> **语言 / Language**: 默认中文回复；若用户明确要求英文，再切换英文。

# Skill: extract-experience

## 目标

将经验抽取流程标准化为**可复现、可审计、可扩展**的研究型资产包，形成证据链、抽取流程和案例。

## 触发条件

当用户出现以下诉求时启动：

- 从指定仓库/产品抽取前端产品化经验。
- 补充候选经验、证据记录或 EU 草稿。
- 审计或裁决候选经验（合并 / 新增 / 暂停 / 冲突）。
- 更新 evidence-audit-table 或 case studies。

不用于纯观点输出或没有可追溯证据来源的泛讨论。

---

## 工具使用规则

| 任务 | 使用工具 |
|------|----------|
| 读取现有经验、证据、规范 | `Read` |
| 更新 candidate registry / EU / case study | `Write` / `Edit` |
| 批量证据审计（需要时） | `Bash` → `python3 scripts/apply_evidence_audit.py` |
| 校验 experience-index / evidence 路径 | `Bash` → `python3 scripts/validate_frontend_productization_skill.py` |

---

## 抽取输入规范

抽取必须声明以下输入维度：

- **项目**：来源仓库/产品（如 react-admin / refine / kibana）。
- **风险类**：六类冻结风险（async / list / form / state / ux / responsive）。
- **source type**：docs / code / issue / pull_request / test / commit。
- **检索范围**：检索 query、范围（模块/目录/issue 搜索区间）与采样上限。

## 抽取输出规范

每次抽取产出以下结构化结果：

1. **candidate experience**：可复用的候选经验摘要（带风险类与触发条件）。
2. **evidence record**：对候选经验的可追溯证据（按 `evidence-schema.md`）。
3. **Experience Unit (EU) draft**：结构化经验单元草稿。
4. **audit decision**：合并/新增/暂停/冲突裁决及其依据。

---

## 主流程：抽取 → 审计 → 固化

### Step 1：定义范围

确认项目、风险类、source type、检索范围与采样上限。

### Step 2：来源检索

扫描代码/文档/issue/PR，提取可复用主张并保留原始上下文。

### Step 3：候选经验整理

形成 candidate experience，标注触发条件、适用范围与风险类。

### Step 4：证据记录

建立 evidence record（含 immutable_ref、可复现路径与摘要）。

### Step 5：EU 草稿

将候选经验整理为 EU draft，并与现有 EU 对齐/去重。

### Step 6：审计裁决

基于证据强度与冲突裁决规则，决定 merge / add / park / conflict。

### Step 7：登记与沉淀

更新 candidate registry、evidence-audit-table、case study（如需要）。

### Step 8：校验

如果更新了 experience-index 或 evidence 路径，运行校验脚本并修正问题。

---

## 固化抽取流程（摘要）

```text
Code source scan
-> candidate claim
-> evidence record
-> Experience Unit draft
-> validation
-> merge / add / park / conflict
```

## Evidence strength 定义

- **strong**：证据直接编码该经验（强一致、可复现）。
- **partial**：证据部分覆盖该经验（需要解释）。
- **weak**：仅背景相关，无法独立支撑。
- **needs-replacement**：审计后确认需替换或补强。

## 经验裁决规则

- **merge**：候选经验已被 EU 覆盖或可合并。
- **add**：候选经验满足证据强度阈值，应新增 EU。
- **park**：证据弱、范围漂移或当前批次不纳入 MVP。
- **conflict**：多条候选经验冲突，需要裁决或拆分。

### 冲突裁决要素

依次考虑：

1. **evidence strength**：优先保留证据更强、可复现的主张。
2. **risk severity**：同等证据下优先覆盖高风险情形。
3. **specificity**：优先选择触发条件更具体、边界更清晰的经验。
4. **stage fit**：优先匹配当前抽取阶段/使用阶段的经验（如 plan/review/test）。

---

## 质量门槛与记录

- evidence record 必须完整、可追溯，并遵循 `evidence-schema.md`。
- candidate / EU 必须绑定证据并标注证据强度。
- 若证据强度变更，必须同步更新 evidence-audit-table。
- experience-index 或 evidence 路径变更后必须通过校验脚本。

## 资产目录

```text
extract-experience/
├─ SKILL.md
├─ evidence-audit-table.md
├─ candidate-registry.md
└─ case-studies/*.md
```

证据文件统一位于仓库根目录 `evidence/<project>/`，与本 Skill 目录保持相对引用关系。

## 参考

- `evidence-schema.md`
- `experiment-protocol.md`
