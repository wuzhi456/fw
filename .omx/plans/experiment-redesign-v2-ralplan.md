# RALPLAN: Experiment Redesign v2 (C-owned)

**Status:** Approved for execution  
**Date:** 2026-05-24  
**Input:** `.omx/specs/deep-interview-experiment-redesign.md`  
**Owner:** **C — Evaluation / Report** (用户确认：v2 实验全流程由 C 负责)  
**Output protocol:** `experiment-protocol-v2.md`

---

## RALPLAN-DR Summary

### Principles

1. **双 endpoint 同等重要** — `validation_pass_rate` 与 `rubric_total` 并列报告；Conjunction Rule 约束结论。
2. **C 端到端负责 v2 执行** — 协议、脚本、runs、评分、分析、报告；不修改 A 的 EU/evidence，不执行 B 的 routing eval（只读引用）。
3. **强对照公平** — Superpowers 全开 + 能力/预算/验收三公平写入 protocol。
4. **可复现优先** — frozen task、intervention、validation 脚本、randomization CSV、append-only ledger。
5. **诚实边界** — N=16、async pilot exploratory、平台参数 platform-controlled 必须在 threats 写明。

### Decision Drivers

1. 答辩需反驳「稻草人 baseline」→ 第四组 Superpowers。
2. 用户要求 smoke/stress 与 rubric **不分主次** → 双 co-primary。
3. 课程周期 → 2 任务 × 4 组 × 2 reps，async 9 runs 保留为 exploratory。

### Viable Options

| Option | 描述 | 优点 | 缺点 | 结论 |
| --- | --- | --- | --- | --- |
| **A. v2 全量替换 v1 正式分析** | 16 runs + 双 endpoint + Superpowers | 对照完整、答辩故事清晰 | 工作量大 | **采用** |
| **B. 仅加 Superpowers 重跑 async** | 在 9 runs 上扩组 | 省时 | 任务覆盖不足；与 spec 冲突 | 否决 |
| **C. 官方 RepoZero 作主实验** | Python 仓库复现 | 学术亮点 | 与前端 EU 研究问题错位 | 否决；仅 mini-repo 附录 |

**Invalidation:** B 不满足 2-task formal 矩阵；C 超 scope 且 C 人力不足。

### Architect Review (synthesis)

- **Antithesis:** C 一人负责 16 runs + 双 endpoint + 脚本 + 报告，存在执行瓶颈。
- **Mitigation:** Phase 1 先 frozen validation 脚本；Phase 2 批量 agent runs（并行 subagent）；Phase 3 评分可 human+LLM 并行；mini-repo 附录最后做。
- **Verdict:** **APPROVE** with phased execution.

### Critic Verdict: **APPROVE**

- AC-1–AC-7 可测；与 `小组分工` C 角色对齐（v2 扩展后）。
- 残留风险：Superpowers 在 Endpoint A 可能系统性偏高 — 已在 Conjunction Rule 要求分项报告。

---

## Role boundary (C vs A/B)

| 工作项 | Owner |
| --- | --- |
| `experiment-protocol-v2.md`、validation 脚本、randomization v2 | **C** |
| 16 runs 执行 + ledger + validation-results + scores | **C** |
| `superpowers.md` intervention 起草 | **C**（用户签字） |
| `task-mini-admin-repo.md` + validate script | **C** |
| `analysis-v2.md` + 最终报告 | **C** |
| 18 EU / evidence / extract-experience | **A**（C 只读） |
| routing packets / metrics / evidence-of-use 定义 | **B**（C 只读引用；可选 C 做 skill 组 EoU 表格若 B 未完成） |
| async 9 runs | 已完成；**C** 写 exploratory 节 |

---

## Implementation plan (C execution order)

### Phase 0 — 冻结与签字（0.5 天）

| Step | Action | Output | Done when |
| --- | --- | --- | --- |
| 0.1 | 通读 `experiment-protocol-v2.md` + spec | — | C 确认 |
| 0.2 | 用户签字：四组 intervention + §7 公式 | sign-off in deviation log | 签字完成 |
| 0.3 | 冻结 `randomization-table-v2-16.csv` | CSV | 16 rows |

### Phase 1 — Validation 基础设施（1–2 天）

| Step | Action | Output | Done when |
| --- | --- | --- | --- |
| 1.1 | 编写 `experiments/validation/CHECK_CATALOG.md` | check_id 定义 | 与 protocol §7.2 一致 |
| 1.2 | 选型 Playwright；加 `experiments/validation/run-validation.mjs` | runner | stub output exit 0 |
| 1.3 | 实现 list + dashboard smoke/stress specs | `*.spec.ts` | 对 golden stub 跑通 |
| 1.4 | 初始化 `validation-results.csv` schema | header row | 与 protocol 一致 |
| 1.5 | 文档：如何在 run `output/` 上调用 runner | `experiments/validation/README.md` | C 可复现 |

### Phase 2 — Intervention 与任务（0.5 天）

| Step | Action | Output | Done when |
| --- | --- | --- | --- |
| 2.1 | 新增 `experiments/interventions/superpowers.md` | 冻结 Superpowers 全开指令 | 用户签字 |
| 2.2 | 更新 `baseline.md` task 列表（v2 两任务） | diff | 无 async 作 formal |
| 2.3 | 确认 list/dashboard task 文本无需改 | — | frozen |
| 2.4 | 更新 `experiments/README.md` 指向 v2 | doc | P4 layout 更新 |

### Phase 3 — 16 runs 执行（2–3 天）

| Step | Action | Output | Done when |
| --- | --- | --- | --- |
| 3.1 | 按 randomization 表逐 slot 执行 | `experiments/runs/<task>/<group>/rep-0X/` | 16 dirs |
| 3.2 | 每 run：build gate → validation → 记录 ledger | run-log 16 rows | 字段完整 |
| 3.3 | 失败 run：retry 至多 1 次；保留 failed 行 | deviation if needed | logged |
| 3.4 | 每 run `metadata.json` 含 protocol_version=v2 | JSON | spot-check 4/16 |

**Run SOP（C）：**

```text
1. Open fresh agent session (same model settings all groups)
2. Attach intervention per group
3. Paste frozen task text only (baseline) or task + intervention steps
4. Record start_time
5. Save output to planned_run_dir
6. npm install && npm run build in output/
7. run-validation.mjs → validation-results.csv
8. Record end_time, duration, validation_pass_rate
9. Copy to anonymous-submissions when ready for Endpoint B
```

### Phase 4 — Endpoint B 评分（1–2 天）

| Step | Action | Output | Done when |
| --- | --- | --- | --- |
| 4.1 | 匿名化 16 outputs | `anonymous-submissions/` | 无 group 泄漏 |
| 4.2 | Human rubric 评分 | scores-v2.csv rows | 16×human |
| 4.3 | LLM rubric 评分（独立） | scores-v2.csv rows | 16×llm |
| 4.4 | Adjudicate ≥2pt diffs | adjudication log | resolved |
| 4.5 | 可选：第二 human → kappa | report section | if feasible |

### Phase 5 — 分析与报告（1–2 天）

| Step | Action | Output | Done when |
| --- | --- | --- | --- |
| 5.1 | 汇总双 endpoint 四组表 | `analysis-v2.md` | 同表并列 |
| 5.2 | 应用 Conjunction Rule 写结论段 | analysis §Conclusions | 无 primary/secondary 措辞 |
| 5.3 | Exploratory：async pilot + B routing 引用 | analysis §Exploratory | 与 formal 分离 |
| 5.4 | 更新最终报告 shell | `docs/experience-augmented-vibe-coding-report.md` | 可答辩 |
| 5.5 | Threats + fairness + limitations | report §8 | 完整 |

### Phase 6 — Mini-repo 附录（可选，不阻塞答辩）

| Step | Action | Output | Done when |
| --- | --- | --- | --- |
| 6.1 | 起草 `task-mini-admin-repo.md` | task file | user review |
| 6.2 | 2 pilot runs + validate script | appendix data | 报告可引用 |

---

## Acceptance criteria (maps to spec AC-1–7)

| ID | C 验收 |
| --- | --- |
| AC-1 | `experiment-protocol-v2.md` 存在且用户签字 |
| AC-2 | validation 脚本对 stub exit 0 |
| AC-3 | 16 runs + validation-results 满行 |
| AC-4 | `superpowers.md` 存在 |
| AC-5 | `analysis-v2.md` 双 endpoint 并列 |
| AC-6 | mini-repo 附录（可选） |
| AC-7 | 报告 threats + async exploratory |

---

## Timeline suggestion (C solo)

| Week | Focus |
| --- | --- |
| W1 | Phase 0–2（冻结 + validation + interventions） |
| W2 | Phase 3–4（16 runs + 评分） |
| W3 | Phase 5–6（分析 + 报告 + 附录） |

---

## Handoff to execution

- **`$ralph` / `$autopilot`:** 从 Phase 1 Step 1.1 开始实现 validation 目录。
- **C 人工：** Phase 3 agent runs 需 Cursor 会话；C 作为 operator 记录 ledger。

**Do not** edit A/B owned assets except read-only citation.
