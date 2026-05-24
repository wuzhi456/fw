# Context Snapshot: experiment-redesign

**Created:** 2026-05-24T12:00:00Z  
**Profile:** Standard deep-interview  
**Type:** Brownfield (FunctionWeaver research repo)

## Task statement

用户要求重新设计完整实验。原实验被认为「太潦草」，需要更鲁棒的设计，包含：
1. 冒烟 + 压力测试
2. 在 baseline / pure prompt / 双 skill 注入之外，增加第四对比组（如 Superpowers skill），避免 baseline 被答辩质疑为稻草人
3. 若可行，采用北大 RepoZero 仓库级生成基准进行测评

## Desired outcome

一套可答辩、可复现、对照公平、验证链完整的实验协议与执行计划，替换或升级现有 `experiment-protocol.md` 体系。

## Stated solution (user ask)

- 引入自动化 smoke/stress 验证
- 四组（或更多）对照实验设计
- 可能迁移到 RepoZero 级评测

## Probable intent hypothesis

- **答辩防御**：担心现有 baseline 太弱、评分不 formal、样本量不足，无法支撑「经验注入有效」的因果主张
- **方法升级**：从「9 次 exploratory runs + LLM 单 reviewer」升级到工业级 benchmark 范式
- **范围张力**：RepoZero 与当前「前端产品化六类风险」研究问题可能不完全对齐，需澄清是替换还是并行

## Known facts / evidence

### 现有实验状态（2026-05-24）
- 协议：`experiment-protocol.md` 冻结于 2026-05-12
- 三组：Baseline / Experience Skill / Full Prompt
- 3 任务 × 3 组 × 3 reps = 27 runs 目标；**仅 task-async-form 完成 9/27**
- async 结果（LLM 单 reviewer）：baseline 74.67, experience-skill 90.22, full-prompt 85.48
- 缺：`validation-results.csv`、匿名化盲评、双人 kappa、最终报告（draft shell）
- run-log 缺 timing/context 字段；protocol deviation 已记录

### 现有 stress 设计（未执行）
- `小组分工.md` §4.3 已有 smoke/stress 场景表（async form / list / responsive dashboard）
- 无 `validation-results.csv` 产物

### RepoZero（arxiv 2605.07122）
- GitHub: https://github.com/JesseZZZZZ/RepoZero
- 范式：给定 API spec，从零复现整仓库，黑盒输出等价验证
- 最强 agent pass rate 约 30–55%；Python 为主；含 cross-language 变体
- 与 FunctionWeaver 当前 React 前端单页任务尺度差异大

### Superpowers
- Cursor 插件技能库：TDD、debugging、brainstorming、verification 等通用 agent 工作流
- 非领域专用「前端产品化经验」；可作为「强通用 agent 基线」第四组

### 项目研究边界（plan §3）
- In scope：六类前端产品化质量
- Out of scope：后端、DevOps、完整 vibe-coding 平台
- 交付物是 research prototype + 对比实验，非 FunctionWeaver 产品

## Constraints

- 课程项目周期（三周计划已部分超时）
- 平台参数可能 platform-controlled（model/temperature）
- 18 条 EU + routing 资产已投入，完全废弃成本高
- RepoZero 环境搭建与前端 React 任务可能需大量适配

## Unknowns / open questions

1. **核心答辩主张**：仍证明「领域经验路由注入 > 通用方法」还是升级为「仓库级生成能力」？
2. **双 skill 定义**：extract-experience + frontend-productization？还是其他组合？
3. **RepoZero 角色**：主实验 / 子实验 / 仅 related work？
4. **Superpowers 第四组**：固定启用哪些 skills？是否与 frontend-productization 公平（context budget）？
5. **时间预算**：27 runs 未完成，四组 × RepoZero 是否现实？
6. **Non-goals**：哪些旧协议元素必须保留 vs 可丢弃？

## Decision-boundary unknowns

- Agent 可否自行决定放弃 RepoZero 改 hybrid？
- 可否缩减任务数或 reps？
- 评分是否必须双人盲评还是接受 automated + spot-check？

## Likely codebase touchpoints

- `experiment-protocol.md`
- `rubric.md`
- `experiments/run-log.csv`, `validation-results.csv`（待建）
- `experiments/tasks/*.md`
- `experiments/interventions/*.md`
- `小组分工.md`
- `docs/experience-augmented-vibe-coding-report.md`
