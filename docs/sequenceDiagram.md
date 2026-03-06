# 系统时序图 — Option A：真实 MCP + 文件系统监听架构

> **架构决策（已确认）**：采用 Option A。Python MCP Server 作为真正的 MCP 工具发布（`pip install`），VS Code Extension 作为独立的可视化层（Marketplace 发布）。两者通过本地文件系统（`.weaver/sessions/`）解耦通信，Extension 使用 `fs.watch()` 监听新 session 文件。Copilot 直接与真实 MCP 协议通信，可自动调用工具（无需用户显式选择 `#weaverPlan`）。

---

## 主流程时序图

```mermaid
sequenceDiagram
    autonumber
    participant User as 开发者 (User)
    participant Agent as Copilot / Agent
    participant MCP as Python MCP Server
    participant FS as 本地文件系统<br/>(.weaver/sessions/)
    participant Ext as VS Code Extension<br/>(fs.watch 监听)
    participant Webview as 前端画板 Webview

    User->>Agent: 1. 输入需求（例："开发文档管理系统"）
    Note right of Agent: 意图锚定：多轮对话提炼核心功能关键词

    Agent->>MCP: 2. 自动调用 weaver_plan_architecture<br/>{ root_nodes: ["企业微信登录", "文档目录", ...] }
    Note right of MCP: 真实 MCP 工具调用（Copilot 自主决策，<br/>非用户显式触发）

    rect rgb(240, 248, 255)
        Note right of MCP: 核心机制：知识注入 + 文件分流
        MCP->>MCP: 3. 规则匹配 + 注入隐性基建节点<br/>（Token刷新、限流、全局日志等）
        MCP->>FS: 4. 原子化写入完整 tree_data<br/>.weaver/sessions/{task_id}.json
        MCP-->>Agent: 5. 立即返回挂起信号（不含 tree_data）<br/>{ status, message, task_id }
    end

    Note over Agent: 收到 waiting_for_human 信号，优雅挂起<br/>暂停输出，等待用户在 Webview 确认

    FS-->>Ext: 6. fs.watch() 检测到新 session 文件
    Ext->>FS: 7. 读取 tree_data
    Ext->>Webview: 8. 弹起 Webview（ViewColumn.Beside）<br/>发送 LOAD_TREE 消息

    Note over Webview: 9. 开发者可视化审阅与编辑<br/>（拖拽、软删除、新增、修改依赖）
    Webview-->>Ext: 10. AUTO_SAVE_SESSION（2s 防抖，中间态持久化）
    Ext->>FS: 11. 更新 session 文件

    Webview-->>Ext: 12. CONFIRM_AND_GENERATE（用户点击确认）
    Ext->>FS: 13. 原子化保存 .weaver/active_architecture.json
    Ext->>FS: 14. 写入 .github/prompts/functions.prompt.md<br/>（含 YAML frontmatter + 约束规则 + 完整 tree JSON）
    Ext->>Agent: 15. vscode.open 自动打开 functions.prompt.md
    Note over Ext: Toast 提示：请在 Chat 中附加该文件并发送指令

    User->>Agent: 16. 在 Chat 中附加 functions.prompt.md（Prompt 标签）<br/>发送"开始生成代码"
    Note over Agent: 接收结构化指令 Context，作为 Prompt 一部分
    Agent-->>User: 17. 生成高收敛、覆盖基建节点的代码
```

---

## 组件职责边界（Option A）

```
用户安装两个独立组件：

  pip install function-weaver-mcp
  ↳ 真实 MCP Server，发布到 PyPI
  ↳ 用户在 .vscode/mcp.json 中注册（支持 uvx 一键启动）
  ↳ Copilot 自动发现，按上下文决策是否调用
  ↳ 职责：规则匹配 → 注入基建节点 → 写磁盘 → 返回挂起信号

  VS Code Marketplace: Function Weaver Extension
  ↳ 用 vscode.workspace.createFileSystemWatcher 监听 .weaver/sessions/
  ↳ 检测到新文件 → 读取 tree_data → 弹起 Webview
  ↳ 处理用户确认 → 写入 functions.prompt.md
  ↳ 职责：可视化层，不参与 MCP 通信链路

通信媒介：.weaver/sessions/{task_id}.json（本地文件系统）
  MCP Server ──写入──→ session 文件 ←──读取── Extension
  两者完全解耦，无直接进程间通信（无 IPC，无 stdio 拦截）
```

---

## 关键设计对比（旧方案 vs Option A）

| 维度 | 旧方案（registerTool 拦截） | Option A（真实 MCP + 文件监听） |
|------|--------------------------|-------------------------------|
| 工具调用方式 | 用户显式选择 `#weaverPlan` | Copilot 自主调用（真实 MCP 协议） |
| tree_data 分流 | Extension 在通信链路中拦截 stdio | MCP Server 自身写文件，Extension 旁观文件系统 |
| 组件耦合度 | Extension 必须作为中间人进程 | 完全解耦，各自独立发布和维护 |
| 产品形态 | Extension 捆绑 MCP | MCP 独立发布（pip），Extension 是可选增强 |
| Copilot 触发时机 | 仅用户显式触发 | Copilot 基于上下文自主决策 |