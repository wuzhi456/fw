---
name: extract-experience
description: >-
  Research-grade experience extraction skill package with traceable evidence, audit flow,
  and registry outputs for the P1 frontend productization corpus.
---

# Skill: extract-experience

目标：将经验抽取流程标准化为**可复现、可审计、可扩展**的研究型资产包，形成证据链、抽取流程和案例。

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

## 固化抽取流程

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

1. **evidence strength**
2. **risk severity**
3. **specificity**
4. **stage fit**

## 经验登记流程

1. 录入候选经验（candidate registry）。
2. 绑定证据记录并标注强度。
3. 生成 EU draft（或合并到现有 EU）。
4. 完成 audit decision 并记录冲突说明。
5. 更新 Evidence Audit Table 与 case study（如需）。

## 资产目录

```text
extract-experience/
├─ SKILL.md
├─ evidence-audit-table.md
├─ candidate-registry.md
└─ case-studies/*.md
```
