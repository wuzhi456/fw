---
name: extract-experience
description: >-
  Research-grade experience extraction skill package with traceable evidence, audit flow,
  and registry outputs for the P1 frontend productization corpus.
argument-hint: "[project] [risk_class] [source_type]"
version: "1.1.0"
user-invocable: true
allowed-tools: Read, Write, Edit, Bash
---

> **Language / 语言**: 本 Skill 默认使用中文。如果用户明确以英文提问，请全程用英文回应。
>
> **Execution Root / 执行根目录**: 所有 `Bash` 命令必须在当前 `SKILL.md` 所在目录执行，路径均视为相对路径。

# Skill: extract-experience

目标：将经验抽取流程标准化为**可复现、可审计、可扩展**的研究型资产包，形成证据链、抽取流程和案例。

---

## 触发条件

当用户说以下任意内容时启动：
- `/extract-experience`
- “抽取经验”
- “做经验沉淀/经验登记”
- “生成 Experience Unit”

如果宿主已显式传入参数，则以宿主参数为准。

---

## 工具使用规则

| 任务 | 使用工具 |
|------|---------|
| 读取本地文档/代码片段 | `Read` |
| 写入/更新 Registry 或 Audit 文件 | `Write` / `Edit` |
| 批量处理或脚本化整理 | `Bash` |

---

## 抽取输入规范

抽取必须声明以下输入维度：

- **项目**：来源仓库/产品（如 react-admin / refine / kibana）。
- **风险类**：六类冻结风险（async / list / form / state / ux / responsive）。
- **source type**：docs / code / issue / pull_request / test / commit。
- **检索范围**：检索 query、范围（模块/目录/issue 搜索区间）与采样上限。

> 如果缺少任何维度，必须先追问补齐，再进入抽取流程。

---

## 抽取输出规范

每次抽取产出以下结构化结果：

1. **candidate experience**：可复用的候选经验摘要（带风险类与触发条件）。
2. **evidence record**：对候选经验的可追溯证据（按 `evidence-schema.md`）。
3. **Experience Unit (EU) draft**：结构化经验单元草稿。
4. **audit decision**：合并/新增/暂停/冲突裁决及其依据。

---

## 固化抽取流程（主流程）

```text
Code/Doc/Issue Scan
-> Candidate Claim
-> Evidence Record
-> EU Draft
-> Validation
-> Merge / Add / Park / Conflict
-> Registry & Audit Update
```

---

## 证据强度（Evidence Strength）定义

- **strong**：证据直接编码该经验（强一致、可复现）。
- **partial**：证据部分覆盖该经验（需要解释）。
- **weak**：仅背景相关，无法独立支撑。
- **needs-replacement**：审计后确认需替换或补强。

---

## 经验裁决规则

- **merge**：候选经验已被 EU 覆盖或可合并。
- **add**：候选经验满足证据强度阈值，应新增 EU。
- **park**：证据弱、范围漂移或当前批次不纳入 MVP。
- **conflict**：多条候选经验冲突，需要裁决或拆分。

### 冲突裁决要素（优先级）

1. **evidence strength**：优先保留证据更强、可复现的主张。
2. **risk severity**：同等证据下优先覆盖高风险情形。
3. **specificity**：优先选择触发条件更具体、边界更清晰的经验。
4. **stage fit**：优先匹配当前抽取阶段/使用阶段的经验（如 plan/review/test）。

---

## 经验登记流程（资产固化）

1. 录入候选经验（candidate registry）。
2. 绑定证据记录并标注强度。
3. 生成 EU draft（或合并到现有 EU）。
4. 完成 audit decision 并记录冲突说明。
5. 更新 Evidence Audit Table 与 case study（如需）。

---

## 质量门槛（必须满足）

- **每条 candidate experience 至少 1 条 evidence record**。
- 若 evidence_strength = `weak`，不得直接 `add`。
- 若 action = `replace`，必须在同批次提供替换证据。
- 任何 `conflict` 必须给出冲突说明与裁决依据。

---

## 资产目录

```text
extract-experience/
├─ SKILL.md
├─ evidence-schema.md
├─ evidence-audit-table.md
├─ candidate-registry.md
└─ case-studies/*.md
```

---

## 常见失误（禁止）

- 只写结论不写 evidence record
- 证据来源不可追溯（无 URL / path / commit / issue id）
- 经验触发条件不清晰、不可复现
- conflict 未解释就直接 merge
- evidence_strength 被弱证据拖低但未补强
