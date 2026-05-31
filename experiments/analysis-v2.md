# v2 Formal Analysis — Dual Endpoint (A + B)

**Protocol:** `experiment-protocol-v2.md`  
**Completed:** 2026-05-29  
**Owner:** C — Evaluation / Report  
**Data sources:** `run-log.csv` (v2 rows), `validation-results.csv`, `scores-v2.csv`, `routing/routing-metrics-v2.csv`

---

## 1. Design recap

| Dimension | Value |
| --- | --- |
| Formal tasks | `task-list-page`, `task-responsive-dashboard` |
| Groups | baseline, full-prompt, experience-skill, superpowers |
| Replicates | 2 per (task × group) → **16 runs** |
| Endpoint A | `validation_pass_rate` = passed / applicable automated checks |
| Endpoint B | `rubric_total` /100 (functional 20 + productization 45 + code 35) |
| Reviewers | human-reviewer-v2 + llm-reviewer-v2 **并列**（各 16 runs） |

**Build gate:** 16/16 `build_status=pass`, `status=valid`, 0 failed-run.

---

## 2. Summary table — four groups (formal v2, pooled)

Endpoint A 与 Endpoint B **同表并列**。`rubric_total` 为每个 run 上 human 与 LLM 总分的算术平均，再对组内 4 个 run 求均值。95% CI 为 mean ± 1.96×SE（n=4，描述性区间，非正式推断检验）。

| group | n | Endpoint A `validation_pass_rate` | Endpoint B `rubric_total` (avg) | functional | productization | code |
| --- | ---: | --- | --- | ---: | ---: | ---: |
| **baseline** | 4 | **1.000** [1.000, 1.000] | **57.92** [47.95, 67.89] | 16.11 | 23.44 | 18.37 |
| **experience-skill** | 4 | **1.000** [1.000, 1.000] | **69.93** [58.59, 81.27] | 17.22 | 28.50 | 24.21 |
| **full-prompt** | 4 | **0.958** [0.876, 1.040] | **82.50** [78.55, 86.44] | 18.06 | 37.31 | 27.13 |
| **superpowers** | 4 | **1.000** [1.000, 1.000] | **65.10** [53.91, 76.28] | 17.22 | 25.12 | 22.75 |

### 2.1 Reviewer channel split（Endpoint B 分项）

| group | human `rubric_total` | llm `rubric_total` | Δ (llm − human) |
| --- | ---: | ---: | ---: |
| baseline | 57.25 | 58.59 | +1.34 |
| experience-skill | 67.93 | 71.93 | +4.00 |
| full-prompt | 80.22 | 84.78 | +4.56 |
| superpowers | 63.39 | 66.81 | +3.42 |

12/16 runs 上 human 与 LLM 完全一致；|Δ| ≥ 10 的 3 个 run 均来自 **task-list-page**（见 §5.3）。

---

## 3. Per-task breakdown

### 3.1 task-list-page（8 runs）

| group | A mean | B mean (avg reviewers) | 备注 |
| --- | ---: | ---: | --- |
| baseline | 1.000 | 66.67 | — |
| experience-skill | 1.000 | 79.34 | LLM 在 r01 显著高于 human |
| full-prompt | 0.917 | 82.73 | r01 未过 `smoke-list-filter` |
| superpowers | 1.000 | 72.26 | r02 LLM 显著高于 human |

### 3.2 task-responsive-dashboard（8 runs）

| group | A mean | B mean (avg reviewers) | 备注 |
| --- | ---: | ---: | --- |
| baseline | 1.000 | 49.18 | functional 均值 ≈12.2/20 |
| experience-skill | 1.000 | 60.53 | 高于 baseline，仍低于 full-prompt |
| full-prompt | 1.000 | 82.27 | 组内最高 |
| superpowers | 1.000 | 57.95 | 与 baseline 接近 |

Dashboard 任务上 **functional** 分项普遍偏低（约 11–18/20），是组间 rubric 差异的主要来源之一；list 任务 functional 接近满分（20/20）。

---

## 4. Conjunction Rule 分析

协议要求：**禁止**写 primary/secondary endpoint；A 与 B **同等重要**。下表为 experience-skill 相对 baseline 及组间主要对比的模式判定。

| 对比 | Endpoint A | Endpoint B | 模式 | 允许表述 |
| --- | --- | --- | --- | --- |
| experience-skill vs baseline | 1.000 vs 1.000（无差异） | 69.93 vs 57.92 | **仅 B 有组间差** | 在 rubric 维度上 experience-skill 高于 baseline；**不能**声称 validation 同步提升 |
| full-prompt vs baseline | 0.958 vs 1.000 | 82.50 vs 57.92 | **A↓ B↑** | 必须报告分歧：`list-full-r01` 客户端筛选未生效（5/6 checks）；同时 rubric 显著更高，尤其 productization |
| full-prompt vs experience-skill | 0.958 vs 1.000 | 82.50 vs 69.93 | **A↓ B↑** | 全量 checklist 提升 rubric，但以一次 validation 失败为代价；机制见 §5.1 |
| superpowers vs baseline | 1.000 vs 1.000 | 65.10 vs 57.92 | **仅 B 有差** | 通用 agent 工作流在 rubric 上略优于裸 baseline，validation 无区分 |
| experience-skill vs superpowers | 1.000 vs 1.000 | 69.93 vs 65.10 | **仅 B 有差（CI 重叠大）** | 路由 EU 在 rubric 上略高，证据弱；validation 无区分 |

**不得写：**「experience-skill 全面优于 baseline」或「full-prompt 整体最优」——因 A/B 未在所有对比中同向。

### 4.1 一致提升（唯一接近情形）

在 **task-responsive-dashboard** 子集内，full-prompt 相对 baseline 呈现 **A=1.0 且 B 最高**（82.27 vs 49.18），可限定表述为：「在该任务的 rubric 与 validation 上，full-prompt 均优于 baseline」。此结论 **不可** 外推到 list 任务（full-prompt 在 list 上 A 低于 baseline）。

---

## 5. 机制与个案

### 5.1 list-full-r01 — A↓ B↑ 分歧

- **Endpoint A:** `validation_pass_rate = 5/6`；失败项 `smoke-list-filter`（客户端筛选未生效，`run-log` notes）。
- **Endpoint B:** human 70.45 / llm 86.45（avg 78.45）；human 因 preview mock 缺失扣分，LLM 对 productization 更宽松。
- **机制假设:** 18-EU 全量 checklist 引导了更完整的 UI/产品化结构（高 rubric），但未保证 list 筛选逻辑的正确接线；与「清单覆盖 ≠ 行为正确性」一致。

### 5.2 Dashboard functional 瓶颈

四组在 dashboard 上 functional 均值 13.3–17.8/20，低于 list 的 ~20/20。Stress checks（窄 viewport、partial error、dense KPI）仍全部通过，说明 **自动测试与 rubric functional  band 衡量不同 construct**——A 天花板效应部分由此产生。

### 5.3 Reviewer 分歧（list 任务）

| run_id | human | llm | Δ | 可能机制 |
| --- | ---: | ---: | ---: | --- |
| list-skill-r01 | 75.67 | 91.67 | 16.0 | LLM 对 loading/empty 等产品化细节给分更高 |
| list-super-r02 | 75.00 | 88.67 | 13.67 | 同上 |
| list-full-r01 | 70.45 | 86.45 | 16.0 | human 严格对待 preview mock / 交互缺口 |

Dashboard runs 上 reviewer 完全一致（8/8），list 上 3/8 存在 ≥10 分 gap → **任务类型与 reviewer 通道交互** 应列入 threats。

---

## 6. Exploratory — async 9-run pilot

**不并入** v2 formal 统计。摘要来自 `experiments/task-async-form-full-rubric-summary.md`（仅 Endpoint B，llm-reviewer 单通道）：

| group | mean rubric_total /100 |
| --- | ---: |
| baseline | 74.67 |
| experience-skill | 90.22 |
| full-prompt | 85.48 |

Exploratory 与 formal v2 方向 **部分一致**（experience-skill > baseline on rubric），但 protocol、任务、reviewer 设计不同，**仅作方向性参考**。

---

## 7. Routing 有效性（B 侧只读引用）

来源：`experiments/routing/routing-metrics-v2.csv`（C 未重跑 eval）。

| router | task_id | precision@5 | recall | must_hit/must_total |
| --- | --- | ---: | ---: | --- |
| deterministic | task-list-page | 0.750 | 0.667 | 2/3 |
| deterministic | task-responsive-dashboard | 0.333 | 0.500 | 1/2 |
| semantic | task-list-page | 0.500 | 0.667 | 2/3 |
| semantic | task-responsive-dashboard | 0.333 | 0.500 | 1/2 |
| semantic | task-async-form | 0.750 | **1.000** | 3/3 |

Formal v2 中 experience-skill 注入 4–5 EU/run（`run-log.injected_experience_count`）。Routing recall 在 dashboard 上仅 0.5，与 dashboard rubric 上 experience-skill **未拉开** full-prompt 差距一致；list 上 recall 0.667 与 experience-skill rubric 介于 baseline 与 full-prompt 之间一致。

---

## 8. Per-run ledger（验收追溯）

| run_id | task | group | A | B avg | human | llm |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| list-skill-r01 | list | experience-skill | 1.000 | 83.67 | 75.67 | 91.67 |
| list-base-r01 | list | baseline | 1.000 | 65.34 | 62.67 | 68.00 |
| list-super-r02 | list | superpowers | 1.000 | 81.84 | 75.00 | 88.67 |
| list-full-r01 | list | full-prompt | 0.833 | 78.45 | 70.45 | 86.45 |
| list-base-r02 | list | baseline | 1.000 | 68.00 | 68.00 | 68.00 |
| list-super-r01 | list | superpowers | 1.000 | 62.67 | 62.67 | 62.67 |
| list-full-r02 | list | full-prompt | 1.000 | 87.00 | 87.00 | 87.00 |
| list-skill-r02 | list | experience-skill | 1.000 | 75.00 | 75.00 | 75.00 |
| dash-full-r02 | dash | full-prompt | 1.000 | 84.70 | 84.70 | 84.70 |
| dash-super-r01 | dash | superpowers | 1.000 | 56.83 | 56.83 | 56.83 |
| dash-skill-r01 | dash | experience-skill | 1.000 | 58.25 | 58.25 | 58.25 |
| dash-base-r02 | dash | baseline | 1.000 | 49.94 | 49.94 | 49.94 |
| dash-full-r01 | dash | full-prompt | 1.000 | 79.84 | 78.73 | 80.95 |
| dash-base-r01 | dash | baseline | 1.000 | 48.41 | 48.41 | 48.41 |
| dash-skill-r02 | dash | experience-skill | 1.000 | 62.81 | 62.81 | 62.81 |
| dash-super-r02 | dash | superpowers | 1.000 | 59.06 | 59.06 | 59.06 |

---

## 9. Threats to validity

1. **N=16（组内 n=4）** — 宽 CI；结论为描述性，非 confirmatory。
2. **Endpoint A 天花板** — 15/16 runs 为 6/6；discriminative power 不足，组间 A 差异仅 0.042（full-prompt vs others）。
3. **Platform-controlled generation** — model/temperature 未固定，组间公平性依赖 intervention 文本而非参数锁定。
4. **Superpowers 公平性** — 插件技能为指令增强，与 EU 注入形式不同；比较的是「工作流设计」而非 token 预算严格相等。
5. **Reviewer 主观性** — 单 human + LLM 并列，无双人 human κ；list 任务上 LLM 系统性偏高 productization。
6. **Partial EU evidence** — experience-skill 仅 3–5 EU，full-prompt 18 EU；非「同信息量」对照，而是「路由 vs 全量」工程 tradeoff。
7. **Task heterogeneity** — list 与 dashboard 难度不同； pooled 均值掩盖 task×group 交互。
8. **Exploratory async** — 不同 protocol/reviewer，不得与 formal 合并。

---

## 10. Conclusions（遵守 Conjunction Rule）

1. **Endpoint A：** 四组 automated validation 均接近饱和（组均值 0.958–1.000）；**不足以**区分 experience-skill 与 baseline/superpowers。唯一失败：`list-full-r01`（full-prompt）。
2. **Endpoint B：** full-prompt 组 rubric 均值最高（82.50），主要来自 **productization** 分项（37.31 vs baseline 23.44）；experience-skill 次之（69.93），superpowers 与 baseline 最低两档。
3. **experience-skill vs baseline：** 仅 rubric 维度有提升迹象；validation 无差异 → **限定为「rubric 上的改进假设」，非双 endpoint 一致提升**。
4. **full-prompt：** 呈现 **A↓ B↑** 相对 baseline 与 experience-skill → 报告 **分歧机制**（checklist 提升产品化可见度，但不保证全部 smoke 行为正确）。
5. **Routing：** B 侧 metrics 显示 dashboard recall 偏低，与 experience-skill 在 dashboard rubric 上未超越 full-prompt 相符；list 上 partial recall 与中间档 rubric 一致。
6. **Exploratory async** 支持 experience-skill rubric 方向，但 **不能** 作为 formal 主证据。

**Phase 5 验收：** 本文件完成；无「primary endpoint」措辞；结论均可追溯至 `run-log.csv`、`validation-results.csv`、`scores-v2.csv`。
