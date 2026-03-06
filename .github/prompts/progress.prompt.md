# Function Weaver — 当前进展 (Progress)

---

## 整体状态

**阶段**：文档与规划更新完毕，等待代码实现  
**当前里程碑**：文档/Prompts 全部更新完毕；M1 尚未开始  
**下一目标**：Task 1.1 项目脚手架 → Task 1.2 MCP Server 骨架

---

## 已完成事项

### 规划与设计（全部完成）

- [x] 阅读并理解 `Function Weaver Proposal.md`
- [x] 确定系统整体架构（三组件：MCP Server + Extension + React Webview）
- [x] 明确研究贡献定位：**Planning Knowledge Augmentation（规划知识增强）** 框架
  - 提出 KnowledgeProvider 接口，MVP 只实现 InfrastructureRulesProvider
  - 贡献不在于可视化，而在于主动检测叙事性规划的系统性盲区并注入
- [x] 完成实验设计（Control vs Treatment 对照组，H1/H2/H3 假设）
- [x] 確认关键技术决策（10 条，详见 `plan-functionWeaverMvp.prompt.md` 六）
- [x] 制定完整实施计划（Tasks 1.1–5.2，含 Done Criteria）
- [x] 确认架构方案：**Option A**（MCP 写入磁盘 + Extension 使用 `fs.watch()`）
- [x] 完成文档结构拆分：
  - `plan-functionWeaverMvp.prompt.md`：系统架构 + 研究贡献 + 技术设计
  - `implementation-plan.prompt.md`：实施任务与里程碑
  - `techstack.md`：技术栈
  - `PRD.md`：产品需求文档
  - `progress.md`：本文件

### 文档输出

- [x] `.github/prompts/plan-functionWeaverMvp.prompt.md` — 主计划文档（TL;DR、系统流程、设计决策全部更新为 Option A）
- [x] `.github/prompts/implementation-plan.prompt.md` — 实施计划（Task 1.2/1.3/1.4 全部更新）
- [x] `.github/prompts/techstack.prompt.md` — 技术栈（MCPBridge → SessionWatcher，移除 child_process）
- [x] `.github/prompts/progress.prompt.md` — 本文件
- [x] `docs/PRD.md` — 产品需求（工作流、工具输出、安装配置全部更新为 Option A）
- [x] `docs/sequenceDiagram.md` — Option A 架构时序图（6 参与者、组件边界表、对毕表）
- [x] `docs/Function Weaver Proposal.md` — 第二/三章更新（文件系统分流中间件、fs.watch 学术贡献）

---

## 尚未完成事项（全部为代码实现）

### 阶段 1：基础设施 + 主干链路（预计 2–3 天）

- [ ] **Task 1.1** — 项目脚手架（Python venv + Extension `yo code`）
- [ ] **Task 1.2** — MCP Server 骨架（`mcp_server/__main__.py`，写入 session 文件到磁盘）
- [ ] **Task 1.3** — Extension 文件系统监听层（`session-watcher.ts`，`createFileSystemWatcher`）
- [ ] **Task 1.4** — Webview 骨架（`<pre>` 展示 JSON，验证通信）
- [ ] **[M1]** 主干验证：MCP 写入 session 文件 → Extension 检测 → Webview 展示

### 阶段 2：规则引擎与持久化（预计 3–4 天）

- [ ] **Task 2.1** — KnowledgeProvider 接口 + InfrastructureRulesProvider
- [ ] **Task 2.2** — 规则库 JSON（首批 8–15 节点，5 个触发域）
- [ ] **Task 2.3** — 模糊匹配引擎（jieba + difflib.SequenceMatcher ≥ 0.6）
- [ ] **Task 2.4** — Session 持久化（原子化写入，含研究字段）
- [ ] **Task 2.5** — 替换 stub 为真实引擎
- [ ] **[M2]** 真实规则注入验证

### 阶段 3：Webview 可视化（预计 4–5 天）

- [ ] **Task 3.1** — React + ReactFlow 开发环境（Vite 单文件构建）
- [ ] **Task 3.2** — 节点渲染（只读，区分 core/infrastructure/rejected）
- [ ] **Task 3.3** — 交互编辑（右键菜单、软删除、新增节点、2s 防抖保存）
- [ ] **Task 3.4** — 确认按钮与数据回传
- [ ] **[M3]** 完整可视化验证

### 阶段 4：Prompt文件注入与闭环（预计 2-3 天）

- [ ] **Task 4.1** — 写入 `functions.prompt.md`（YAML frontmatter + 约束规则 + 完整 tree JSON，`vscode.open` 自动打开）
- [ ] **Task 4.2** — 启动时会话恢复
- [ ] **Task 4.3** — 端到端冒烟测试（固定场景：`["用户登录", "文章发布"]`）
- [ ] **[M4]** 完整闭环验证

### 阶段 5：打磨（预计 2 天）

- [ ] **Task 5.1** — 日志与异常处理（Output Channel 分级日志，友好错误提示）
- [ ] **Task 5.2** — README + 首次安装体验（Python 检测，15 分钟上手目标）
- [ ] **[M5]** 研究就绪（日志完整、可复现、可采集对照组数据）

---

## 下一步（立即开始）

**Task 1.1 — 项目脚手架**

```powershell
# MCP Server 环境
python -m venv .venv
.venv\Scripts\pip install fastmcp jieba

mkdir mcp_server, mcp_server\tools, mcp_server\engine, mcp_server\rules
New-Item mcp_server\__main__.py, mcp_server\__init__.py

# Extension 脚手架
npm install -g yo generator-code
cd extension
yo code  # 选 TypeScript Extension (without bundler)
npm install
```

**Done Criteria**：`python -m mcp_server` 启动不报错；`F5` 能在 Extension Development Host 中加载插件
