# C 任务执行手册（Experiment Protocol v2）

**角色：** Evaluation / Report Owner（C）  
**读者：** 执行本仓库 v2 实验的 Agent 或人工操作员  
**权威协议：** [`../experiment-protocol-v2.md`](../experiment-protocol-v2.md)  
**计划来源：** [`.omx/plans/experiment-redesign-v2-ralplan.md`](../.omx/plans/experiment-redesign-v2-ralplan.md)

---

## 0. 给执行 Agent 的总指令（复制整段到新会话）

```markdown
你是 FunctionWeaver 项目的 **C — Evaluation / Report Owner**。

请严格按 `experiments/C-EXECUTION-RUNBOOK.md` 从 **Phase 1** 顺序执行到 **Phase 5**（Phase 6 可选）。

## 边界
- ✅ 可做：validation 脚本、16 runs、run-log、validation-results、scores-v2、analysis-v2、报告
- ❌ 禁止：修改 `frontend-productization/experiences/`、`evidence/`、`extract-experience/`（A 资产）
- ❌ 禁止：修改 `scripts/route_experience_units*.py`、routing packets（B 资产）
- ❌ 禁止：把 async 9-run pilot 混入 v2 formal 统计

## 当前基线
- EU：18/18 complete，`python scripts/validate_frontend_productization_skill.py` → OK: 18 units
- B routing：已完成，只读引用
- v2 runs：**0/16 已执行**（16 目录 + run-log scaffold 已就绪，status=pending）
- validation 脚本：**已实现**（Phase 1 完成）
- Validation Contract：`experiments/tasks/VALIDATION-CONTRACT.md`（Phase 2，四组同等提供）

## 双 endpoint（同等重要，禁止分主次）
- Endpoint A：`validation_pass_rate`（smoke + stress 自动测试）
- Endpoint B：`rubric_total` /100（human + LLM 盲评并列）

每完成一个 Phase，汇报：产出路径、验收命令输出、阻塞项。
从 Phase 1 开始，不要跳过 validation 直接跑 16 runs。
```

---

## 1. C 的工作是什么（一句话）

**让 Agent 用 4 种方式各生成 2 个前端任务 2 遍（共 16 次），用「自动测试 + Rubric 盲评」两个同等重要的维度打分，写实验报告。**

---

## 2. 实验设计（冻结，执行期间不得改）

### 2.1 四组对照

| `group` | intervention 文件 | 含义 |
| --- | --- | --- |
| `baseline` | `experiments/interventions/baseline.md` | 只有题目，不加经验 |
| `full-prompt` | `experiments/interventions/full-prompt.md` | 题目 + 18 EU 全量 checklist |
| `experience-skill` | `experiments/interventions/experience-skill.md` | 题目 + frontend-productization 路由 3–5 EU |
| `superpowers` | `experiments/interventions/superpowers.md` | 题目 + Superpowers 插件全开 |

### 2.2 两个 formal 任务（题目文本冻结）

| task_id | 文件 |
| --- | --- |
| `task-list-page` | `experiments/tasks/task-list-page.md` |
| `task-responsive-dashboard` | `experiments/tasks/task-responsive-dashboard.md` |

### 2.3 Run 矩阵

```text
2 tasks × 4 groups × 2 replicates = 16 runs
```

执行顺序：**必须**按 `experiments/randomization-table-v2-16.csv` 的 `execution_order` 1→16。

### 2.4 Exploratory（不做、不重跑）

- `task-async-form` 已有 9 runs（2026-05-12）→ 报告 §Exploratory 引用即可

---

## 3. Phase 0 — 启动检查（≈0.5 天）

### 3.1 阅读

- [ ] `experiment-protocol-v2.md`
- [ ] 本文件
- [ ] `experiments/validation/CHECK_CATALOG.md`

### 3.2 环境验证

```powershell
cd FunctionWeaver
python scripts/validate_frontend_productization_skill.py
# 期望：OK: 18 units
```

### 3.3 冻结确认（记录到 `experiment-protocol-v2.md` §12 deviation log 或本文件底部 Sign-off）

- [ ] `randomization-table-v2-16.csv` 不修改
- [ ] 两个 task 文本不修改
- [ ] 四组 intervention 文本确认（superpowers 待负责人签字可标注 pending）

---

## 4. Phase 1 — Validation 基础设施（≈1–2 天）⭐ 必须先完成

**目标：** 任何一次 run 的 `output/` 目录都能一键跑 smoke/stress，结果写入 CSV。

### 4.1 要创建的文件

```text
experiments/validation/
├── README.md                 # 已有，补充用法
├── CHECK_CATALOG.md          # 已有，check 定义
├── run-validation.mjs        # CLI 入口（或 run-validation.py）
├── package.json              # 若 validation 需独立依赖
├── playwright.config.ts
├── specs/
│   ├── task-list-page.spec.ts
│   └── task-responsive-dashboard.spec.ts
└── fixtures/                 # mock API、测试数据
```

### 4.2 CLI 接口（冻结）

```powershell
node experiments/validation/run-validation.mjs `
  --task task-list-page `
  --output experiments/runs/task-list-page/baseline/rep-01/output `
  --run-id list-base-r01
```

**行为：**

1. 在 `--output` 目录执行 `npm install`（若 node_modules 不存在）和 `npm run build`
2. build 失败 → 打印 `gate-build: fail`，exit 1（**不**跑 Playwright）
3. build 成功 → 启动 dev server（或 preview），跑该 task 的全部 smoke+stress checks
4. 对每个 check 输出 pass/fail，并 **append** 到 `experiments/validation-results.csv`

### 4.3 validation-results.csv schema

```csv
run_id,task_id,group,rep,check_id,check_type,status,evidence_path,notes
```

- `status`: `pass` | `fail` | `not_applicable` | `not_testable`
- `check_type`: `smoke` | `stress`
- `evidence_path`: 截图或日志相对路径（可选）

### 4.4 必须实现的 checks

见 `experiments/validation/CHECK_CATALOG.md`：

**task-list-page（8 checks）：**  
`smoke-list-render`, `smoke-list-filter`, `stress-list-empty`, `stress-list-slow-fail-retry`, `stress-list-stale-filter`, `stress-list-large-page`

**task-responsive-dashboard（8 checks）：**  
`smoke-dash-render`, `smoke-dash-resize`, `stress-dash-narrow`, `stress-dash-long-text`, `stress-dash-partial-error`, `stress-dash-dense-kpi`

### 4.5 validation_pass_rate 计算

```text
validation_pass_rate = passed / (passed + failed)
```

不含 `not_applicable`、`not_testable`。`gate-build` 不计入分子分母。

### 4.6 Phase 1 验收

- [ ] 对 **golden stub** 或 `experiments/validation/fixtures/stub-app/` 跑通 CLI，exit 0
- [ ] `validation-results.csv` 至少有一行样例
- [ ] README 含完整调用示例

---

## 5. Phase 2 — Run 目录与 ledger 准备（≈0.5 天）

**状态：** 已完成（2026-05-29）。脚手架：`node experiments/scripts/scaffold-v2-runs.mjs`

### 5.0 Validation Contract（Endpoint A 公平性）

Playwright 依赖固定 `data-testid` 与 API 路径。Frozen task 文本不含这些操作钩子，**四组 Agent 提示必须同等附上**：

- 契约文件：[`experiments/tasks/VALIDATION-CONTRACT.md`](tasks/VALIDATION-CONTRACT.md)
- 仅 testid + API JSON 形状，**不算** rubric 泄题
- **禁止**仅给 experience-skill / full-prompt 组；baseline / superpowers 同样附上
- Agent **不得**在 `output/` 内添加 Playwright 测试文件

### 5.1 扩展 run-log.csv（v2 行追加在 async 9 行之后）

**`execution_order` 编号约定（避免与 async 1–9 冲突）：**

| 批次 | run-log `execution_order` | 执行顺序来源 |
| --- | --- | --- |
| async exploratory | 1–9 | 历史 pilot |
| v2 formal | **101–116** | `100 + randomization-table-v2-16.csv 的 execution_order` |

Phase 3 开跑顺序仍以 **`randomization-table-v2-16.csv`**（1→16）为准；`metadata.json` 内 `execution_order` 保留 v2 slot（1–16）。分析或排序 ledger 时用 `protocol_version=v2` 过滤，或按 101–116 排序。

v2 每行额外建议字段（可扩列或写入 `notes` JSON）：

- `protocol_version`: `v2`
- `build_status`: `pass` | `fail`
- `validation_pass_rate`
- `validation_checks_passed`
- `validation_checks_applicable`

现有 header 见 `experiments/run-log.csv`；v2 16 行 **必须**填齐：`start_time`, `end_time`, `duration_minutes`, `context_length_estimate`。

### 5.2 每次 run 目录结构

```text
experiments/runs/<task_id>/<group>/rep-0X/
├── metadata.json       # 从 templates/run-metadata.template.json，加 protocol_version: v2
├── output/             # Agent 生成的完整项目（含 package.json）
└── validation/         # 可选：本 run 的截图/日志
```

`planned_run_dir` 以 `randomization-table-v2-16.csv` 为准。

### 5.3 metadata.json 必填

```json
{
  "run_id": "list-base-r01",
  "protocol_version": "v2",
  "task_id": "task-list-page",
  "group": "baseline",
  "replicate": 1,
  "planned_run_dir": "experiments/runs/task-list-page/baseline/rep-01"
}
```

---

## 6. Phase 3 — 16 runs 执行（≈2–3 天）

### 6.1 单次 Run SOP

| 步 | 动作 |
| --- | --- |
| 1 | 查 randomization 表当前 slot 的 `task_id`, `group`, `replicate`, `planned_run_dir` |
| 2 | **新开** Cursor Agent 会话（四组相同 model/权限；记录 platform-controlled 若不可选） |
| 3 | 挂载 intervention + 粘贴 **frozen task 全文**（从 `experiments/tasks/<task>.md`） |
| 4 | 记录 `start_time` |
| 5 | Agent 生成代码 → 保存到 `planned_run_dir/output/` |
| 6 | 统计 `output_file_count`，记录 `injected_experience_count`（baseline=0, full-prompt=18, skill=3–5） |
| 7 | `cd output && npm install && npm run build` |
| 8 | build 失败 → `status=failed-run`, `failure_reason=build_failed`，**仍保留 output** |
| 9 | build 成功 → 跑 `run-validation.mjs`，写 validation-results |
| 10 | 记录 `end_time`, `duration_minutes`, `validation_pass_rate` |
| 11 | append `run-log.csv` |
| 12 | 记录 `execution_quality_verdict`（VALID / VALID_WITH_LIMITATIONS / INVALID） |

**公平性：**

- validation 脚本 **只在生成结束后** 由 C 运行，不预先给 Agent
- Superpowers 组不得比其它组多给测试文件
- 建议 wall-clock 上限 **45 min/run**；超时记 failed-run 可 retry 1 次

### 6.2 各组 Agent 提示模板

**所有组共同追加（Validation Contract — 四组同等）：**

```markdown
## Validation contract (Endpoint A)
实现 frozen task 的同时，必须满足 operational hooks：
`experiments/tasks/VALIDATION-CONTRACT.md`
- 使用文档中列出的每个 `data-testid`（名称完全一致）
- 实现文档中的 API 路径与 JSON 形状
- 不要在 output/ 中添加 Playwright 或 validation 测试文件
```

**Baseline：**

```markdown
按 experiments/interventions/baseline.md 执行。
任务全文（不可改）：
---
[paste experiments/tasks/<TASK>.md 全文]
---
[粘贴上方 Validation contract 块]
将完整可运行前端项目写入：experiments/runs/<PATH>/output/
```

**Full Prompt：**

```markdown
按 experiments/interventions/full-prompt.md 执行。
任务 + experiments/full-prompt-checklist.md 全文。
[粘贴上方 Validation contract 块]
输出目录：experiments/runs/<PATH>/output/
```

**Experience Skill：**

```markdown
按 experiments/interventions/experience-skill.md 执行。
1. 运行：python scripts/route_experience_units.py --task-file experiments/tasks/<TASK>.md --stage coding
2. 读取 router 输出，注入 3–5 条 EU 的 coding 段
3. 完成任务，输出到 experiments/runs/<PATH>/output/
[粘贴上方 Validation contract 块]
记录 injected_experience_count。
```

**Superpowers：**

```markdown
按 experiments/interventions/superpowers.md 执行。
Superpowers 插件全开；不要启用 frontend-productization 或 full-prompt checklist。
任务全文 + [粘贴上方 Validation contract 块]
输出目录 experiments/runs/<PATH>/output/
```

### 6.3 16 runs 清单（execution_order）

| order | run_id | task | group | rep | output 目录 |
| ---: | --- | --- | --- | ---: | --- |
| 1 | list-skill-r01 | task-list-page | experience-skill | 1 | `.../task-list-page/experience-skill/rep-01/output` |
| 2 | list-base-r01 | task-list-page | baseline | 1 | `.../baseline/rep-01/output` |
| 3 | list-super-r02 | task-list-page | superpowers | 2 | `.../superpowers/rep-02/output` |
| 4 | list-full-r01 | task-list-page | full-prompt | 1 | `.../full-prompt/rep-01/output` |
| 5 | list-base-r02 | task-list-page | baseline | 2 | `.../baseline/rep-02/output` |
| 6 | list-super-r01 | task-list-page | superpowers | 1 | `.../superpowers/rep-01/output` |
| 7 | list-full-r02 | task-list-page | full-prompt | 2 | `.../full-prompt/rep-02/output` |
| 8 | list-skill-r02 | task-list-page | experience-skill | 2 | `.../experience-skill/rep-02/output` |
| 9 | dash-full-r02 | task-responsive-dashboard | full-prompt | 2 | `.../full-prompt/rep-02/output` |
| 10 | dash-super-r01 | task-responsive-dashboard | superpowers | 1 | `.../superpowers/rep-01/output` |
| 11 | dash-skill-r01 | task-responsive-dashboard | experience-skill | 1 | `.../experience-skill/rep-01/output` |
| 12 | dash-base-r02 | task-responsive-dashboard | baseline | 2 | `.../baseline/rep-02/output` |
| 13 | dash-full-r01 | task-responsive-dashboard | full-prompt | 1 | `.../full-prompt/rep-01/output` |
| 14 | dash-base-r01 | task-responsive-dashboard | baseline | 1 | `.../baseline/rep-01/output` |
| 15 | dash-skill-r02 | task-responsive-dashboard | experience-skill | 2 | `.../experience-skill/rep-02/output` |
| 16 | dash-super-r02 | task-responsive-dashboard | superpowers | 2 | `.../superpowers/rep-02/output` |

### 6.4 Phase 3 验收

- [ ] 16 个 `planned_run_dir` 存在
- [ ] `run-log.csv` 含 v2 的 16 行（含 failed-run 与 retry 说明）
- [ ] build 通过的 run 均有 validation-results 行

---

## 7. Phase 4 — Endpoint B 盲评（≈1–2 天）

### 7.1 匿名化

1. 为每个 **build 通过** 的 run 分配 `anon-001` … `anon-016`（operator-only map 不提交或 gitignore）
2. 复制 `output/` 到 `experiments/anonymous-submissions/anon-XXX/source/`
3. 删除路径中的 `baseline`/`skill`/`full-prompt`/`superpowers` 字样
4. 给 reviewer 的包：**仅** task 文本 + 源码 + build 说明 + rubric

见 `experiments/anonymous-submissions/README.md`。

### 7.2 评分

- 依据：`rubric.md` + `experiments/full-rubric-review-instructions.md`
- **Human** 与 **LLM** 各评一遍（并列，均非 supplementary）
- 输出：`experiments/scores-v2.csv`

```csv
run_id,anon_id,reviewer_id,reviewer_type,rubric_total,functional,productization,code,review_json_path
```

- `reviewer_type`: `human` | `llm`
- 任一 metric 0–3  band 差异 ≥2 → adjudication，记录原因

### 7.3 与 Endpoint A 的关系

- build 失败 → 不进 A/B 均值统计，ledger 保留
- build 通过 → **必须**同时有 validation 结果 **和** rubric 分数（即使 validation 全 fail）

### 7.4 Phase 4 验收

- [ ] scores-v2.csv：每个有效 run 至少 1 human + 1 llm 行
- [ ] reviewer 评分前未查看 run-log 组别

---

## 8. Phase 5 — 分析与报告（≈1–2 天）

### 8.1 产出 `experiments/analysis-v2.md`

**必须包含：**

1. **同一张表**并列四组的：
   - mean `validation_pass_rate` ± CI
   - mean `rubric_total` ± CI
   - 分项：functional / productization / code
2. **Conjunction Rule**（禁止写 primary/secondary）：
   - A↑ B↑ → 可写一致提升
   - A↑ B↓ 或相反 → 必须写分歧机制
   - 仅一维显著 → 限定表述维度
3. **Exploratory**：async 9-run 摘要（引用 `experiments/task-async-form-full-rubric-summary.md`）
4. **Routing 引用**：B 的 `experiments/routing/routing-metrics-v2.csv`（C 不重跑 eval）
5. **Threats**：N=16、platform-controlled、Superpowers 公平性、reviewer 主观、partial EU 证据

### 8.2 更新 `docs/experience-augmented-vibe-coding-report.md`

报告结构：

1. 问题与假设  
2. 方法（引用 A extract-experience + B routing + v2 四组设计）  
3. Routing 有效性（B 数据）  
4. 生成实验双 endpoint 结果  
5. 机制解释（可引用 B evidence-of-use，若已有）  
6. 威胁与局限  
7. 结论（遵守 Conjunction Rule）  

### 8.3 Phase 5 验收

- [ ] analysis-v2.md 完成
- [ ] 报告无「primary endpoint」措辞
- [ ] 强结论均有 run-log + validation + scores 支撑

---

## 9. Phase 6 — Mini-repo 附录（可选）

不阻塞答辩。若做：

1. 起草 `experiments/tasks/task-mini-admin-repo.md`
2. 2 runs：baseline vs experience-skill 各 1
3. `scripts/validate_mini_repo.py` 行为等价验收
4. 报告附录一节

---

## 10. 引用 B / A 的方式（C 只读）

| 内容 | 路径 |
| --- | --- |
| Routing metrics | `experiments/routing/routing-metrics-v2.csv` |
| Routing packets | `experiments/routing/routing-packets/task-list-page-packet.md` 等 |
| EU 方法 | `extract-experience/case-studies/regeneration-summary-20260525.md` |
| 18 EU | `frontend-productization/experience-index.json` |

**B 在 C Phase 3 完成后**可补 `experiments/evidence-of-use-v2.md`（非 C 阻塞项）。

---

## 11. 禁止项 checklist

- [ ] 不修改 18 EU / evidence 文件  
- [ ] 不修改 routing 脚本与 packets  
- [ ] 不将 async pilot 并入 v2 formal 统计  
- [ ] 不在 validation 脚本就绪前批量跑 16 runs  
- [ ] 报告不写「validation 主、rubric 辅」  

---

## 12. 完成定义（Definition of Done）

| # | 标准 |
| --- | --- |
| 1 | Phase 1 validation CLI 对 stub 跑通 |
| 2 | v2 formal 16 runs 完成，run-log 16 行 |
| 3 | validation-results 覆盖 build 通过的 runs |
| 4 | scores-v2 human + LLM 并列 |
| 5 | analysis-v2 双 endpoint 同表 + Conjunction Rule |
| 6 | 最终报告可答辩 |
| 7 | async pilot 仅 exploratory |

---

## 13. 推荐执行顺序（给 Agent 的 Phase 清单）

```text
Phase 0  启动检查 + EU validate
Phase 1  实现 validation 套件 ⭐
Phase 2  run 目录模板 + ledger 列扩展
Phase 3  randomization 1→16 逐 run 生成 + build + validate
Phase 4  匿名化 + rubric 盲评（human + LLM）
Phase 5  analysis-v2 + 最终报告
Phase 6  mini-repo 附录（可选）
```

---

## Sign-off（负责人填写）

| 项 | 签字 | 日期 |
| --- | --- | --- |
| superpowers.md | | |
| 双 endpoint 公式 | | |
| CHECK_CATALOG 冻结 | | |
| 首次 v2 run 开跑 | | |

---

*文档版本：2026-05-25 · Protocol v2*
