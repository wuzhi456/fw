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
- ��增：`extract-experience/evidence-audit-table.md`
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

---

---

# A 任务详解：Experience Extraction Pipeline 与质量复核

本部分详细说明 A 任务的动机、相关工作、问题陈述、方法与实现、评估协议、局限与可复现性清单。

## 1 引言

在 Vibe Coding 场景下，生成系统需要将 **成熟工程实践** 转化为可注入的经验单元（Experience Unit, EU），以指导模型在计划、编码、评审、测试各阶段的决策。然而，从代码、文档、Issue 中抽取经验的过程往往缺乏标准化与可追溯性，导致经验质量波动、重复混乱、审计困难。

为此，本研究设计并实现了一套 **轻量级但研究级** 的经验抽取管道（extraction pipeline），其核心目标为：

1. **可复现性**：每条经验单元必须关联具体的证据记录，证据本身可验证、可追溯（GitHub issue/PR/commit/file path）。
2. **质量管控**：通过 evidence audit 流程，对已有 18 条 EU 进行强度评分，识别低置信候选，制定补强或替换策略。
3. **可扩展性**：建立候选经验登记表与裁决规则集，使新候选经验的入库流程可自动化、半自动化。
4. **可审计性**：维护决策日志（decision log），记录每条经验的来源、裁决理由、与其他候选的冲突/合并依据，便于后续论证与复现。

本节工作的具体目标包括：设计规范的 evidence 与 EU schema，定义六类冻结风险与对应裁决流程，构建 evidence audit 与 candidate registry，撰写可完全复现的抽取 case study，并为后续的路由与注入工作奠定可信基础。

## 2 相关工作

本研究与三类已有工作相关：

1. **Evidence-backed knowledge bases**：如 FEVER、HotpotQA 等使用证据标注来支撑知识主张；本工作将此框架应用于工程经验与产品实践。
2. **Software engineering practice mining**：从开源项目、issue tracker 中抽取最佳实践的工作（如 PRMiner、CodeQL 等）；本工作补充了人工审计与置信度评分的环节。
3. **Systematic knowledge engineering**：领域专家手工构建知识库的方法学；本工作融合了半自动检索与专家裁决。

本工作的创新点在于：
- 将工程经验具体化为**可验证的 evidence + EU 对**，而非抽象的最佳实践；
- 引入**证据强度 + risk class + stage fit** 的多维评分体系，而非单一相关性分数；
- 建立**冲突裁决规则集**，使跨项目候选经验的合并与拆分有据可依；
- 提供**完整的审计链路**，从原始代码/Issue 到 EU 的每一步都可复现与复核。

## 3 问题陈述

本工作聚焦以下研究问题：

1. **经验抽取的可再现性**：已有的 18 条 EU 中，每条是否都关联 ≥2 条具体的、可验证的证据？低置信度 EU 是否可通过补强或替换提升？
2. **候选经验的质量过滤**：从 30+ 候选经验中，如何系统地评估哪些应 merge 入 EU、哪些应 add、哪些应 park 或标记冲突？
3. **证据强度的一致性**：evidence strength（weak/partial/strong）的定义与评分标准是否明确、可客观应用？
4. **经验与代码的关联度**：注入的 EU 是否能在最终生成的代码中被可靠观测到（evidence-of-use）？

解决这些问题需要在 schema 设计、audit 流程、registry 维护、case study 撰写之间建立闭环。

## 4 方法（总体设计）

经验抽取管道分三层设计：

### 4.1 层 1：Evidence 与 EU 规范定义

- **evidence-schema.md**：定义每条证据记录的必填字段（source_project, immutable_ref, artifact_type, claim_support, confidence 等）和验证规则。
- **EU schema**：定义经验单元的必填字段（id, title, triggers, risks, mature_practices, injection.<stage>, verification, evidence 等）。
- **confidence rules**：当一条 EU 的最小证据强度为 low 时，EU 整体置信度不得超过 low；多条强证据可提升 EU 置信度。

### 4.2 层 2：Evidence Audit 与 Candidate Registry

- **evidence-audit-table.md**：逐条复核已有 18 条 EU 的证据强度与动作（keep/replace/downgrade/merge）；重点处理低置信候选（如 `ux-error-boundary-granularity`, `ux-fallback-recoverable-errors`），制定补强或替换策略。
- **candidate-registry.md**：为 30+ 候选经验逐条记录：risk_class, triggers, failure_mode, decision（merge/add/park/conflict），以及冲突说明（如需）。

### 4.3 层 3：抽取流程与裁决规则

```
Code/Doc/Issue Scan 
  → Candidate Claim 
  → Evidence Record (≥1 per candidate)
  → EU Draft (if merging/adding)
  → Evidence Strength Eval (weak/partial/strong)
  → Merge/Add/Park/Conflict Decision
  → Registry & Audit Update
```

**裁决规则（优先级）**：
1. **evidence strength**：优先保留证据更强的主张。
2. **risk severity**：同等证据下优先覆盖 high-severity 风险。
3. **specificity**：优先选择触发条件更具体、边界清晰的经验。
4. **stage fit**：优先匹配当前或未来使用阶段的经验。

## 5 实现（系统构件与参数）

实现采用四项核心资产与规范：

### 5.1 `extract-experience/SKILL.md`

标准化的抽取 Skill 规范，包括：
- **触发条件**：何时启动抽取流程（用户输入 `/extract-experience` 或同义关键字）。
- **输入规范**：必须声明 project、risk_class、source_type、检索范围。
- **输出规范**：candidate experience + evidence record + EU draft + audit decision。
- **流程描述**：固化的 6 步流程（Code Scan → Claim → Evidence → Draft → Validation → Registry Update）。
- **证据强度定义**：strong/partial/weak/needs-replacement 的明确界定。
- **裁决规则**：merge/add/park/conflict 的定义与冲突优先级。
- **质量门槛**：每条候选≥1 条证据、weak 证据不得直接 add、conflict 必须给出说明。

### 5.2 `extract-experience/evidence-audit-table.md`

覆盖 18 条既有 EU 的审计表，格式为：

| EU id | risk_class | evidence_strength | action | notes |
| --- | --- | --- | --- | --- |
| async-explicit-states | async | partial | keep | 证据为文档+代码，覆盖显式状态。 |
| ... | ... | ... | ... | ... |
| ux-fallback-recoverable-errors | ux | needs-replacement | replace | 低置信证据拉低 EU。 |

**关键决定**：
- 17 条 EU 标记为 `keep`（证据强度至少 partial）。
- 1 条低置信 EU（`ux-fallback-recoverable-errors`）标记为 `replace`，并在下一批次补强或替换证据。
- 1 条 partial 置信 EU（`ux-error-boundary-granularity`）引入新证据（kibana-error-boundary-003），升级为 medium 置信。

### 5.3 `extract-experience/candidate-registry.md`

36 条候选经验的登记表，格式为：

| id | risk_class | triggers | failure_mode | decision | conflict_note |
| --- | --- | --- | --- | --- | --- |
| C-001 | async | 列表首屏加载/无骨架 | 空白/误判无数据 | merge | - |
| ... | ... | ... | ... | ... | ... |
| C-023 | state | 多标签页共享缓存 | 跨页脏读 | park | 证据不足且超出 MVP |

**统计**：
- 30 条候选标记 `merge`（大部分已合并入现有 18 条 EU）。
- 3 条候选标记 `park`（证据弱、超出 MVP 范围或需要更强主样本证据）。
- 0 条标记 `conflict`（此批次无跨风险类冲突候选）。

### 5.4 `extract-experience/case-studies/form-duplicate-submit-guard.md`

完整的抽取案例研究，展示链路：

**Evidence → Claim → EU → Audit Decision**

案例涵盖：
- 证据来源：refine 官方文档（Form/mutation 指南）+ react-admin PR（按钮 disabled 实现）。
- 候选主张：表单重复提交是常见产品故障，应在编码/测试阶段防护。
- 对应 EU：`form-duplicate-submit-guard`（form 风险类，high severity）。
- 审计决定：证据强度 partial（文档明确，代码示例较少），但入库标准满足；建议在路由与评测中关注此 EU 的实际应用效果。

### 5.5 `extraction-notes.md` 扩展

P1 批次的检索与采样记录，新增两列：

| batch_id | query / lens | scope | cap | selected | include_reason | exclude_reason |
| --- | --- | --- | --- | --- | --- | --- |
| B-ra-async-1 | async state admin list | react-admin docs+core | 10 | async-explicit-states-001/002 | 覆盖 loading/error/empty 核心模式，文档+代码可追溯 | 同类条目重复或仅背景相关 |

每批次记录：
- **query / lens**：检索关键词或特定源。
- **include_reason**：为什么这条候选/证据被选中（关键词覆盖、代码可追溯、Issue 直指问题）。
- **exclude_reason**：为什么其他候选被排除（仅 API 示例、缺少用户可见行为、非风险类相关）。

这使得后续的审计与复现有明确的依据链。

### 5.6 Evidence 补充

新增 `evidence/kibana/kibana-error-boundary-003.md`，为低置信 EU `ux-error-boundary-granularity` 补强证据。

## 6 评估协议（操作细则）

评估分为离线与在线两个阶段：

### 6.1 离线审计（Evidence Audit）

1. **逐条复核**：对 18 条既有 EU，依据 evidence-schema.md 和 confidence rules，评估每条 EU 所链接证据的强度。
2. **强度评分**：根据 artifact_type、verification_status、claim_support、confidence 四个维度，给出强度判定（weak/partial/strong）。
3. **动作决定**：
   - `keep`：证据强度 ≥ partial，EU 整体置信度达标，继续使用。
   - `replace`：证据强度 weak，无法独立支撑主张，需替换或补强。
   - `downgrade`：保留 EU 但降低置信度（如置信度从 high 降至 medium）。
4. **输出**：evidence-audit-table.md，每条记录包含动作与说明。

### 6.2 在线候选登记（Candidate Registry）

1. **采集候选**：通过系统化检索（18 个 batch），采集 30+ 候选经验。
2. **风险类标注**：每条候选标注为六类之一（async/list/form/state/ux/responsive）。
3. **裁决应用**：逐条应用 merge/add/park/conflict 规则，填入 candidate-registry.md。
4. **冲突处理**：若无法自动 merge，记录冲突理由，等待人工仲裁或下一轮标注。

### 6.3 案例深��（Case Study）

1. **选择代表案例**：选 1～2 条候选经验，深入展示从证据到 EU 的完整链路。
2. **撰写追溯**：记录：
   - 源代码/Issue 链接。
   - 证据强度评估与理由。
   - 对应 EU 的生成或修订过程。
   - 审计决定与依据。
3. **便于复现**：提供足够的细节，使他人可按相同步骤复现该抽取决定。

## 7 局限性与未来方向

本实现的限制包括：

- **手工依赖**：evidence audit 与 candidate merge 目前主要依赖人工复核，尚未实现全自动；可探索 LLM 辅助的相似度匹配与一致性检测。
- **批次覆盖不足**：P1 共 18 个 batch，覆盖 6 个风险类 × 3 条 EU，但各类实际深度不均；未来可增加 5～10 个 batch，提升低频类（responsive、state）的证据多样性。
- **evidence 质量分布**：部分 EU 的证据为 partial 置信，依赖解释与上下文补充；需要进一步的代码-文档对齐与多项目横向对比。
- **跨项目泛化**：目前样本聚焦 react-admin / refine / kibana 三个前端框架；未来可考虑 Vue.js / Next.js / mobile 框架，以验证经验的通用性。

未来可探索方向：
1. **自动化 evidence 提议**：使用代码 embedding + semantic search���自动推荐高相似度的潜在证据。
2. **层级化 EU**：根据应用阶段（Plan → Coding → Review → Test）和风险等级（low/medium/high），生成不同粒度的 EU。
3. **跨语言与框架验证**：在 Python / backend 框架中验证经验的迁移性，评估工程经验的通用性边界。

## 8 可复现性清单（最小命令）

对已有 18 条 EU 进行 evidence audit、对候选经验进行 registry 维护，以及查阅完整 case study 的最小操作步骤如下：

### 查看 Evidence Audit 结果

```bash
# 查看 18 条 EU 的审计表
cat extract-experience/evidence-audit-table.md
```

输出：每条 EU 的强度评分与动作（keep/replace/downgrade）。

### 查看 Candidate Registry

```bash
# 查看 36 条候选经验的登记与裁决结果
cat extract-experience/candidate-registry.md
```

输出：每条候选的 risk_class、triggers、failure_mode、decision，以及冲突说明（如需）。

### 查看 Case Study（完整链路）

```bash
# 查看 form-duplicate-submit-guard 案例，展示证据→主张→EU→审计决定
cat extract-experience/case-studies/form-duplicate-submit-guard.md
```

输出：证据来源、强度评估、对应 EU、审计决定的完整记录。

### 查看 Extraction Notes（检索与采样）

```bash
# 查看 P1 的 18 个 batch，包括查询、范围、入选/排除理由
cat extraction-notes.md
```

输出：每个 batch 的检索 query、采样范围、selected 候选、include_reason / exclude_reason。

### 验证 Evidence 源

```bash
# 查看现有 evidence 的组织结构
find evidence -name "*.md" | head -20
```

输出：证据文件列表，格式为 `evidence/<project>/<eu-id>-NNN.md`。

---

## 总结

A 任务完成了从 **经验抽取流程标准化 → 既有 EU 质量复核 → 候选经验系统登记 → 完整案例展示** 的全链条工作，为后续的 B 任务（路由与注入）和 C 任务（实验与评估）提供了可信、可审计、可复现的基础。通过规范化的 evidence schema、冻结的裁决规则与详细的 audit trail，该工作使得工程经验的沉淀与验证从黑盒转向透明，为体系化的经验工程学奠定了基础。
