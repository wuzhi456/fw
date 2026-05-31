# Experience-augmented vibe coding — 实验报告（v2）

**Status:** Phase 5 complete（2026-05-29）  
**Protocol:** [`experiment-protocol-v2.md`](../experiment-protocol-v2.md)  
**Formal analysis:** [`experiments/analysis-v2.md`](../experiments/analysis-v2.md)

---

## 1. 问题与假设

**研究问题：** 在相同工具权限、相同 frozen task 文本、相同验收脚本下，`frontend-productization` 经验路由是否比 baseline、full-prompt checklist、Superpowers 通用工作流，带来更高的前端产品化质量？

**假设（可证伪）：**

- H1：experience-skill 在 **Endpoint A（validation）** 与 **Endpoint B（rubric）** 上相对 baseline **同时** 提升。
- H2：experience-skill 相对 Superpowers（强通用 baseline）在双 endpoint 上仍有优势。
- H3：full-prompt（18 EU 全量）与 experience-skill（3–5 EU 路由）存在 tradeoff：前者 rubric 更高，后者 token/注意力更省。

**双 co-primary 证据（同等重要，禁止分主次）：**

| Endpoint | 指标 | 来源 |
| --- | --- | --- |
| A | `validation_pass_rate` | Playwright smoke + stress |
| B | `rubric_total` /100 | human + LLM 盲评并列 |

---

## 2. 方法

### 2.1 资产与分工

| 角色 | 贡献 | C 使用方式 |
| --- | --- | --- |
| A | 18 EU、`extract-experience/` | 只读；experience-skill 注入源 |
| B | routing、`routing-metrics-v2.csv` | 只读引用 routing 有效性 |
| C | 16 runs、validation、盲评、分析 | 本报告 |

### 2.2 Formal 设计

- **任务：** `task-list-page`、`task-responsive-dashboard`（文本冻结）
- **四组：** baseline / full-prompt / experience-skill / superpowers
- **矩阵：** 2 × 4 × 2 = **16 runs**（`randomization-table-v2-16.csv`）
- **验收契约：** `experiments/tasks/VALIDATION-CONTRACT.md`
- **Build gate：** 仅 build 失败为 failed-run；16/16 build pass

### 2.3 Endpoint B 盲评

- 匿名包 `anon-001`…`anon-016`（无组别路径）
- human-reviewer-v2 + llm-reviewer-v2 各 16 runs → `scores-v2.csv`（32 行）

---

## 3. Routing 有效性（B 数据）

来源：[`experiments/routing/routing-metrics-v2.csv`](../experiments/routing/routing-metrics-v2.csv)

- **task-list-page：** deterministic P@5=0.75, recall=0.667；semantic P@5=0.50, recall=0.667
- **task-responsive-dashboard：** 两 router recall 均为 **0.50**（must_hit 1/2）
- **task-async-form（exploratory）：** semantic recall=**1.0**

Dashboard 上 routing recall 偏低，与 formal 实验中 experience-skill 在 dashboard rubric 上 **未超过** full-prompt 一致。List 上 partial recall 对应 experience-skill rubric 介于 baseline 与 full-prompt 之间。

---

## 4. 生成实验 — 双 endpoint 结果

完整表格与 per-run 见 [`experiments/analysis-v2.md`](../experiments/analysis-v2.md) §2–§8。

### 4.1 四组汇总（n=4 per group）

| group | Endpoint A | Endpoint B (avg) | productization | code |
| --- | ---: | ---: | ---: | ---: |
| baseline | 1.000 | 57.92 | 23.44 | 18.37 |
| experience-skill | 1.000 | 69.93 | 28.50 | 24.21 |
| full-prompt | 0.958 | **82.50** | **37.31** | 27.13 |
| superpowers | 1.000 | 65.10 | 25.12 | 22.75 |

### 4.2 任务分层

- **List：** functional ≈ 20/20 全组；组间差异主要在 productization/code
- **Dashboard：** functional 普遍 11–18/20；full-prompt 在 A、B 均为组内最高

---

## 5. 机制解释

### 5.1 full-prompt — A↓ B↑ 分歧

`list-full-r01`：rubric 高（尤其 LLM 通道）但 `smoke-list-filter` 失败（5/6）。机制：**全量 checklist 提升产品化可见元素，不保证交互逻辑正确接线**。

### 5.2 experience-skill — 仅 rubric 维度

相对 baseline：A 无差异（均 1.0），B +12 分（均值）。路由 4–5 EU 主要抬升 **productization** 分项，但不足以匹配 18 EU full-prompt。

### 5.3 Superpowers

相对 baseline rubric +7.2 分，validation 无差异。通用 agent 工作流略优于裸 prompt，但低于 full-prompt 的 checklist 覆盖。

### 5.4 Reviewer 通道

List 任务 3/8 runs 上 LLM 比 human 高 ≥10 分（productization  band）；dashboard 8/8 一致。结论对 list 任务的 rubric 解释应 **同时引用双通道**。

---

## 6. Exploratory — async 9-run

引用 [`experiments/task-async-form-full-rubric-summary.md`](../experiments/task-async-form-full-rubric-summary.md)：

| group | mean rubric |
| --- | ---: |
| baseline | 74.67 |
| experience-skill | 90.22 |
| full-prompt | 85.48 |

**不并入** formal v2 统计；与 formal 方向部分一致，protocol 不同。

---

## 7. 威胁与局限

1. N=16，组内 n=4 — 宽 CI，描述性为主  
2. Endpoint A 天花板（15/16 满分）— 区分度不足  
3. Platform-controlled 生成参数  
4. Superpowers vs EU 注入形式不对称  
5. 单 human + LLM，无双人 κ  
6. experience-skill 3–5 EU vs full-prompt 18 EU — 信息量不对等对照  
7. List / dashboard 异质性  

---

## 8. 结论（Conjunction Rule）

| 论断 | 依据 | 限定 |
| --- | --- | --- |
| full-prompt rubric 最高 | B 组均值 82.50，productization +14 vs baseline | 伴随 A 组均值 0.958（list-full-r01 失败）→ **非双 endpoint 一致** |
| experience-skill > baseline on rubric | B 69.93 vs 57.92 | A 无差异 → **仅 rubric 维度** |
| experience-skill vs superpowers | B 69.93 vs 65.10，CI 重叠 | 弱证据；A 无差异 |
| validation 区分四组 | A 组间最大差 0.042 | **不能** 支持强 validation 结论 |
| dashboard 上 full-prompt 一致优于 baseline | 该 task 子集 A=1.0 且 B 最高 | **不可** 外推到 list |

**总体：** 在 frozen v2 协议下，**full-prompt 在 rubric（尤其 productization）上最强，但以一次 list validation 失败为代价**；**experience-skill 相对 baseline 仅呈现 rubric 维度的提升，未达到双 endpoint 一致提升**。Routing partial recall 与 dashboard 上 experience-skill 未超越 full-prompt 相符。Exploratory async 提供方向性支持，非 formal 主证据。

---

## 附录 A — 数据文件索引

| 文件 | 说明 |
| --- | --- |
| `experiments/run-log.csv` | 25 行（9 async + 16 v2） |
| `experiments/validation-results.csv` | Endpoint A 明细 |
| `experiments/scores-v2.csv` | Endpoint B（32 行） |
| `experiments/analysis-v2.md` | 双 endpoint 正式分析 |
| `experiments/routing/routing-metrics-v2.csv` | B routing 指标 |

## 附录 B — Phase 6（可选）

Mini-repo pilot（baseline vs experience-skill 各 1 run）未执行，不阻塞答辩。见 `experiment-protocol-v2.md` §9。
