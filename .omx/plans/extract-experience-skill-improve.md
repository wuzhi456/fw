# Plan: extract-experience SKILL 改进（P1 核验 + B/E 门槛）

**Status:** Executed (Ralph 2026-05-20)  
**Source of truth:** `.omx/specs/deep-interview-extract-experience-improve.md`  
**Context:** `.omx/context/extract-experience-improve-20260520T124600Z.md`  
**Owner:** Person A · Week 1  
**Last updated:** 2026-05-20

---

## RALPLAN-DR Summary

### Principles

1. **流程可执行优先**：SKILL 必须让 Agent/人工能按步骤完成 P1 批次与核验，而非重复计划文档摘要。
2. **门槛先于晋升**：先过 **B（链接）** 再过 **E（EU 证据）**；`weak` 不得 `add`。
3. **脚本冻结**：`apply_evidence_audit.py` 仅作参照；合规性由 SKILL 内 checklist 保证。
4. **可追溯写入**：任何 `merge/add/park/conflict/replace` 必须同步 `extraction-notes.md`、`candidate-registry.md` 或 audit 表。
5. **范围克制**：Week 1 仅 retrofit audit 点名项；长期新批次 B+E，旧 18 条 EU 默认不动（政策 C）。

### Decision Drivers

1. **核验深度弱于 Kibana 批次** — 缺批次日志 + B/E 硬门槛的 SKILL 级编排。
2. **Week 1 A 交付** — skill、audit、case study、registry 规则须在课程周期内可验收。
3. **Agent 自主权（1–6）** — 无脚本二次 enforcement，需 checklist + 登记表防漂移。

### Viable Options

| Option | 描述 | 优点 | 缺点 | 结论 |
| --- | --- | --- | --- | --- |
| **A. SKILL 单体扩写** | 在 `extract-experience/SKILL.md` 内嵌完整 P1/B/E/冲突流程 | 单文件入口、Cursor 友好 | 300+ 行可降低遵从率 | **采用（主）** |
| **B. SKILL + templates/** | A + `templates/batch-log.md`、`evidence-checklist.md` | 可打印 checklist、减 SKILL 长度 | 多文件同步成本 | **采用（辅）** |
| **C. 重写 audit 脚本** | 扩展 `apply_evidence_audit.py` 强制执行 B/E | 机器可验证 | 违反 deep-interview Non-goal A | **否决** |
| **D. 全量 36 evidence 回填 B+E** | Week 1 统一拉高 corpus | 证据一致 | 超 Week 1 范围、与政策 A/C 冲突 | **否决** |

**Alternatives invalidation:** C 与用户 Non-goal 冲突；D 与 Round 5（A 现在 + C 长期）冲突。

### Architect Review (synthesis)

- **Antithesis：** 单体 SKILL 过长时 Agent 会跳步，反而比现状更弱。
- **Tradeoff：** 长度 vs 可执行性。
- **Synthesis：** 主 SKILL 控制在 ~250–320 行；把 B/E 核对表抽到 `templates/evidence-checklist.md`；每节用「输入 → 动作 → 产出路径 → 失败则」四段式。

### Critic Verdict: **APPROVE**

- 原则与选项一致；验收可测；验证步骤含 spot-check 与 validate 脚本（EU 路径）。
- 建议已合并：明确 Week 1 retrofit 清单；SKILL 章节顺序与 spec §Recommended structure 对齐。

---

## Requirements Summary

将 `extract-experience` 从清单升级为 **P1 可执行协议**，核心能力：

1. **批次采集**：对齐 `docs/experience-augmented-vibe-coding-plan.md` §P1 与 `extraction-notes.md` 字段。
2. **核验 B+E**：链接可打开 + EU 晋升双证据门槛。
3. **登记与冲突**：五维查重 → merge/add/park/conflict；Agent 可自主 1–6 但须写 registry/audit。
4. **P2 交接**：指向 `frontend-productization/experiences/` 与 `experience-index.json`，不复制完整 EU schema。
5. **Retrofit 政策**：Week 1 仅处理 audit/case-study 点名 EU；长期新批次 B+E。

---

## Acceptance Criteria

| ID | 标准 | 验证方式 |
| --- | --- | --- |
| AC-1 | `extract-experience/SKILL.md` 含 P1 批次协议（query/scope/cap/批次行写入 `extraction-notes.md`） | 人工按 SKILL 跑 1 个虚构批次 checklist |
| AC-2 | SKILL 含 **Gate B**（`verification_status` ≥ `verified_path`，失败有 notes）与 **Gate E**（≥2 evidence，≥1 strong 或 partial+high） | 用 `ux-fallback` 换证批次走一遍并填表 |
| AC-3 | SKILL 含 merge/add/park/conflict 五维表 + 优先级 + `candidate-registry.md` 列定义 | 抽查 registry 新行格式 |
| AC-4 | `.cursor/skills/extract-experience/SKILL.md` 指向 canonical 或内容同步 | diff 两路径 front matter + 路由段 |
| AC-5 | Week 1 retrofit 清单内 EU 达到 B+E 或 audit 表注明降级 caveat | 更新 `evidence-audit-table.md` + 对应 `evidence/*` |
| AC-6 | 现有 case study 与 SKILL 流程一致（或更新 case study 一节「按新 SKILL §x」） | 读 `case-studies/gitlab-ux-error-feedback.md` |
| AC-7 | `python scripts/validate_frontend_productization_skill.py` 仍通过（若改 EU evidence 路径） | 命令 exit 0 |

---

## Week 1 Retrofit Watchlist（政策 A）

优先处理 deep-interview + 分工 + case study 点名项（非全表 18 条）：

| EU / 主题 | 当前信号 | 动作 |
| --- | --- | --- |
| `ux-fallback-recoverable-errors` | case study: **replace** 换证 | 新 evidence 满足 B+E，更新 EU `evidence:` 列表 |
| `ux-error-boundary-granularity` | 分工低置信复核 | 确认 kibana/gitlab 证据是否已达 E；不足则补 1 条 `verified` PR/Issue |
| `form-duplicate-submit-guard` | audit: 待第三样本 | 可选：补 1 条交叉样本或 audit 注明 `keep with caveat` |
| Candidate `C-029`/`C-030` | registry: 低置信需替换 | merge 已完成则改 EU 证据，否则 park |

不在 Week 1 强制 B+E 回填：`async-*` 等 audit `keep` 且 notes 无 replace 的条目（政策 C）。

---

## Implementation Steps

### Step 1 — 基线对齐（只读）

- 通读 `extract-experience/SKILL.md`、`evidence-schema.md`、`extraction-notes.md` `B-kb-*` 行、`evidence/kibana/kibana-error-boundary-002.md`（强证据样例）。
- 在 SKILL 草案顶部增加 **版本 bump** `1.2.0` 与 changelog 一行。

**Files:** 无写入，仅阅读。

### Step 2 — 模板（可选但推荐）

创建：

- `extract-experience/templates/batch-log-row.md` — 单行模板对齐 `extraction-notes.md` 表头。
- `extract-experience/templates/evidence-checklist.md` — Gate B / Gate E 勾选表 + fail actions（park / replace / downgrade）。

**Files:** `extract-experience/templates/*.md`

### Step 3 — 重写 SKILL 核心章节

按顺序写入 `extract-experience/SKILL.md`：

1. 触发 + 执行根（保留）
2. **§P1 批次协议** — 输入维度、cap≤10、写入 `../../extraction-notes.md` 示例路径
3. **§Evidence 撰写** — 链接 `evidence-schema.md`；excerpt ↔ claim 对齐检查
4. **§Gate B → Gate E** — 顺序强制；引用 template checklist
5. **§候选登记** — `candidate-registry.md` 列；候选 ≥1 evidence
6. **§Merge/add/park/conflict** — 五维 + `docs/experience-augmented-vibe-coding-plan.md` §4.4 仲裁顺序
7. **§P2 晋升** — 更新 `frontend-productization/experiences/<id>.md` + `experience-index.json`；指向 plan §4.3 schema
8. **§Retrofit** — 政策 A（watchlist）vs 政策 C（新批次 only）
9. **§决策边界** — 摘录 spec 表 1–6 + 必须写日志
10. **§质量与禁止项** — 扩展现有列表

**Files:** `extract-experience/SKILL.md`

### Step 4 — Cursor 入口同步

- 更新 `.cursor/skills/extract-experience/SKILL.md`：与 canonical 相同，或 15 行 router「Read `extract-experience/SKILL.md`」+ 执行根说明。

**Files:** `.cursor/skills/extract-experience/SKILL.md`

### Step 5 — Week 1 retrofit 执行（证据）

对 watchlist EU：

1. 检索 Issue/PR（优先 `verified`）补证据到 `evidence/<project>/`.
2. 跑 Gate B → E checklist（人工或 Agent）。
3. 更新 EU front matter `evidence:` 与 `confidence`。
4. 更新 `evidence-audit-table.md` 的 `evidence_strength` / `action` / `notes`。

**Files:** `evidence/**`, `frontend-productization/experiences/ux-*.md`, `extract-experience/evidence-audit-table.md`

### Step 6 — Case study 与 registry 一致性

- 在 `case-studies/gitlab-ux-error-feedback.md` 增加「新 SKILL 步骤对照」小节或新建 `case-studies/evidence-gates-walkthrough.md`（二选一）。
- 若 retrofit 产生新候选行，更新 `candidate-registry.md`。

**Files:** `extract-experience/case-studies/*.md`, `candidate-registry.md`

### Step 7 — 验证

见下方 Verification Plan。

---

## Risks and Mitigations

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| SKILL 过长 Agent 跳步 | 核验仍弱 | templates checklist + 每节「失败则 park」 |
| B 通过但 E 未查就 add | EU 质量不达标 | SKILL 明文：晋升 EU 前必须完成 E 勾选 |
| 与 B 组 EU id 漂移 | routing 失效 | retrofit 前通知 B；改 id 禁止除非 conflict 裁决 |
| 自主 1–6 无登记 | 审计失败 | 步骤强制写 registry/batch 行 |
| 换证耗时长 | Week 1 延期 | watchlist 仅 2–3 EU |

---

## Verification Plan

1. **SKILL 演练：** 用 SKILL §P1 对 `kibana` + `ux` + 1 条新 evidence 文件走通（可 dry-run 不提交）。
2. **Gate 抽检：** 打开 watchlist EU 的 2 条 evidence URL，核对 front matter 与 B/E 表。
3. **Schema：** `Read` 随机 2 条 `evidence/kibana/*.md` 必填字段齐全。
4. **EU 校验：** `python scripts/validate_frontend_productization_skill.py`
5. **A 检查清单：** 对照 `小组分工.md` §8 A 检查 5 项勾选。

---

## ADR

### Decision

采用 **SKILL 主文档 + templates checklist** 落地 P1/B/E 与冲突登记；不修改 `apply_evidence_audit.py`；Week 1 仅 retrofit watchlist。

### Drivers

Deep-interview 明确的首因（P1 核验弱）、Non-goal A、B+E 成功标准、Agent 决策边界 1–6。

### Alternatives considered

脚本强制执行（C）、全量 backfill（D）、仅改 Cursor 镜像不改 canonical（否决—canonical 为源）。

### Why chosen

在课程周期内最大化「可人工复现」与 A 交付物对齐，且不与 B/C 实验 lane 抢范围。

### Consequences

- SKILL 变长，需 template 分流。
- 部分 legacy evidence 保持 partial 直至人工点名（政策 C）。
- B 组依赖 EU 稳定，变更需轻量同步。

### Follow-ups

- P2 批量蒸馏新候选 → 独立批次。
- 半自动 B 检查（future：可选 script，非 Week 1）。
- 第二 Agent 环境迁移验证（plan §10 Follow-ups）。

---

## Available Agent Types Roster

| Role | 用途 |
| --- | --- |
| `planner` | 本计划维护 |
| `executor` | SKILL/templates/evidence/EU 写入 |
| `researcher` | watchlist 换证检索 Issue/PR |
| `critic` / `verifier` | AC 抽检、validate 脚本 |
| `writer` | case study 对齐、A 方法章节草稿 |

---

## Execution Handoff

### Ralph（推荐，单线 Week 1）

```text
$ralph execute .omx/plans/extract-experience-skill-improve.md
```

| Step | 建议 reasoning |
| --- | --- |
| 1–2 | medium |
| 3–4 | high（SKILL 结构） |
| 5–6 | high（证据检索） |
| 7 | medium |

**Ralph 验证：** 全部 AC + verification plan 勾选后退出。

### Team（可选，2 lane 并行）

```text
$team execute .omx/plans/extract-experience-skill-improve.md
```

| Lane | 范围 | Reasoning |
| --- | --- | --- |
| **Skill** | Steps 2–4 | high |
| **Evidence** | Steps 5–6 | high |

**Team 验证路径：**

1. Skill lane 交付 SKILL + templates + Cursor 同步，Verifier 做 AC-1–AC-4。
2. Evidence lane 交付 watchlist retrofit + audit 表，Verifier 做 AC-5–AC-7。
3. 合并前确认 EU id / evidence 路径未破坏 `experience-index.json`。

### Autopilot

```text
$autopilot .omx/plans/extract-experience-skill-improve.md
```

适合希望规划+执行一体的场景；仍须保留 registry 写入证据。

---

## Consensus Changelog

- Architect：SKILL 长度 → templates 分流（已纳入 Step 2–3）。
- Critic：显式 Week 1 watchlist 表（已纳入）。
- Critic：verification 含 validate 脚本（已纳入 AC-7）。

---

## References

- `.omx/specs/deep-interview-extract-experience-improve.md`
- `.omx/interviews/extract-experience-improve-20260520T131500Z.md`
- `docs/experience-augmented-vibe-coding-plan.md` §P1–P2
- `小组分工.md` §2、§8
