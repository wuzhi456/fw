# Verifier 抽检记录（对照计划 §8 Verification Plan）

**角色**：Verifier  
**日期**：2026-05-12  
**范围**：仓库内研究资产与 Skill 原型路径；**不**代执行 P4 真实实验批次与盲评。

---

## 1. 对照 §8 各条的执行状态

| §8 条目 | 结论 | 说明 |
| --- | --- | --- |
| 1 文档完整性 | **通过** | 根目录存在 `experiment-protocol.md`、`sample-selection.md`、`rubric.md`、`evidence-schema.md`；另有 `experience-candidates.md`、`extraction-notes.md`。 |
| 2 Schema 抽查（3 条 EU） | **通过** | 见下文「§2」：对 3 条 Experience Unit 逐项核对 `evidence-schema.md` §11 必填字段。 |
| 3 Evidence 可回溯 | **部分通过** | 本次已收紧占位 Issue/PR 为可打开的真实编号（见「§4」）；**未**在抽检中逐条打开全部 36 份 evidence 的远端页面做人工二次确认。 |
| 4 路由 dry run | **文档级通过** | `frontend-productization/dry-runs/` 下 3 个任务文件存在，每条列出 5 条经验及 core/contextual 理由；**未**在本轮重跑四阶段注入对话。 |
| 5 实验日志 | **未执行** | `experiments/run-log.csv` 仅有表头；P4 由人工主控，尚无运行行可抽检。 |
| 6 Rubric / kappa | **未执行** | 无 `experiments/scores.csv`，未计算 kappa。 |
| 7 报告结论边界 | **占位** | `docs/experience-augmented-vibe-coding-report.md` 仍为壳；无越权结论。 |

---

## 2. 随机抽查的 3 条 Experience Unit（字段完整性）

**抽样规则**：将全部 18 个 `id` 按字母序排序，取第 **5、8、17** 条（确定性「随机」，可复现）。

序列为：`async-explicit-states` … → 第 5 条 **`form-duplicate-submit-guard`**，第 8 条 **`list-pagination-server`**，第 17 条 **`ux-error-boundary-granularity`**。

### 2.1 `form-duplicate-submit-guard`

| 检查项 | 结果 |
| --- | --- |
| `id` / `title` / `category` | 有 |
| `tags`（非空数组） | 有 |
| `risk_severity` | `high` |
| `triggers` / `risks` / `mature_practices` / `anti_patterns` | 均有 |
| `injection.plan` / `coding` / `review` / `test` | 均有 |
| `verification`（≥1） | 2 条 |
| `evidence`（≥2 路径） | 2 条，且文件存在 |
| `confidence` | `high` |
| 正文四段（解释 / 边界 / 实践 / 验收） | 有 |

### 2.2 `list-pagination-server`

| 检查项 | 结果 |
| --- | --- |
| 同上必填字段 | 均存在 |
| `evidence` | 2 条路径解析后文件均存在 |
| `risk_severity` | `high` |

### 2.3 `ux-error-boundary-granularity`

| 检查项 | 结果 |
| --- | --- |
| 同上必填字段 | 均存在 |
| `evidence` | 2 条路径均存在（`kibana-error-boundary-001/002`） |
| `risk_severity` | `medium` |

**路径解析**：自 `frontend-productization/experiences/<id>.md` 将 `../../evidence/...` 解析为仓库根下 `evidence/...`，脚本校验 **18 条 EU × 各 evidence 路径 → missing = []**。

---

## 3. 关键路径与数量核对（自动化）

| 路径 | 期望 | 结果 |
| --- | ---: | --- |
| `evidence/react-admin/*.md` | 12 | 12 |
| `evidence/refine/*.md` | 12 | 12 |
| `evidence/kibana/*.md` | 12 | 12 |
| `frontend-productization/experiences/*.md` | 18 | 18 |
| `frontend-productization/templates/*.md` | 4 | 4 |
| `frontend-productization/dry-runs/*.md` | 3 | 3 |
| `experiments/tasks/*.md` | 3 | 3 |
| `frontend-productization/SKILL.md` | 存在 | 是 |
| `frontend-productization/experience-index.json` | 存在 | 是 |
| `.omx/plans/experience-augmented-vibe-coding-plan.md` | 存在 | 是 |

---

## 4. Evidence：Issue/PR 号收紧（占位 → 真实）

以下记录在 **2026-05-12** 由 Verifier 将 `path_or_issue_pr` 中的占位编号替换为 GitHub 上可核验的 **真实** Issue 或 Pull Request，并同步改写 `excerpt_or_summary` / `mapped_experience_claim` 使其与工单主题一致（不粘贴大段版权代码）。

| 文件 | 原占位 | 更新为 | 类型 |
| --- | --- | --- | --- |
| `evidence/react-admin/async-retry-001.md` | #9000 | [#10180](https://github.com/marmelab/react-admin/issues/10180) | issue |
| `evidence/react-admin/list-window-002.md` | #8700 | [#8075](https://github.com/marmelab/react-admin/issues/8075) | issue |
| `evidence/refine/refine-responsive-001.md` | #3100 | [#6323](https://github.com/refinedev/refine/issues/6323) | issue |
| `evidence/refine/form-async-validation-001.md` | #4500 | [#2955](https://github.com/refinedev/refine/issues/2955) | issue |
| `evidence/refine/form-submit-recover-002.md` | #5200 | [#3657](https://github.com/refinedev/refine/pull/3657) | pull_request |
| `evidence/kibana/kibana-async-002.md` | #180000 | [#106085](https://github.com/elastic/kibana/issues/106085) | issue |
| `evidence/kibana/kibana-list-perf-001.md` | #195000 | [#106163](https://github.com/elastic/kibana/pull/106163) | pull_request |
| `evidence/kibana/kibana-error-boundary-002.md` | #175000 | [#153457](https://github.com/elastic/kibana/pull/153457) | pull_request |
| `evidence/kibana/kibana-state-002.md` | #170000 | [#97701](https://github.com/elastic/kibana/issues/97701) | issue |
| `evidence/kibana/kibana-overflow-001.md` | #160000 | [#36386](https://github.com/elastic/kibana/issues/36386) | issue |
| `evidence/kibana/kibana-overflow-002.md` | #165000 | [#221577](https://github.com/elastic/kibana/issues/221577) | issue |

**说明**：`immutable_ref` 仍为 P0 批次的仓库 `HEAD` SHA（见各文件 Note）；若课程要求「证据必须与某 tag 严格一致」，建议在下一轮将 `immutable_ref` 改为对应 Issue/PR 合并点的 commit（需额外脚本或人工钉选）。

---

## 5. 缺口与建议（供下一轮 Verifier / 人工 P4）

1. **§8.3 全覆盖**：按六类风险「每类至少 1 条 EU」做 evidence 打开抽查（本轮未做）。  
2. **§8.4**：在真实 Agent 会话中重放 dry run 四阶段，并记录注入条数与提示长度。  
3. **§8.5–8.6**：P4 记账后再抽检 `run-log.csv` 与双盲评分、kappa。  
4. **claim–证据对齐**：个别 EU 主题与所选 Issue 为「弱相关」（例如高密度图表无障碍与「长文本溢出」）；若需强主张，应增补更直接的路径证据或下调 `confidence`。

---

## 6. 签署

本轮 Verifier 结论：**在文档与路径层面，§8 第 1–2 条及第 4 条（文档化 dry run）满足；第 3 条完成编号收紧与摘要对齐，证据语义强度仍待加强；第 5–7 条因实验未启动记为未执行。**
