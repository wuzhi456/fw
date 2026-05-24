---
name: extract-experience
description: >-
  Research-grade experience extraction: P1 batch evidence, Gate B/E verification,
  registry audit, and EU promotion for the frontend productization corpus.
argument-hint: "[project] [risk_class] [source_type]"
version: "1.2.0"
user-invocable: true
allowed-tools: Read, Write, Edit, Bash
---

> **Language / 语言**: 本 Skill 默认使用中文。如果用户明确以英文提问，请全程用英文回应。
>
> **Execution Root / 执行根目录**: 所有 `Bash` 命令必须在当前 `SKILL.md` 所在目录（`FunctionWeaver/extract-experience/`）执行；写 `evidence/` 时使用相对路径 `../evidence/<project>/`，写主 Skill 产物时使用 `../frontend-productization/`。
>
> **Changelog 1.2.0**: P1 批次协议、Gate B→E 核验、`templates/` checklist、Retrofit 政策 A/C；`apply_evidence_audit.py` 仅作参照（不修改脚本）。

# Skill: extract-experience

将经验抽取标准化为**可复现、可审计、可扩展**的研究流程：证据链 → 候选登记 →（可选）Experience Unit 晋升。

---

## 触发条件

- `/extract-experience`
- 「抽取经验」「经验沉淀」「经验登记」「生成 Experience Unit」

宿主传入 `[project] [risk_class] [source_type]` 时，跳过对应维度的追问。

---

## 工具

| 任务 | 工具 |
| --- | --- |
| 读文档/代码 | `Read` |
| 写 evidence / registry / audit | `Write` / `Edit` |
| 批量整理 | `Bash` |

---

## §1 P1 批次协议

### 输入（缺一即追问）

| 维度 | 取值示例 |
| --- | --- |
| **项目** | `react-admin` / `refine` / `kibana` / `gitlab` |
| **风险类** | `async` / `list` / `form` / `state` / `ux` / `responsive` |
| **source type** | `docs` / `code` / `issue` / `pull_request` / `test` / `commit` |
| **检索范围** | query、模块/目录、issue 标签；**cap ≤ 10** 条 Issue/PR 初筛 |

### 动作

1. 定向检索（GitHub/GitLab 搜索、官方文档）；不全仓库扫描。
2. 为每条入选候选写 **≥1** 条 `../evidence/<project>/<id>.md`（见 `evidence-schema.md`）。
3. 在 `../extraction-notes.md` **Batch log** 表追加一行（模板：`templates/batch-log-row.md`）。
4. 在 `candidate-registry.md` 登记候选（`decision` 初值可为 `park` 直至 Gate E）。

### 产出

- `../evidence/<project>/*.md`
- `../extraction-notes.md` 新批次行
- `candidate-registry.md` 新行

### 失败则

- 无 batch 行 → 批次视为未完成，不得晋升 EU。
- 超 cap 未记 exclude_reason → 补写或缩减 scope。

---

## §2 Evidence 撰写

- 字段定义：**`evidence-schema.md`**（必填 front matter + 可选 `## Note`）。
- **excerpt ↔ claim**：摘要与 `mapped_experience_claim` 必须同一失败 mode；否则改 claim 或换 artifact。
- 禁止长段原文；保留 `artifact_url`、`immutable_ref`、`path_or_issue_pr`。
- 参照（不执行）：`../scripts/apply_evidence_audit.py` 的 `verification_status` 语义。

---

## §3 Gate B → Gate E（强制顺序）

完整勾选表：**`templates/evidence-checklist.md`**。

### Gate B — 链接完整性

- `artifact_url` 可打开；`immutable_ref` 已钉选。
- `verification_status` ≥ `verified_path`（Issue/PR 优先 `verified`）。
- 失败：**不得 `add`**；标 `downgraded` / `replaced` 并写 `verification_notes`。

### Gate E — EU 晋升

- 目标 EU **≥2** 条 evidence。
- 至少 **1** 条：`claim_support: strong`，或 `partial` + `confidence: high`。
- 仅 `weak` 证据 **禁止** 支撑 `add`。
- 通过后更新 `evidence-audit-table.md`。

### 失败则

- 只过 B 不过 E → `park` 或继续采集，禁止写 `../frontend-productization/experiences/`。

---

## §4 候选登记

`candidate-registry.md` 列：

| 列 | 含义 |
| --- | --- |
| `id` | `C-###` |
| `risk_class` | 六类之一 |
| `triggers` | 触发场景 |
| `failure_mode` | 用户可见失败 |
| `decision` | `merge` / `add` / `park` / `conflict` |
| `conflict_note` | 冲突时必填 |

每条候选至少 1 条 evidence 路径。

---

## §5 Merge / Add / Park / Conflict

### 五维查重（对已有 EU）

1. `risk_class` 相同  
2. `trigger` 重叠  
3. `failure_mode` 相同  
4. `mature_practices` 仅为改写  
5. `injection` 语义是否给 Agent 相同指令  

| 决策 | 条件 |
| --- | --- |
| **merge** | 五维重复或已有 EU 覆盖主张 |
| **add** | 新 failure mode + **Gate E 通过** |
| **park** | 证据弱、超 MVP、或仅过 B |
| **conflict** | 主张互斥；须写冲突 EU id、更强 evidence、保留/合并/降级理由 |

### 冲突仲裁优先级（与 plan §4.4 一致）

1. evidence strength  
2. risk severity  
3. specificity（触发条件更具体）  
4. stage fit（plan/review/test）

### 登记

- 更新 `candidate-registry.md` + 必要时 `evidence-audit-table.md`。
- **禁止** 未写 `conflict_note` 的 `merge`。

---

## §6 P2 晋升（Experience Unit）

- EU 文件：`../frontend-productization/experiences/<id>.md`（schema 见 `../docs/experience-augmented-vibe-coding-plan.md` §4.3）。
- 索引：`../frontend-productization/experience-index.json` 的 `evidence_paths` 与 front matter `evidence:` 一致。
- 晋升前：**Gate E 已通过**。
- 校验：在当前目录执行 `python ../scripts/validate_frontend_productization_skill.py`，或在 `FunctionWeaver/` 执行 `python scripts/validate_frontend_productization_skill.py`。

---

## §7 Retrofit 政策

| 政策 | 范围 |
| --- | --- |
| **A — Week 1** | 仅处理 audit / case study 点名 EU（见下表） |
| **C — 长期** | 新批次必须 B+E；既有 18 条 EU 默认不动，除非人工指定 id |

### Week 1 watchlist

| EU | 动作 |
| --- | --- |
| `ux-fallback-recoverable-errors` | 换证至 GitLab #381151 等；满足 B+E |
| `ux-error-boundary-granularity` | 复核 kibana/gitlab 四条 evidence 是否 E |
| `form-duplicate-submit-guard` | 可选第三样本；或 audit `keep with caveat` |

---

## §8 决策边界（Agent 可自主，须留痕）

| # | 允许 |
| --- | --- |
| 1 | 标注 `verification_status` / `verification_notes` |
| 2 | `park` |
| 3 | `merge` |
| 4 | `add` + 改 EU / index（Gate E 后） |
| 5 | `conflict` 裁决 + registry |
| 6 | `replace` 仅 watchlist 或人工点名 EU |

每次裁决必须写 **batch 行** 或 **registry/audit** 行，禁止静默改库。

**须人工：** 冻结协议变更、新增样本项目、全库 18 EU 强制 B+E 回填。

---

## §9 证据强度

| 值 | 含义 |
| --- | --- |
| `strong` | 直接编码经验 |
| `partial` | 需迁移解释 |
| `weak` | 背景；不得单独 `add` |
| `needs-replacement` | 审计后须换证 |

---

## §10 质量门槛

- 每条 candidate ≥1 evidence。
- `weak` → 不得 `add`。
- `replace` → 同批次提供替换 evidence。
- `conflict` → 必须说明依据。

---

## §11 资产目录

```text
extract-experience/
├─ SKILL.md
├─ evidence-schema.md
├─ evidence-audit-table.md
├─ candidate-registry.md
├─ templates/
│  ├─ batch-log-row.md
│  └─ evidence-checklist.md
└─ case-studies/*.md
```

Case study 示例：`case-studies/form-duplicate-submit-guard.md`、`case-studies/gitlab-ux-error-feedback.md`。

---

## §12 禁止项

- 只写结论无 evidence
- 无 URL / path / issue id
- 触发条件不可复现
- conflict 未解释就 merge
- weak 证据拖低 EU 未补强或未 downgrade
- 跳过 Gate B 直接 Gate E
- 修改 `apply_evidence_audit.py` 作为本 Skill 合规前提
