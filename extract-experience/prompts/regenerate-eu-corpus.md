# Prompt：用 extract-experience Skill 重新生成 EU 语料库

**用途：** 复制下方「主 Prompt」到 Cursor Agent 新会话，按批次执行。  
**前提：** `frontend-productization/experiences/` 已清空；`evidence/` 与 `extraction-notes.md` 可复用或增量补充。  
**目标：** 18 条 Experience Units（async / list / form / state / ux / responsive 各 3 条），每条 Gate B+E 通过后再晋升。

---

## 主 Prompt（复制整段）

```markdown
你是 FunctionWeaver 项目的 Experience Extraction 执行者。请**严格**按仓库内 canonical skill 执行，不要跳过 Gate、不要手写无 evidence 的 EU。

## 必读（按顺序）

1. `extract-experience/SKILL.md`（v1.2.0，执行根目录 = 该目录）
2. `extract-experience/evidence-schema.md`
3. `extract-experience/templates/evidence-checklist.md`
4. `extract-experience/templates/batch-log-row.md`
5. `docs/experience-augmented-vibe-coding-plan.md` §4.3（EU front matter schema）
6. `extract-experience/candidate-registry.md`（查重，避免与已有候选重复主张）

## 当前状态

- `frontend-productization/experiences/` **已清空**
- `frontend-productization/experience-index.json` → `units: []`
- `extract-experience/evidence-audit-table.md` → 待填
- 既有 `evidence/<project>/*.md` **可复用**，但每条晋升 EU 前必须重新过 Gate B+E 并核对 excerpt ↔ claim

## 你的任务

按 **P1 批次协议（SKILL §1）→ Gate B（§3）→ Gate E（§3）→ P2 晋升（§6）** 流水线，生成 **18 条 EU**：

| risk_class | 目标 EU 数 | 主样本优先级 |
| --- | ---: | --- |
| async | 3 | react-admin, kibana |
| list | 3 | react-admin, kibana |
| form | 3 | react-admin, refine |
| state | 3 | refine, kibana |
| ux | 3 | kibana, gitlab |
| responsive | 3 | refine, kibana |

### 每个 P1 批次（一次只做：1 项目 × 1 风险类 × 1 source type）

1. **输入**（若缺则追问）：project、risk_class、source_type、检索 query/scope、cap≤10
2. **检索**：定向 GitHub/GitLab/文档；不全仓库扫描
3. **Evidence**：每条入选候选写 ≥1 个 `evidence/<project>/<id>.md`（front matter 完整）
4. **登记**：`extraction-notes.md` Batch log 追加一行；`candidate-registry.md` 登记候选
5. **Gate B**：链接可打开、immutable_ref 钉选、verification_status ≥ verified_path
6. **裁决**：五维查重 → merge / add / park / conflict（写 registry + conflict_note）
7. **Gate E**（仅 `add`）：目标 EU ≥2 evidence；≥1 strong 或 partial+high；weak 不得单独 add
8. **P2 晋升**：
   - 写 `frontend-productization/experiences/<id>.md`（plan §4.3 schema + 正文四节）
   - 更新 `frontend-productization/experience-index.json` 的 `evidence_paths`（与 front matter `evidence:` 一致）
   - 更新 `extract-experience/evidence-audit-table.md`
9. **校验**：在 repo 根目录执行  
   `python scripts/validate_frontend_productization_skill.py`  
   必须 exit 0 才可宣称该 EU 完成

### 禁止项（SKILL §12）

- 只写 EU 结论、无 evidence 文件
- 无 artifact_url / path / issue id
- 跳过 Gate B 直接晋升
- weak 证据单独支撑 add
- conflict 未解释就 merge
- 修改 `apply_evidence_audit.py` 作为合规前提

## 输出节奏（建议 6 个会话，每会话 1 个 risk_class）

每完成一个 risk_class，汇报：

- batch_id 列表
- 新/复用 evidence 路径
- 晋升的 EU id 列表
- Gate B/E 勾选摘要
- validate 脚本输出

## 第一批请从这里开始

**Batch 1：** `react-admin` × `async` × `docs+code`  
检索 scope：list/detail 加载态、error/empty、retry；Issue/PR cap=10。  
目标：晋升 up to 3 条 async 类 EU（不足则 park，不凑数）。

确认读完 SKILL 后，先输出本批次的 query/scope/cap 计划，再开始写 evidence。
```

---

## 单批次 Prompt 模板（6 类 × 多批时复用）

将 `{project}` `{risk_class}` `{source_type}` `{query}` 替换后发送：

```markdown
/extract-experience

执行 P1 批次：
- 项目：{project}
- 风险类：{risk_class}
- source type：{source_type}
- 检索 query：{query}
- scope：{模块/目录/issue 标签}
- cap：10

要求：
1. 严格遵循 `extract-experience/SKILL.md` v1.2.0
2. 本批结束须：evidence 文件、batch log 行、candidate-registry 行
3. 对可晋升候选走 Gate B+E，写入 `frontend-productization/experiences/` 并更新 index + audit 表
4. 运行 `python scripts/validate_frontend_productization_skill.py`

当前 EU 语料库为空，查重仅对 registry 与已晋升 EU 生效。
```

### 建议批次顺序（18 EU）

| 序 | 调用 Prompt |
| --- | --- |
| 1 | `react-admin` / `async` / `docs+code` — explicit loading/error/empty |
| 2 | `react-admin` / `async` / `issue+test` — stale cancel / retry |
| 3 | `react-admin` / `list` / `docs+code` — pagination / virtualization |
| 4 | `kibana` / `list` / `issue+pr` — large list / incremental load |
| 5 | `react-admin` / `form` / `code+docs` — duplicate submit / pending |
| 6 | `refine` / `form` / `docs+hooks` — async validation / submit recovery |
| 7 | `refine` / `state` / `docs` — invalidate / optimistic rollback |
| 8 | `kibana` / `state` / `issue` — stale response / context switch |
| 9 | `kibana` / `ux` / `issue+pr` — error boundary / empty state |
| 10 | `gitlab` / `ux` / `issue` — recoverable errors / alert dedup |
| 11 | `refine` / `responsive` / `issue+docs` — mobile nav / dashboard grid |
| 12 | `kibana` / `responsive` / `issue` — overflow / long text |

每批晋升后运行 validate；全库 18 条完成后，再跑 B 侧 routing packet 更新（非本 prompt 范围）。

---

## 晋升 EU 文件最低验收（Gate E 后）

**Front matter（`docs/experience-augmented-vibe-coding-plan.md` §4.3）：**

- `id`, `title`, `category`, `tags`, `risk_severity`
- `triggers`, `risks`, `mature_practices`, `anti_patterns`
- `injection.plan|coding|review|test`（四阶段各一句可执行指令）
- `verification`（≥2 条可观察验收）
- `evidence`（≥2 路径，相对 `experiences/` 为 `../../evidence/...`）
- `confidence`: low | medium | high

**正文四节：**

1. 经验解释  
2. 适用边界  
3. 成熟实践归纳（不贴源码）  
4. 验收提示  

**index.json 每条 unit：**

- `id`, `title`, `tags`, `triggers`, `risk_severity`, `stage_fit`, `evidence_confidence`, `evidence_paths`

---

## 与实验 v2 的关系

EU 重新生成完成后，C 再跑 `experiment-protocol-v2.md` 的 16 runs。  
`full-prompt` 组依赖完整 EU checklist — 在 18 条齐套前勿启动 v2 正式批次。

---

## 快速自检命令

```powershell
cd FunctionWeaver
python scripts/validate_frontend_productization_skill.py
python -m json.tool frontend-productization/experience-index.json
(Get-ChildItem frontend-productization/experiences/*.md).Count  # 目标 18
```
