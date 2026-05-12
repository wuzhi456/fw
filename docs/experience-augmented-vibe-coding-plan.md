# 面向 Vibe Coding 的前端产品化经验抽取与 Skill 化注入机制完整计划

来源 proposal：[docs/experience-augmented-vibe-coding-proposal.md](D:\26Spring\创新实践\docs\experience-augmented-vibe-coding-proposal.md)

计划状态：RALPLAN 共识修订版  
最后更新：2026-05-12  
执行定位：研究设计 + 结构化资产原型 + 对比实验评估，不直接进入业务系统开发

## 1. RALPLAN-DR Summary

### 1.1 Principles

1. **低干扰、高执行性**：Skill 不粗暴塞入完整 checklist，只注入当前任务最相关的 3 到 5 条经验。
2. **证据可追溯**：每条 Experience Unit 必须能回到具体项目、文件、Issue、PR 或版本证据。
3. **实验可复现**：任务、组别、模型环境、上下文预算、失败记账、评分 Rubric 和评审流程必须在实验前冻结。
4. **MVP 范围收敛**：第一阶段只覆盖前端产品化质量，不扩展到后端、数据库、DevOps、安全合规或完整 Vibe Coding 平台。
5. **阶段化交付**：先完成研究协议和知识资产，再实现 Skill 原型，最后做对比实验和报告。

### 1.2 Decision Drivers

1. **结论可信度**：计划必须能区分“Skill 路由机制有效”与“只是额外提示更多所以更好”。
2. **原型可落地**：`frontend-productization` 必须能作为 Skill 资产被 Agent 读取、检索和阶段化使用。
3. **成本可控**：样本项目、经验数量、实验次数和评分流程必须适合课程项目周期。

### 1.3 Viable Options

| 方案 | 描述 | 优点 | 缺点 | 结论 |
| --- | --- | --- | --- | --- |
| A. 直接工程化 Skill | 立即开发完整可运行 Skill 或插件能力 | 产物工程感强，演示直观 | 易过早编码，缺少证据和评估，范围膨胀 | 暂不采用；若课程最终强制要求可运行插件，可作为后续扩展 |
| B. 研究 + 资产型 Skill 原型 + 对比实验 | 先抽取证据和 Experience Units，再构建 Skill 资产与路由规范，最后实验验证 | 同时满足研究贡献、原型展示和可复现评估 | 前期文档与协议成本较高 | **采用** |
| C. Full Prompt checklist | 把全部经验直接写进 Prompt 做对照 | 实现最快，适合作为实验对照 | 上下文干扰大，不能证明检索式 Skill 的价值 | 作为对照组保留，不作为主方案 |
| D. 端到端自动经验挖掘 | 自动扫描仓库、Issue、PR 并生成经验库 | 技术亮点强，可扩展 | MVP 成本高，质量不可控，容易偏离研究目标 | 不作为 MVP 主线，可作为后续工作 |

### 1.4 Alternatives Failure Criteria

1. 若 Full Prompt 组在产品化质量上接近 Skill 组，且上下文成本、执行干扰和输出偏移不更高，则 Skill 路由价值必须降级为“组织形式更好”，不能主张“质量显著更优”。
2. 若人工经验抽取平均每条超过 2 小时且证据质量仍不足，则缩小 Experience Unit 数量到 12 条，并把自动化挖掘列为后续工作。
3. 若实验运行无法固定模型或平台参数，则报告只能做方向性结论，不做强因果结论。

## 2. Requirements Summary

本项目要从成熟开源前端项目中抽取“前端产品化质量经验”，将其结构化为 Experience Units，再包装为一个 `frontend-productization` Skill 原型，使 Agent 在 Vibe Coding 的 Plan、Coding、Review、Test 阶段能按需检索和注入少量相关经验。

最终计划必须交付：

1. 一套经验抽取方法和样本选择准则。
2. 一个 Experience Unit schema。
3. 约 18 条前端产品化 Experience Units。
4. 一个 `frontend-productization` Skill 原型资产包。
5. 一套固定实验协议、任务集和评分 Rubric。
6. 一份对比实验报告，评估 Baseline、Experience Skill、可选 Full Prompt 的差异。

## 3. Scope and Non-goals

### 3.1 In Scope

第一阶段只覆盖以下六类前端产品化质量问题：

1. 异步请求状态：loading、error、empty、retry、取消过期请求。
2. 列表渲染性能：分页、懒加载、虚拟列表、大数据量渲染。
3. 表单鲁棒性：校验、防重复提交、提交中状态、失败恢复。
4. 状态一致性：乐观更新、旧请求覆盖、新旧数据同步。
5. 错误与空状态体验：错误边界、fallback UI、空数据提示。
6. 响应式与布局边界：移动端适配、长文本溢出、容器尺寸变化。

### 3.2 Non-goals

1. 不研究后端架构、数据库设计、DevOps、部署监控和安全合规。
2. 不构建完整 Vibe Coding 工作流平台。
3. 不做端到端自动经验挖掘闭环。
4. 不复制成熟项目的代码片段作为复用目标。
5. 不在本计划阶段修改 `FunctionWeaver`、`webapp` 或其他业务代码。

### 3.3 Prototype Boundary

`frontend-productization` Skill 原型只交付结构化资产和确定性路由规范：

```text
frontend-productization/
├─ SKILL.md
├─ experience-index.json
├─ experiences/
├─ evidence/
├─ templates/
└─ dry-runs/
```

原型必须能展示“如何选择经验、如何阶段化注入、如何验证是否落实”，但不要求实现完整插件、服务器、VS Code 扩展或自动仓库挖掘系统。

## 4. Frozen Research Protocol

本节为执行时的冻结规范。除非课程要求或实际平台限制使其不可执行，否则不得在主实验中随意变更。任何变更必须记录在 `experiment-protocol.md` 的 deviation log 中。

### 4.1 Sample Inclusion / Exclusion Rules

候选项目：react-admin、refine、Kibana、GitLab frontend。

每个候选项目按 0 到 3 分评分：

| 维度 | 0 分 | 1 分 | 2 分 | 3 分 |
| --- | --- | --- | --- | --- |
| 维护活跃度 | 基本停止维护 | 偶发维护 | 持续维护 | 长期活跃且版本演进清晰 |
| 前端产品复杂度 | 示例级 | 中等页面 | 多页面真实产品 | 大型真实前端系统 |
| 六类问题匹配度 | 覆盖 0-1 类 | 覆盖 2 类 | 覆盖 3-4 类 | 覆盖 5-6 类 |
| 证据可获取性 | 证据难获取 | 仅代码可查 | 代码和文档可查 | 代码、文档、Issue/PR 可查 |
| 抽取成本可控性 | 成本过高 | 成本偏高 | 成本可控 | 成本低且材料集中 |

纳入规则：

1. 总分必须 `>= 11/15`。
2. 证据可获取性必须 `>= 2`。
3. 最多纳入 3 个主样本。
4. 至少覆盖 admin CRUD、dashboard/data、large-scale frontend 三种画像中的两种。
5. 每个候选项目必须保留一条纳入/排除记录，说明分数、原因和预期贡献。

推荐 MVP 样本优先级：

1. react-admin：CRUD、列表、表单、数据请求经验。
2. refine：internal tools、dashboard、mutation、缓存和表单经验。
3. Kibana 或 GitLab frontend：大型前端系统、复杂状态、错误处理和性能经验。

### 4.2 Evidence Minimum Traceable Unit

每条 Evidence 记录必须包含以下字段：

```yaml
source_project: react-admin
repo_url: https://github.com/marmelab/react-admin
immutable_ref: commit-or-tag-or-release
artifact_type: code | issue | pull_request | docs | test | commit
path_or_issue_pr: packages/... 或 #12345
excerpt_or_summary: 不超过 120 字的证据摘要
mapped_experience_claim: 该证据支撑的经验判断
retrieval_time: 2026-05-12T00:00:00Z
confidence: low | medium | high
```

约束：

1. 每条 Experience Unit 至少包含 2 条 evidence。
2. 至少 1 条 evidence 必须来自主样本项目。
3. 如果无法获得 immutable ref，必须记录 `retrieval_time` 和原因。
4. Evidence 不保存大段版权文本，只保存短摘要、路径、编号和归纳判断。

### 4.3 Experience Unit Schema

每条 Experience Unit 使用 Markdown + YAML front matter：

```yaml
id: async-request-state
title: 异步请求必须显式建模用户可感知状态
category: frontend-productization
tags: [async, request, loading, error, empty-state]
risk_severity: high
triggers:
  - 页面需要从 API 加载数据
risks:
  - 慢请求期间界面无反馈
mature_practices:
  - 显式区分 loading、error、empty、success
anti_patterns:
  - 只处理 success path
injection:
  plan: 计划中必须定义 loading、error、empty 和 retry 行为。
  coding: 实现时将异步状态建模为明确状态机或等价结构。
  review: 检查是否存在只处理成功响应的组件。
  test: 增加慢请求、失败请求和空数据场景测试。
verification:
  - 慢请求时界面有 loading 或 skeleton
evidence:
  - evidence/react-admin/async-request-state-001.md
confidence: high
```

正文必须包含：

1. 经验解释：这条经验解决什么隐性产品化问题。
2. 适用边界：什么时候适用，什么时候不适用。
3. 成熟实践归纳：不复制代码，只解释为什么这样处理。
4. 验收提示：Agent 生成结果中如何判断该经验已落实。

### 4.4 Skill Routing Algorithm

Skill 路由采用双通道：

1. `core-mandatory`：与任务强相关且高风险的 1 到 2 条必注入经验。
2. `contextual-topk`：按相关性补充 2 到 3 条经验。

`core-mandatory` 触发条件：

1. 任务直接包含 async、request、form、list、dashboard、responsive、error state 等 hard triggers。
2. `trigger_match >= 2`，或 `risk_severity = high` 且当前阶段会放大该风险。

`contextual-topk` 打分：

```text
score =
  0.35 * trigger_match +
  0.25 * risk_match +
  0.20 * stage_match +
  0.10 * tech_stack_match +
  0.10 * evidence_confidence
```

注入规则：

1. 总注入数量必须保持在 3 到 5 条。
2. 若少于 3 条满足阈值，只注入实际命中项，不强行补无关经验。
3. 去重按 category、trigger 和 injection_text 的相似意图合并。
4. 冲突仲裁顺序：`risk_severity > 当前阶段匹配 > evidence_confidence > 更具体 trigger`。
5. 人工抽检中，注入项相关性评分为 2 或 3 的比例必须 `>= 80%`。

### 4.5 Experiment Protocol

Human Control Gate:

1. P4 and P5 are human-controlled phases. The human operator decides when to start each run, whether a failed run is retried, whether a run is excluded, when outputs are anonymized, and when scoring begins.
2. Agents may prepare task prompts, protocol files, logging templates, scoring sheets, anonymization scripts, and analysis drafts, but must not independently execute the full experiment batch.
3. Agents must not change group assignment, sampling rules, retry rules, failed-run status, scoring anchors, or conclusion wording without explicit human instruction.
4. Final claims about Skill effectiveness must be reviewed and approved by the human operator after seeing the score table, context-length records, failed-run log, and threat-validity notes.

主实验任务：

1. 数据列表页：包含搜索和筛选，但需求不显式提醒 loading、empty、分页或竞态。
2. 异步表单页：包含异步校验和提交，但需求不显式提醒防重复提交、提交中状态和失败恢复。
3. 响应式 dashboard/admin 页：包含数据概览和管理操作，但需求不显式提醒移动端、长文本和容器溢出。

可选第 4 个任务：移动端优先的管理后台页面。

实验组：

1. Baseline：Agent 只接收普通用户需求。
2. Experience Skill：Agent 在相同需求下使用 `frontend-productization` Skill 检索和注入经验。
3. Full Prompt：Agent 接收完整经验 checklist，用于因果对照。若时间不足，可标记为扩展实验，但建议保留。

运行规则：

1. 每任务每组 3 次独立生成。
2. MVP 最少运行 `3 tasks * 2 groups * 3 runs = 18` 次。
3. 加入 Full Prompt 后运行 `3 tasks * 3 groups * 3 runs = 27` 次。
4. 模型、系统提示、工具权限、上下文预算必须在实验前写入 `experiment-protocol.md`。
5. temperature 固定为 0 或平台最低可用值；若平台不暴露 temperature，记录为 `platform-controlled`。
6. 除组别干预外，输入需求文本必须完全一致。
7. 组别运行顺序随机化。
8. 输出匿名化后盲评，评分者不应知道结果来自哪个组。
9. 单次生成超过 30 分钟、无法运行、或缺少核心文件，记为 failed-run。
10. 每次 failed-run 最多重试 1 次，原始失败日志必须保留。
11. 每次运行记录提示长度、注入经验数量、输出文件数、运行时长和失败原因。

结论边界：

1. 若 Full Prompt 和 Skill 质量接近，但 Full Prompt 的上下文长度明显更高或偏题更多，可以主张 Skill 更低干扰。
2. 若 Skill 优于 Baseline 但没有 Full Prompt 对照，只能主张“经验注入有效”，不能强主张“路由机制优于完整提示”。
3. 若模型或平台参数无法锁定，只能报告方向性结果和威胁有效性。

### 4.6 Evaluation Rubric

总分 100，统一使用 0 到 3 分档，再按权重折算。

分档定义：

| 分数 | 含义 |
| --- | --- |
| 0 | 缺失、不可运行或完全未处理 |
| 1 | 有粗略处理，但不可恢复、不可测试或边界明显不足 |
| 2 | 有明确处理，大部分目标场景可用 |
| 3 | 处理成熟，可恢复、可测试，结构清晰且易维护 |

权重：

| 类别 | 权重 | 指标 |
| --- | --- | --- |
| 功能质量 | 20 | 显式功能完成度、主要路径可运行 |
| 产品化质量 | 45 | loading/error/empty、竞态/失败恢复、列表性能、表单防重/校验、响应式/长文本 |
| 代码质量 | 35 | 组件边界、请求逻辑复用、状态建模、测试覆盖、可维护性 |

评审一致性：

1. 至少两名评审者盲评。
2. Cohen's kappa 必须 `>= 0.65` 才接受评分。
3. 若低于 0.65，统一锚点样例后复评。
4. 任一单项评分差异 `>= 2`，必须第三人仲裁或复议。

统计口径：

1. 报告均值、中位数和标准差。
2. 样本较小时不夸大统计显著性。
3. 可报告 Cliff's delta 或定性效应量作为辅助。
4. 报告必须单独讨论上下文长度和注入条数对结果的影响。

## 5. Work Plan

### P0. 范围冻结与协议建档

目标：把研究问题、样本准则、实验常量和验收口径冻结为可执行规范。

产物：

1. `experiment-protocol.md`
2. `sample-selection.md`
3. `rubric.md`
4. `evidence-schema.md`

任务：

1. 将本文第 4 节冻结规范拆分为独立执行文档。
2. 对 react-admin、refine、Kibana、GitLab frontend 进行样本打分。
3. 选出 2 到 3 个主样本，并记录纳入/排除理由。
4. 固定主实验任务、组别、运行次数、模型环境和评分流程。

验收：

1. 所有候选项目有 0 到 3 分评分记录。
2. 主样本满足 `>= 11/15` 和 evidence 可获取性 `>= 2`。
3. 实验协议包含模型、temperature、上下文预算、失败记账和盲评规则。
4. Rubric 已冻结为 0 到 3 分。

### P1. 证据采集与候选经验抽取

目标：从主样本项目中提取可迁移的前端产品化经验候选。

执行策略：

1. 不全量读取或总结大型仓库；每次只围绕一个质量类别、一个项目和一个证据问题做定向检索。
2. 优先使用 GitHub 代码搜索、Issue/PR 搜索和官方文档定位候选证据；只有当需要核对上下文或测试实现时，才对目标项目做 shallow clone 或 sparse checkout。
3. 对大型项目采用分层采样：每个主样本项目先选 2 到 3 个高相关模块或标签，再按六类产品化问题抽取证据。
4. 每个项目的 Issue/PR 初筛上限为每类问题 10 条候选，进入人工蒸馏的高置信证据每类保留 2 到 4 条。
5. 单个 Agent 不承担全仓库分析；证据采集按项目或质量类别拆分为独立小批次，批次产物只包含 evidence 记录和候选经验摘要。
6. 如果 GitHub 在线检索已能提供稳定证据，不要求用户提前 clone；如果网络、权限、速率限制或需要本地搜索上下文，再由执行者 shallow clone 指定仓库。

任务：

1. 定向分析代码结构，标记请求封装、状态分支、列表策略、表单处理、错误边界、响应式处理。
2. 按关键词、标签、模块和历史问题挖掘 Issue、PR、commit message 和测试用例，关注竞态、卡顿、失败恢复、重复提交、空数据和布局问题。
3. 为每条候选经验建立 evidence 记录。
4. 初筛候选经验，剔除只适用于单项目内部架构的特例。

产物：

1. `evidence/<project>/*.md`
2. `experience-candidates.md`
3. `extraction-notes.md`

验收：

1. 至少形成 30 条候选经验。
2. 每类前端产品化问题至少有 3 条候选经验。
3. 每条候选经验至少关联 1 条 evidence。
4. 每个证据采集批次必须记录检索 query、检索范围、采样上限、入选理由和排除理由。

### P2. Experience Unit Schema 与样例库

目标：将候选经验蒸馏为可检索、可维护、可阶段化注入的 Experience Units。

任务：

1. 固化 YAML front matter 字段。
2. 将候选经验合并、去重、抽象为约 18 条 Experience Units。
3. 为每条 Experience Unit 编写 Plan/Coding/Review/Test 阶段注入文本。
4. 为每条 Experience Unit 编写 verification 项。
5. 标注 confidence 和 risk_severity。

产物：

1. `frontend-productization/experiences/*.md`
2. `frontend-productization/experience-index.json`
3. `frontend-productization/evidence/*`

验收：

1. 至少 18 条 Experience Units。
2. 六类产品化问题每类至少 2 条，目标为每类 3 条。
3. 每条 Experience Unit 至少 2 条 evidence。
4. 每条 Experience Unit 均包含四阶段 injection 和 verification。

### P3. Skill 原型与路由 Dry Run

目标：构建可读、可检索、可演示的 `frontend-productization` Skill 原型。

任务：

1. 编写 `SKILL.md`，定义触发条件、读取顺序、路由流程和注入限制。
2. 构建 `experience-index.json`，包含 id、tags、triggers、risk_severity、stage_fit、evidence_confidence。
3. 编写 `templates/plan.md`、`templates/coding.md`、`templates/review.md`、`templates/test.md`。
4. 对三个实验任务做 dry run，记录 Skill 选择了哪些经验以及原因。
5. 人工抽检注入相关性。

产物：

1. `frontend-productization/SKILL.md`
2. `frontend-productization/experience-index.json`
3. `frontend-productization/templates/*.md`
4. `frontend-productization/dry-runs/*.md`

验收：

1. 每个 dry run 输出 3 到 5 条经验，或说明不足 3 条的原因。
2. 注入相关性评分 2 或 3 的比例 `>= 80%`。
3. 冲突仲裁和去重规则有可见记录。

### P4. 对比实验执行

目标：在固定协议下比较 Baseline、Experience Skill 和 Full Prompt 的生成质量。

控制权：P4 由人工主控。Agent 负责准备输入、记录模板、匿名化辅助和自动检查脚本；是否启动某次运行、是否重试、是否接受 failed-run 记账，以及是否进入下一组实验，均由人工确认。

任务：

1. 为每个实验任务准备完全一致的基础需求文本。
2. 按随机顺序运行各组实验。
3. 保存每次输入、输出、日志、运行时间、上下文长度和失败信息。
4. 对输出进行匿名化编号。
5. 运行可用的自动检查：安装、构建、测试、页面运行或静态检查。

产物：

1. `experiments/tasks/*.md`
2. `experiments/runs/<task>/<group>/<run-id>/`
3. `experiments/run-log.csv`
4. `experiments/anonymous-submissions/`

验收：

1. MVP 至少 18 次有效或有记账的运行。
2. 每次运行有完整输入、输出和运行元数据。
3. failed-run 有失败原因和重试记录。

### P5. 评分、分析与报告

目标：用冻结 Rubric 评估结果，并形成可信的实验分析。

控制权：P5 由人工主控。Agent 可以汇总评分、计算统计量、整理分歧项和起草报告，但不得自行解除盲评、修改评分、仲裁分歧、剔除异常结果或下最终结论。

任务：

1. 两名评审者盲评所有匿名结果。
2. 计算 Cohen's kappa。
3. 对分歧项进行复议或第三方仲裁。
4. 汇总各组功能质量、产品化质量、代码质量得分。
5. 分析 Skill 组相对 Baseline 的提升，以及 Full Prompt 对照对因果解释的影响。
6. 写出威胁有效性和结论边界。

产物：

1. `experiments/scores.csv`
2. `experiments/analysis.md`
3. `docs/experience-augmented-vibe-coding-report.md`

验收：

1. kappa `>= 0.65`，或记录复评过程。
2. 报告包含均值、中位数、标准差和效应量讨论。
3. 报告明确说明哪些结论是强结论，哪些只是方向性观察。

## 6. Acceptance Criteria

1. 样本选择文档存在，并对每个候选项目给出量化评分、纳入/排除理由和证据可得性判断。
2. Experience Unit schema 文档存在，并包含完整字段、字段解释和示例。
3. 至少 18 条 Experience Units 完成，每条至少 2 条 evidence、四阶段 injection、verification 和 confidence。
4. `frontend-productization` Skill 原型能在 3 个任务 dry run 中输出 3 到 5 条相关经验，并给出选择理由。
5. 实验协议完整记录模型、temperature、上下文预算、工具权限、运行次数、失败记账、随机化和盲评流程。
6. Rubric 使用 0 到 3 分档，总分 100，评审一致性使用 Cohen's kappa `>= 0.65`。
7. MVP 至少完成 18 次实验运行；若执行 Full Prompt，则完成 27 次。
8. 实验报告必须比较 Baseline、Experience Skill 和可选 Full Prompt，并讨论上下文长度、额外提示和评审偏差对结论的影响。

## 7. Risks and Mitigations

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| 经验抽取主观性强 | 经验库可信度下降 | 每条经验至少 2 条 evidence，保留 claim 映射和 confidence |
| Skill 效果与额外上下文混淆 | 因果结论不成立 | 保留 Full Prompt 对照，记录提示长度和注入数量 |
| 样本项目偏置 | 经验不可迁移 | 使用量化纳入准则，覆盖至少两种项目画像 |
| 原型范围漂移 | 项目无法按期完成 | 原型只做结构化资产与路由规范，不做完整平台 |
| 评分主观 | 结果不可复核 | 盲评、kappa 阈值、复评和仲裁 |
| 平台参数无法完全锁定 | 可复现性下降 | 记录 platform-controlled 项，并降低结论强度 |
| 经验过多导致干扰 | Agent 输出偏题或过约束 | 默认注入 3 到 5 条，使用 core-mandatory + contextual-topk |

## 8. Verification Plan

1. 文档完整性检查：确认 `experiment-protocol.md`、`sample-selection.md`、`rubric.md`、`evidence-schema.md` 存在。
2. Schema 校验：抽查 3 条 Experience Units，确认必填字段齐全。
3. Evidence 校验：抽查每类至少 1 条经验，确认 evidence 可回溯到项目证据。
4. 路由 dry run：对 3 个任务分别运行 Plan/Coding/Review/Test 阶段注入，确认输出数量、相关性和解释。
5. 实验日志抽检：确认每次运行有输入、输出、模型环境、时间和失败记账。
6. Rubric 一致性校验：计算 kappa；若低于 0.65，必须复评。
7. 报告审查：确认报告没有超过实验协议能支持的结论边界。

## 9. ADR

### Decision

采用“研究 + 资产型 Skill 原型 + 对比实验评估”的路线，而不是直接工程化完整 Skill，也不是只做 Full Prompt checklist。

### Drivers

1. 需要证明经验注入机制是否能提升 Vibe Coding 的前端产品化质量。
2. 需要避免大 Prompt 带来的上下文干扰。
3. 需要让每条经验有来源、可复核、可维护。
4. 需要在课程项目周期内完成可展示、可评价的成果。

### Alternatives Considered

1. 直接工程化完整 Skill 或插件。
2. Full Prompt checklist。
3. 端到端自动经验挖掘。
4. 只写研究报告、不做 Skill 原型。

### Why Chosen

当前方案能同时保留研究贡献、原型可展示性和实验可验证性。它把复杂工程目标拆成结构化资产、确定性路由和对比实验，既能控制范围，也能支撑较可信的结论。

### Consequences

1. 前期人工蒸馏和证据整理成本较高。
2. MVP 自动化程度有限，不能声称已经解决自动经验挖掘。
3. 实验结论依赖样本数量和平台稳定性，报告必须明确威胁有效性。
4. 产物更适合作为课程研究原型和后续工程化基础。

### Follow-ups

1. 在第二个 Agent 环境中迁移验证 Skill。
2. 扩展样本项目和 Experience Unit 数量。
3. 引入半自动检索和候选经验打分。
4. 将路由 dry run 进一步工程化为脚本或 MCP 工具。

## 10. Execution Handoff

### 10.1 Available Agent Types Roster

可用角色：

1. `planner`：维护计划、任务拆解和协议一致性。
2. `researcher`：调研开源项目、Issue、PR 和文档证据。
3. `architect`：审查 Skill 结构、路由边界和研究方案。
4. `executor`：创建 Skill 资产、经验文件、索引和模板。
5. `test-engineer`：设计实验任务、Rubric、运行协议和自动检查。
6. `critic` / `code-reviewer`：审查计划和产物质量。
7. `verifier`：最终验收、证据抽检和结论边界检查。
8. `writer`：整理报告、方法章节和实验结果。

### 10.2 Ralph Path

适合单线推进，顺序为：

1. `planner` 冻结 P0 文档。
2. `researcher` 完成样本打分和证据采集。
3. `executor` 创建 Experience Units 和 Skill 原型。
4. `test-engineer` 固化实验任务与评分表。
5. `verifier` 逐项检查验收标准。
6. `writer` 完成报告。

建议命令提示：

```text
$ralph execute .omx/plans/experience-augmented-vibe-coding-plan.md
```

### 10.3 Team Path

适合并行推进，建议 staffing：

| Lane | 角色 | 工作范围 | Reasoning |
| --- | --- | --- | --- |
| Protocol | planner + test-engineer | P0 协议、Rubric、实验任务 | high |
| Evidence | researcher | 样本打分、证据采集、候选经验 | high |
| Skill Assets | executor | schema、Experience Units、Skill 目录和索引 | high |
| Review | critic + verifier | 抽查 evidence、验证路由、检查结论边界 | high |
| Report | writer | 方法、实验设计、结果报告 | medium |

建议命令提示：

```text
$team execute .omx/plans/experience-augmented-vibe-coding-plan.md
```

Team 验证路径：

1. Protocol lane 先交付冻结协议，其他 lane 不得绕过协议。
2. Evidence lane 每完成一类经验，Verifier 抽检 evidence。
3. Skill Assets lane 每完成 6 条 Experience Units，Critic 检查 schema 和注入文本。
4. Test lane 在实验前确认随机化、盲评和失败记账表。
5. Team 收尾前必须证明第 6 节 Acceptance Criteria 全部满足或记录缺口。
6. 若交给 Ralph 收尾，Ralph 只做验收、补缺和报告一致性检查，不重新规划主线。

## 11. Applied Review Improvements

本版已合并 Architect 和 Critic 的迭代意见：

1. 补强原型边界，避免从研究原型漂移到完整平台开发。
2. 增加样本纳入/排除量化规则。
3. 增加 Evidence 最小可追溯单元。
4. 冻结 `core-mandatory + contextual-topk` 路由算法、权重和冲突仲裁。
5. 冻结实验协议：任务、组别、次数、随机化、盲评、失败记账和上下文记录。
6. 冻结 0 到 3 Rubric、100 分权重、`kappa >= 0.65` 和仲裁规则。
7. 增加结论边界，防止把“更多上下文”误判为“Skill 路由必然有效”。
