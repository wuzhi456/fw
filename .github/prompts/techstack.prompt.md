# Function Weaver — 技术栈 (Tech Stack)

---

## 组件总览

| 组件 | 语言 / 运行时 | 主要框架/库 | 职责 |
|------|-------------|-----------|------|
| MCP Server | Python ≥ 3.9 | FastMCP, jieba, difflib | 规则匹配、节点注入、数据持久化 |
| VS Code Extension | TypeScript | VS Code Extension API | MCP桥接、Webview管理、Prompt文件注入 |
| React Webview | TypeScript / React | ReactFlow, Vite | 可视化编辑、双向通信 |

---

## 1. MCP Server (`mcp_server/`)

### 运行时
- **Python ≥ 3.9**（使用 `from __future__ import annotations` 兼容 3.9）
- 虚拟环境：`.venv/`（项目根目录）

### 核心依赖（`mcp_server/requirements.txt`）

| 包 | 用途 |
|----|------|
| `fastmcp` | MCP Server框架，`@mcp.tool()` 装饰器注册工具，stdio transport |
| `jieba` | 中文分词，用于关键词提取与模糊匹配 |
| `difflib`（标准库） | `SequenceMatcher` 相似度计算，阈值 ≥ 0.6 判断命中 |

### 传输协议
- **stdio**（标准输入输出），JSON-RPC 2.0 格式
- 不使用 HTTP/SSE（MVP 阶段降低部署复杂度）

### 持久化
- **原子化写入**：write tmp → `fsync` → `rename`，防止半写文件
- 路径约定：`.weaver/sessions/{task_id}.json`，`.weaver/logs/match_history.log`
- Session 状态：`waiting_confirmation` | `confirmed` | `abandoned`

### 核心接口：`KnowledgeProvider`（Python ABC）
```python
from abc import ABC, abstractmethod

class KnowledgeProvider(ABC):
    @abstractmethod
    def match(self, root_nodes: list[str]) -> list[dict]: ...

    @property
    @abstractmethod
    def provider_id(self) -> str: ...
```
MVP 唯一实现：`InfrastructureRulesProvider`（读取 `rules/web_app_baseline.json`）

---

## 2. VS Code Extension (`extension/`)

### 运行时
- **Node.js**（随 VS Code 捆绑，无需单独安装）
- **TypeScript**，使用 `yo code` 脚手架（`generator-code`）生成

### 核心依赖（`extension/package.json`）

| 包/API | 用途 |
|--------|------|
| `vscode`（内置） | VS Code Extension API：命令、Webview、Output Channel、工作区 |
| `child_process`（Node标准库） | 启动/监控 Python `mcp_server` 子进程 |
| `fs/promises`（Node标准库） | 原子化文件写入（`tmp → fsync → rename`） |

### MCP 通信
- **MCPBridge**：stdio JSON-RPC，15 秒超时保护
- Python 解释器查找顺序：`.venv/Scripts/python.exe` → conda → 系统 PATH

### Webview 弹起
- `vscode.window.createWebviewPanel()` with `ViewColumn.Beside`
- 检测到 MCP 返回 `tree_data` 时**立即**弹起，无需用户手动触发

### Prompt 文件注入策略

| 机制 | 实现 | 用户操作 |
|------|------|---------|
| 写入 `functions.prompt.md` | `fs.promises.writeFile` + `vscode.open` | 在 Chat 中附加 `functions.prompt.md`（显示为「Prompt」标签），发送"开始生成代码"即可触发 Copilot 按结构生成 |

> VS Code Copilot 对 `.github/prompts/*.prompt.md` 文件以"结构化指令"方式处理，语义传递质量显著优于纯文本粘贴。用户手动附加文件这一动作也符合 CHI human-in-the-loop 设计，可作为研究数据点记录。

---

## 3. React Webview (`extension/webview-ui/`)

### 构建工具
- **Vite**（TypeScript 模板）：`npm create vite@latest webview-ui -- --template react-ts`
- 输出：**单文件 `dist/index.html`**（所有资源内联，满足 VS Code Webview CSP 要求）

### 核心依赖（`webview-ui/package.json`）

| 包 | 用途 |
|----|------|
| `react`, `react-dom` | UI 框架 |
| `reactflow` | 图形化节点编辑（可视化 Function Tree） |
| `@types/vscode-webview` | `acquireVsCodeApi()` TypeScript 类型定义 |

### Extension ↔ Webview 通信（`postMessage`）

| 方向 | 消息类型 | 用途 |
|------|---------|------|
| Extension → Webview | `LOAD_TREE` | 传递 `treeData` + `taskId` |
| Webview → Extension | `CONFIRM_AND_GENERATE` | 回传用户确认的 `finalTree` |
| Webview → Extension | `AUTO_SAVE_SESSION` | 每 2 秒防抖自动保存编辑中间态 |

### 节点样式规范

| 节点类型 | 样式 |
|---------|------|
| `core_feature` | 蓝色 |
| `infrastructure` | 灰色 + `[规则注入]` 左上角标签 |
| `status=confirmed` | 绿色边框 |
| `status=rejected` | 半透明 + 删除线（**软删除**，不从画布移除） |
| `source=manual` | 用户手动添加，无特殊标签 |

---

## 4. 共享数据结构

### Function Tree Node（跨组件标准格式）

```json
{
  "id": "auth_token_refresh",
  "label": "Token自动刷新",
  "node_type": "core_feature | infrastructure",
  "status": "pending | confirmed | modified | rejected",
  "description": "...",
  "dependencies": ["auth_wechat"],
  "source": "user | rule | manual",
  "triggered_by": "auth_wechat"
}
```

字段 `source` 和 `triggered_by` 为**研究数据字段**，不在 Webview UI 直接展示，但在 JSON 中完整保留。

---

## 5. 开发工具链

| 工具 | 用途 |
|------|------|
| `yo code` / `generator-code` | VS Code Extension 脚手架 |
| `npm run compile` | TypeScript 编译 |
| `F5`（VS Code） | 启动 Extension Development Host 调试 |
| `npm run build`（webview-ui） | Vite 生产构建，输出单文件 |
| Python `venv` | MCP Server 隔离环境 |
