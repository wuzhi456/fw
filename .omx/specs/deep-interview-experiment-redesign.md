# Deep Interview Spec: Experiment Redesign v2

**Status:** Ready for `$ralplan` (amended 2026-05-24: dual co-primary endpoints)  
**Profile:** Standard | **Rounds:** 10 | **Final ambiguity:** ~7% (threshold 0.20)  
**Context snapshot:** `.omx/context/experiment-redesign-20260524T120000Z.md`  
**Transcript:** `.omx/interviews/experiment-redesign-20260524T120000Z.md`

---

## 1. Intent（Why）

重新设计实验以通过答辩 scrutiny：避免 baseline 被质疑为稻草人，建立**可复现、可自动验收**的对照链，同时保持原项目核心贡献——**领域经验路由（frontend-productization）对前端产品化质量的提升**。

RepoZero 不取代主实验，仅借鉴其「输出等价 / 可执行验收」思想。

---

## 2. Desired Outcome

交付一套 **Experiment Protocol v2**，包含：

1. **四组对照** + **16 次正式 runs**（2 任务 × 4 组 × 2 reps）
2. **双 co-primary endpoints（同等重要，不分主次）：**
   - **Endpoint A — 自动验证：** smoke + stress 通过率（`validation_pass_rate`）
   - **Endpoint B — Rubric 质量：** `rubric.md` 全量评分（functional 20 + productization 45 + code 35 = 100）
3. **Mini-repo 附录实验**（RepoZero-inspired，React 技术栈）
4. 旧 async 9 runs 保留为 **exploratory pilot**（不纳入 v2 formal 双 endpoint 分析）

---

## 3. In-Scope

### 3.1 研究问题（冻结）

> 在相同工具权限与任务文本下，`frontend-productization` 经验路由是否比 baseline、full-prompt checklist、Superpowers 通用工作流，带来更高的前端产品化质量？

**双 co-primary 证据链（同等重要）：**

1. **行为可验证性** — smoke/stress 自动通过率（`validation_pass_rate`）
2. **工程质量与产品化成熟度** — `rubric.md` 盲评总分及各维度分

**Exploratory（不升格为 co-primary，但报告必引）：** evidence-of-use、routing `precision@5` / `mandatory_hit_rate`。

### 3.2 实验组（4 arms）

| group_id | 干预 | injected_count | 说明 |
| --- | --- | ---: | --- |
| `baseline` | 仅 frozen task text | 0 | 普通用户需求 |
| `full-prompt` | task + 完整 18 EU checklist（`experiments/interventions/full-prompt.md`） | 18 | 控制「多上下文」效应 |
| `experience-skill` | task + **frontend-productization** skill（确定性 router，3–5 EU） | 3–5 | **主实验组**；非 extract-experience 运行时串联 |
| `superpowers` | task + Superpowers 插件技能全开 | N/A | 强通用 agent 基线；仅多 skill 指令 |

### 3.3 任务（2 个 formal）

| task_id | 理由 |
| --- | --- |
| `task-list-page` | 未跑；覆盖 list/async/empty/pagination stress |
| `task-responsive-dashboard` | 未跑；覆盖 responsive/layout/dashboard stress |

**Exploratory（formal 外）：** `task-async-form` 9 runs 已有，可引用但不与 v2 primary 混分析。

### 3.4 Run 矩阵

```text
2 tasks × 4 groups × 2 reps = 16 accounted runs
```

每 run 必须记录完整 ledger 字段（含 start/end/duration/context_estimate）。

### 3.5 评估模型：双 Co-Primary Endpoints（同等重要）

**原则：** 自动验证与 Rubric 评分**不分主次**；报告、表格、结论必须**并列呈现**两者。禁止只引用其中一个 endpoint 支撑强因果主张。

#### 3.5.1 运行前提（Operational Gate，非评分 endpoint）

仅 **`npm install && npm run build` exit 0** 为 failed-run 硬门槛。无法 build 的 run 不进入 Endpoint A/B 统计，但保留 ledger 记录。

Build 通过后，**无论 smoke/stress 是否通过，均须完成 Rubric 盲评**（Endpoint B）；反之，**无论 Rubric 分数高低，均须跑完整 smoke/stress 并记录**（Endpoint A）。

#### 3.5.2 Endpoint A — 自动验证（smoke + stress）

**定义：**

```text
validation_pass_rate = passed_checks / applicable_checks
```

**检查项（计入 Endpoint A，非 build gate）：**

1. 任务级 **smoke**（Playwright 或 Cypress）：主路径可渲染、核心交互可触发
2. 任务级 **stress**（frozen 脚本）：见下表

| task_id | stress scenarios（最低集） |
| --- | --- |
| task-list-page | 空数据；模拟慢请求/失败+重试；快速筛选切换（stale response）；大数据分页或 bounded render |
| task-responsive-dashboard | desktop + 窄屏 viewport；长标签/长文本；局部卡片错误；密集 KPI 布局 |

**Endpoint A 比较：** 四组间 `validation_pass_rate` 均值 + 95% CI（或 Bootstrap）；小样本报告 Cliff's delta / rank-biserial。

#### 3.5.3 Endpoint B — Rubric 盲评（`rubric.md` 全量）

**定义：**

```text
rubric_total = functional_quality (20) + productization_quality (45) + code_quality (35)  # max 100
```

**程序（与 v1 协议对齐并加强）：**

1. 匿名化至 `experiments/anonymous-submissions/`
2. 至少 **1 human reviewer**；**LLM reviewer 可并列**（非 supplementary 降级，而是与 Endpoint A 同级的第二测量通道之一）
3. 若仅单 human + 单 LLM：报告并列报告两者分数，差异 ≥2 分触发 adjudication
4. 若完成双人 human：计算 Cohen's kappa 并写入报告

**Endpoint B 比较：** 四组间 `rubric_total` 及三 category 分项均值 + CI；与 Endpoint A **同表并列**。

#### 3.5.4 联合解读规则（Conjunction Rule）

| 情形 | 报告表述 |
| --- | --- |
| A 与 B 同向（experience-skill 均优于 baseline） | 可主张「行为可验证 + 工程质量」一致提升 |
| A 高 B 低（或反之） | **必须**报告分歧并做机制解释（如：测试通过但代码结构差；或 rubric 高但 stress 边界失败） |
| 仅一端显著 | **不得**写「整体显著优于」；限定为「在 {validation\|rubric} 维度上观察到…」 |
| Superpowers 在 A 高 B 低 | 专门 subsection 讨论通用 verification skill vs 领域 EU 的差异 |

**禁止：** 将 Endpoint A 或 B 任一标注为 primary/secondary/main/exploratory。

#### 3.5.5 Exploratory（第三层，非 co-primary）

- B 任务：`evidence-of-use`（experience-skill 组 injected EU → 代码结构）
- Routing：`precision@5` / `mandatory_hit_rate`（已有 CSV 可复用）

### 3.7 Mini-Repo 附录（RepoZero-inspired）

**Non-official RepoZero fork；借鉴方法论：**

- 新建 `experiments/tasks/task-mini-admin-repo.md`：要求 agent **从零**生成小型 React admin 仓库（list + form + layout，monorepo 或单 package）
- 提供 **frozen API spec / 行为契约**（输入输出样例，非完整 Python repo）
- 验收：`scripts/validate_mini_repo.py` 或 Playwright 黑盒对比 **golden behavior fixtures**（输出等价思想）
- 规模：**1 任务 × 2 组（baseline vs experience-skill）× 1 rep = 2 pilot runs**（附录，不阻塞 16-run 主实验）
- 报告定位：future work / 方法可扩展性展示

### 3.8 公平性规则

**用户已确认（必须写入 protocol）：**

- **能力公平：** 四组相同 bash/npm/test/浏览器工具权限；Superpowers 组不得预装额外 Playwright 脚本

**Spec 推荐、交付前需用户签字：**

- **预算公平：** 统一 max agent turns / wall-clock（如 45 min）/ session context 上限
- **验收公平：** 四组共用同一 frozen `experiments/validation/` 脚本与 pass 阈值

### 3.9 旧实验处理

- `task-async-form` 9 runs：**保留为 exploratory**；在 deviation log 注明与 v2 randomization 不一致
- 不强制作废；v2 formal 分析仅含 16 runs + mini-repo pilot

---

## 4. Out-of-Scope / Non-Goals

1. 不 clone / 不运行官方 RepoZero Python 工具链作为主实验
2. 不在 v2 主实验运行时串联 `extract-experience` skill（其为离线 P1 资产）
3. 不扩展至后端/DevOps/安全合规
4. 不 claim 双人 human kappa（除非 Week 3 额外完成）
5. 不修改 FunctionWeaver 业务代码
6. 不全量 18 EU B+E 回填（政策 C 保持）

---

## 5. Decision Boundaries

| 决策 | 谁定 |
| --- | --- |
| 两任务选定（list + dashboard） | ✅ 用户已确认 |
| 四组 intervention 最终文本 | 🔒 **用户签字** |
| 双 endpoint 公式（validation_pass_rate + rubric_total）与 pass 阈值 | 🔒 **用户签字** |
| Playwright vs Cypress、stress 脚本细节 | Agent |
| Randomization 表、run-log schema | Agent |
| Mini-repo 任务规格草案 | Agent 起草 → 用户 review |
| 报告结构与威胁有效性表述 | Agent 起草 → 用户 review |

---

## 6. Constraints

- 课程答辩周期；16 runs + 2 mini-repo pilots 为上限
- 平台 model/temperature 可能 `platform-controlled`
- C 同学生力：优先自动化，减少人工 smoke
- 现有 18 EU + routing 资产必须复用

---

## 7. Testable Acceptance Criteria

| ID | 标准 | 验证 |
| --- | --- | --- |
| AC-1 | `experiment-protocol-v2.md` 冻结四组、2 任务、16 runs、**双 co-primary endpoint**（无主次） | 人工 review |
| AC-2 | `experiments/validation/` 含 smoke + stress 脚本，本地对 1 个 golden stub 跑通 | CI / manual exit 0 |
| AC-3 | 16 runs 完成且 `validation-results.csv` 每行有 pass/fail + evidence | 文件检查 |
| AC-4 | 四组 intervention 文件更新（含 `superpowers.md`） | diff review |
| AC-5 | 双 endpoint 分析表：四组 validation_pass_rate + rubric_total **并列** + CI | `experiments/analysis-v2.md` |
| AC-6 | Mini-repo pilot 2 runs + 验收脚本 | 附录可引用 |
| AC-7 | 报告声明：async pilot exploratory；fairness 限制；小样本边界 | report section |

---

## 8. Assumptions Exposed

| 假设 | 决议 |
| --- | --- |
| 「双 skill」= extract + injection 串联 | **否** → 仅 frontend-productization |
| RepoZero 必须官方接入 | **否** → mini-repo 改编 |
| Rubric 与自动验证分主次 | **否（2026-05-24 修订）** → **双 co-primary，同等重要** |
| 必须 27 runs / 3 任务 | **否** → 16 runs / 2 任务 |
| Superpowers 全开 = 公平强基线 | **部分** → 需报告 subgroup + 推荐 budget/验收公平 |

---

## 9. Proposed Protocol v2 Architecture

```text
                    ┌─────────────────────────────────────┐
                    │         Frozen Task Text (×2)         │
                    └─────────────────┬───────────────────┘
                                      │
        ┌──────────────┬──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              │
   baseline      full-prompt    experience-skill  superpowers       │
        │              │              │              │              │
        └──────────────┴──────────────┴──────────────┘              │
                                      │                              │
                              Agent Generation (×2 reps)             │
                                      │                              │
                    ┌─────────────────▼───────────────────┐          │
                    │  Operational Gate: npm build only   │          │
                    └─────────────────┬───────────────────┘          │
                                      │                              │
              ┌───────────────────────┴───────────────────────┐      │
              ▼                                               ▼      │
   CO-PRIMARY A                          CO-PRIMARY B               │
   smoke + stress                         rubric.md 盲评 (100)       │
   validation_pass_rate                   rubric_total + categories  │
   (四组比较 + CI)                        (四组比较 + CI)             │
              └───────────────────────┬───────────────────────┘      │
                                      ▼                              │
                         Conjunction Rule 联合解读                    │
                         (A/B 同向才可主张整体提升)                   │
                         exploratory: EoU / routing                  │
                                                                      │
                    ┌─────────────────────────────────────┐          │
                    │  APPENDIX: mini-repo pilot (×2)      │◄─────────┘
                    │  output-equivalence vs fixtures       │
                    └─────────────────────────────────────┘
```

---

## 10. Recommended Next Steps

1. **`$ralplan`** — 产出 `experiment-protocol-v2.md` + `experiments/validation/` 设计 + 更新 `小组分工.md` C 任务
2. 用户 review 并签字：intervention 四文件 + **双 endpoint** 公式与联合解读规则
3. **`$ralph` 或 `$autopilot`** — 实现 validation 脚本 → 跑 16 runs → 分析 → 报告

---

## 11. Handoff Options

| 选项 | 适用 |
| --- | --- |
| `$ralplan --consensus` | **推荐** — 架构与 feasibility 共识后再写 protocol |
| `$autopilot` | 用户已认可本 spec，直接执行 |
| `$ralph` | 需要持久跑到 16 runs 完成 |
| Refine further | 需补充 budget 公平 / mini-repo 细节 |

**Deep-interview 不直接实现。** 请选择 handoff。
