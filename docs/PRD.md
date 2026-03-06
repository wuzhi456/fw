# Function Weaver MVP — 产品需求文档 (PRD)

---

## 1. 产品概述

**Function Weaver** 是一个"规划中间件"系统，由两个独立组件构成：**Python MCP Server**（发布到 PyPI，真实 MCP 协议）和 **VS Code Extension**（发布到 Marketplace，可视化层）。

用户在与 Copilot 对话时，Copilot 根据上下文自主调用 `weaver_plan_architecture` 工具（真实 MCP，无需用户显式触发）。MCP Server 根据核心功能关键词，通过规则库注入隐性基建节点，生成完整 Function Tree，将完整 `tree_data` 写入本地 session 文件（`.weaver/sessions/{task_id}.json`），再向 Copilot 返回轻量挂起信号 `{status, message, task_id}`（不含 `tree_data`）。VS Code Extension 使用 `fs.watch()` 监听 session 目录，检测到新文件后读取 `tree_data` 并弹起可视化 Webview。用户在 Webview 中审阅、编辑架构后确认，Extension 将最终架构写入 `.github/prompts/functions.prompt.md`，用户在 Chat 中附加该文件后驱动 Copilot 生成代码。

**两个组件完全解耦**：通信媒介为本地文件系统（`.weaver/sessions/`），无 IPC、无 stdio 拦截。  
**首批规则库**：8–15 节点，覆盖 Web 应用基础域（认证、日志、错误、限流）  
**目标**：端到端可重复、收敛的完整闭环，为 CHI 论文的"收敛性降低"评估提供工程基础

---

## 2. 研究贡献定位

### 核心问题与贡献

**不是**：提供一个 Function Tree 的可视化工具（Copilot Plan 模式已能生成叙事性计划，可视化只是手段）

**不是**：仅仅为 Web 应用注入基建节点（这是一个领域的点解决方案，不足以成为顶会贡献）

**是**：提出一个通用框架——**Planning Knowledge Augmentation（规划知识增强）**：在 LLM 生成叙事性规划后，通过结构化领域知识库主动检测并显式化隐性盲区，经人机协作确认后注入到后续生成流程，研究其对 AI 辅助开发收敛性的影响

### 叙事性规划的系统性盲区

Copilot Plan 模式生成的是**叙事性自然语言计划**（narrative plan），有一个系统性缺陷：**任何被视为"理所当然"的领域知识都会被遗漏**。

| 知识维度                 | 叙事计划的盲区   | 典型遗漏示例                           |
| ------------------------ | ---------------- | -------------------------------------- |
| **基建函数**（MVP 实现） | 横切关注点       | Token 刷新、限流、全局错误处理         |
| **合规约束**             | 行业法规         | GDPR 数据驻留、无障碍(a11y)、等保三级  |
| **非功能需求**           | 性能/可靠性      | 熔断器、缓存策略、降级方案             |
| **集成风险**             | 第三方依赖复杂性 | OAuth 回调处理、Webhook 幂等、API 限速 |
| **数据建模盲区**         | 隐含关系         | 软删除、审计日志、多租户隔离           |

**后果**：开发者（和 AI）写到一半才发现需要补这些内容，引发大量"补丁式迭代"——这正是 AI 辅助开发中**发散（divergence）**的主要来源。

### 统一框架：KnowledgeProvider 接口

```text
叙事性计划（Narrative Plan）
        ↓
  KnowledgeProvider 接口
  ┌─────────────────────────────┐
  │ Provider A: InfrastructureRules  │  ← MVP 实现（Web 基建节点）
  │ Provider B: ComplianceRules      │  ← 未来扩展（合规约束）
  │ Provider C: NFRules              │  ← 未来扩展（非功能需求）
  │ Provider D: IntegrationRules     │  ← 未来扩展（集成风险）
  └─────────────────────────────┘
        ↓
  增强后的结构化 Function Tree（Human-in-the-loop 确认）
        ↓
  注入到代码生成流程
```

MVP 仅实现 `InfrastructureRules` Provider，作为框架的 proof of concept。

### 研究假设

- **H1（主要）**：在规划阶段通过结构化知识库显式化隐性领域知识（infrastructure nodes），能够降低后续 AI 代码生成的迭代轮次（convergence rounds）。
- **H2（次要）**：用户在图形化界面中对注入节点进行审阅确认（human-in-the-loop review），相比纯文本计划，能提升用户对最终代码覆盖度的主观满意度。
- **H3（框架推广性）**：`KnowledgeProvider` 接口的设计使得同一机制可无缝扩展到其他知识维度（合规、NFR 等）。

---

## 3. 完整工作流（系统时序）

1. **用户输入需求** → 在 Copilot Chat 中描述功能；Copilot 多轮对话提炼核心关键词
2. **Copilot 自主调用工具** → Copilot 基于上下文决策，自动调用 `weaver_plan_architecture`（真实 MCP，无需用户显式触发）
3. **MCP 处理** → 规则匹配、节点注入、生成完整 Function Tree
4. **MCP 写文件** → 原子化写入完整 `tree_data` 至 `.weaver/sessions/{task_id}.json`
5. **MCP 返回挂起信号** → 向 Copilot 返回 `{status, message, task_id}`（不含 `tree_data`）；Copilot 收到 `waiting_for_human` 后优雅挂起
6. **Extension 检测文件** → `fs.watch()` 检测到新 session 文件，读取 `tree_data`
7. **Webview 自动弹起** → Extension 在 Chat 旁边展示可编辑的架构图（`ViewColumn.Beside`，无需用户手动操作）
8. **用户编辑** → 增删改节点、依赖关系；2 秒防抖自动保存 session（中间态持久化）
9. **点击确认** → 原子化保存终版架构到 `.weaver/active_architecture.json`
10. **写入 Prompt 文件** → Extension 生成 `.github/prompts/functions.prompt.md`（含 YAML frontmatter + 约束规则 + 完整 tree JSON），调用 `vscode.open` 自动打开
11. **Copilot 继续生成** → 用户在 Chat 中附加 `functions.prompt.md`，Copilot 按结构生成高收敛代码

### 关键设计原则

- **文件系统分流**：MCP Server 自身完成 `tree_data` 与挂起信号的分离，Extension 不参与 MCP 通信链路
- **Webview 自动弹起**：Extension 通过 `fs.watch()` 检测到新 session 文件时无延迟弹起，不覆盖 Chat
- **组件彻底解耦**：MCP Server 可独立使用（`pip install` + `mcp.json`），Extension 是增强可视化层，两者通过文件系统通信
- **会话自动保存**：编辑时 2 秒防抖存 session，支持跨重启恢复

---

## 4. 功能需求

### 4.1 MCP 工具：`weaver_plan_architecture`

**输入**：
```json
{ "root_nodes": ["企业微信登录", "文档树状目录", "富文本编辑器"] }
```

**MCP Server 处理后写入磁盘（`.weaver/sessions/{task_id}.json`）**：
```json
{
  "task_id": "weaver_20260303_143022",
  "schema_version": "1.0.0",
  "project_name": "文档管理系统",
  "status": "waiting_confirmation",
  "nodes": [
    {
      "id": "auth_wechat",
      "label": "企业微信登录",
      "node_type": "core_feature",
      "status": "pending",
      "dependencies": [],
      "source": "user"
    },
    {
      "id": "auth_token_refresh",
      "label": "Token 自动刷新",
      "node_type": "infrastructure",
      "status": "pending",
      "dependencies": ["auth_wechat"],
      "source": "rule",
      "triggered_by": "auth_wechat"
    }
  ]
}
```

**MCP Server 返回给 Copilot（仅挂起信号，不含 tree_data）**：
```json
{
  "status": "waiting_for_human",
  "message": "底座基建节点已匹配，功能图谱已生成。请在 Function Weaver 画板中审阅架构后继续。",
  "task_id": "weaver_20260303_143022"
}
```

> **说明**：MCP Server 通过 `.vscode/mcp.json` 中配置的 `WORKSPACE_ROOT` 环境变量（值为 `${workspaceFolder}`）确定 session 文件写入路径，无需 Extension 协调。

### 4.2 规则库（首批）

覆盖 5 个触发域，首批 8–15 节点：

| 触发关键词      | 注入节点                             |
| --------------- | ------------------------------------ |
| 登录/认证/Auth  | Token 刷新、并发会话控制（异地踢出） |
| 日志/Logging    | 全局请求日志中间件、慢查询日志       |
| 错误/Error      | 全局异常处理器、错误码规范化         |
| 限流/Rate       | 接口限流（IP 维度）、限流降级页      |
| 文件上传/Upload | 分块上传、上传限流                   |

### 4.3 Webview 编辑功能

- 节点可视化（蓝色=core_feature，灰色=infrastructure）
- 右键菜单：切换 `status`（pending / confirmed / modified / rejected）
- **软删除**：无"删除"按钮，"标记拒绝"将 `status` 置为 `rejected`，节点半透明保留在画布
- 新增节点：弹出表单，`source` 默认为 `manual`
- 拖拽连线：更新 `dependencies`
- 2 秒防抖自动保存 session

### 4.4 Prompt 文件注入策略

用户点击确认后，Extension 将架构写入 `.github/prompts/functions.prompt.md`（含 YAML frontmatter + 约束规则 + 完整 tree JSON），并调用 `vscode.open` 自动打开文件。Toast 提示用户在 Chat 中附加该文件（显示为「Prompt」标签）后发送"开始生成代码"。

### 4.5 会话持久化与恢复

- 路径：`.weaver/sessions/{task_id}.json`
- 原子化写入（写 tmp → fsync → rename）
- IDE 启动时自动扫描 `waiting_confirmation` 状态的 session，自动弹起 Webview

### 4.6 用户安装与配置

用户需完成两项独立安装：

1. **MCP Server**：`pip install function-weaver-mcp`（或 `uvx function-weaver-mcp`）  
   在 `.vscode/mcp.json` 中配置：
   ```json
   {
     "servers": {
       "weaver": {
         "command": "uvx",
         "args": ["function-weaver-mcp"],
         "env": { "WORKSPACE_ROOT": "${workspaceFolder}" }
       }
     }
   }
   ```

2. **VS Code Extension**：从 Marketplace 安装 Function Weaver  
   安装后无需额外配置，自动监听 `.weaver/sessions/`

---

## 5. 非功能需求

| 需求             | 指标                                                         |
| ---------------- | ------------------------------------------------------------ |
| 工具调用响应时间 | ≤5 秒（含规则匹配 + 注入 + 写文件）                          |
| MCP 超时保护     | 15 秒，超时后 Extension 给出友好错误提示                     |
| 并发保护         | 同一 workspace 仅一个活跃任务，重复调用被拒绝                |
| 首次安装体验     | 在干净 Windows 环境按 README 操作，15 分钟内完成首次运行     |
| 可复现性         | 同一需求三次独立运行，生成的架构树结构一致（节点 ID、依赖关系稳定） |

---

## 6. 研究数据需求（必须完整实现）

以下功能是论文数据的基础，**不允许降级为 nice-to-have**：

1. **`KnowledgeProvider` 接口**：即使 MVP 只实现一个 Provider，接口必须设计好
2. **`source` 字段准确标注**：区分 user/rule/manual
3. **`status` 完整状态流转**：用户每次"删除节点"必须记录为 `rejected`（软删除），不真正删除
4. **Session 日志完整性**：每次规划过程的输入、注入结果、用户修改都需要持久化
5. **对照组可复现**：同一需求在 Control 组（无 Function Weaver）下的 Chat 记录需要可手动采集

### 数据采集点（已内置于数据结构）

```json
// 节点级别
{
  "source": "rule",
  "triggered_by": "auth_wechat",
  "status": "confirmed"
}
```

```text
// Session 级别
.weaver/sessions/{task_id}.json  → 记录原始规划状态与用户修改历史
.weaver/logs/match_history.log   → 记录规则匹配全过程（规则命中率分析）
```

---

## 7. 实验设计

| 组别                    | 描述                                           | 工具            |
| ----------------------- | ---------------------------------------------- | --------------- |
| **Control**（对照组）   | 用户使用 Copilot，直接生成代码                 | 原生 Copilot    |
| **Treatment**（实验组） | 用户使用 Function Weaver，经规划干预后生成代码 | Function Weaver |

### 核心评估指标

1. **收敛轮次**（主要指标）：从初始需求到"用户满意的代码版本"所需的 Chat 交互轮数
2. **基建节点覆盖率**：最终代码中包含规则库定义的基建节点的比例（自动统计）
3. **节点接受率**：用户在 Webview 中保留（而非拒绝）`source=rule` 注入节点的比例
4. **规划-实现一致性**：确认的 Function Tree 中的节点在最终代码中的实现率

---

## 8. 验证计划

### 功能性验证

1. **工具调用链**：Copilot → Python MCP Server → 写 session 文件 → 返回挂起信号（不超过 5 秒）
2. **规则注入准确性**：输入"企业微信登录"，自动挂载 Token 刷新、异地登录踢出
3. **fs.watch 触发**：MCP 写文件后，Extension 自动检测并弹起 Webview（无需用户手动操作）
4. **Webview 编辑**：手动删除 1 个节点、新增 1 个节点、修改 2 个依赖关系，确认后 JSON 正确保存
5. **跨重启恢复**：关闭 IDE → 重新打开 → Webview 自动弹出未完成任务

### 性能与稳定性

1. **超时防护**：Python 进程卡死时，Extension 15 秒超时保护
2. **并发保护**：同时触发两次工具调用，第二次被拒绝并提示"任务进行中"
3. **原子化保存**：模拟写入过程中断电（kill -9），验证不产生半写文件

---

## 9. 范围说明（MVP 边界）

### 包含（In Scope）
- Python MCP Server（真实 MCP，stdio transport，发布到 PyPI）
- VS Code Extension（FileSystemWatcher + WebviewManager + PromptFileWriter）
- React + ReactFlow Webview
- 首批规则库（8–15 节点，Web 应用域）
- Prompt 文件注入策略（写入 `functions.prompt.md`）
- Session 持久化与恢复（`.weaver/sessions/`）
- 研究数据字段（source/triggered_by/status）
- `.vscode/mcp.json` 配置文档（含 `WORKSPACE_ROOT` 环境变量说明）

### 不包含（Out of Scope for MVP）
- HTTP/SSE transport（改 stdio）
- ComplianceProvider / NFRProvider / IntegrationRiskProvider（改接口设计）
- 规则冲突自动消解（仅记录 warning 日志）
- 遥测数据采集（需用户授权，延后）
- 多任务并发（改单任务串行）
- 规则库 UI 编辑器