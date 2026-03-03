## Plan: Function Weaver MVP - 图谱驱动的人机协同规划系统

**TL;DR**  
构建一个"规划中间件"系统，通过MCP Server（Python/FastMCP）+ VS Code Extension（TypeScript）+ React Webview的三层架构，将LLM发散的自然语言需求强制收敛为可编辑的Function Tree JSON，再通过多级注入策略（L1自动/L2剪贴板/L3上下文引用）唤醒Agent精准生成代码。核心机制是"stdio拦截分发"：MCP在单次response中同时返回完整树（给Extension）与挂起信号（给Agent），Extension拆分后分别路由到Webview和Chat。首批规则库覆盖Web应用认证+日志+错误处理（8-15节点），支持跨重启恢复、单任务串行、原子化保存。目标是端到端可重复运行的完整闭环，为CHI论文的"收敛性评估"打下工程基础。

---

## 一、分模块技术设计 (Module Specifications)

### 1.1 Python MCP Server (`mcp_server/`)

**职责**：规则匹配、图谱注入、数据持久化

**核心接口**：

```python
# 工具定义（FastMCP）
@mcp.tool()
def weaver_plan_architecture(root_nodes: list[str]) -> dict:
    """
    入参：
    {
        "root_nodes": ["企业微信登录", "文档树状目录", "富文本编辑器"]
    }
    
    出参（Extension拦截前的完整response）：
    {
        "status": "waiting_for_human",
        "message": "底座基建节点已匹配，功能图谱已生成。请在画板中审阅架构后继续。",
        "task_id": "weaver_20260303_143022",  # 跨重启恢复凭证
        "tree_data": {  # Extension会提取此字段发给Webview
            "schema_version": "1.0.0",
            "project_name": "文档管理系统",
            "nodes": [
                {
                    "id": "auth_wechat",
                    "label": "企业微信登录",
                    "node_type": "core_feature",
                    "status": "pending",
                    "description": "OAuth2.0企业微信授权登录",
                    "dependencies": [],
                    "source": "user"  # 用于研究：user/rule/manual
                },
                {
                    "id": "auth_token_refresh",
                    "label": "Token自动刷新",
                    "node_type": "infrastructure",
                    "status": "pending",
                    "description": "Access Token过期前3分钟自动续期",
                    "dependencies": ["auth_wechat"],
                    "source": "rule",
                    "triggered_by": "auth_wechat"  # 日志专用，不在UI展示
                }
                // ... 其他节点
            ]
        }
    }
    
    注：Agent仅看到status/message/task_id，Extension拦截后提取tree_data
    ```

**内部数据结构**：

- **规则库文件** `mcp_server/rules/web_app_baseline.json`：
  ```json
  {
    "rule_version": "1.0.0",
    "domain": "web_application",
    "trigger_rules": [
      {
        "keywords": ["登录", "Login", "认证", "Authentication"],
        "inject_nodes": [
          {
            "id": "auth_token_refresh",
            "label": "Token自动刷新",
            "node_type": "infrastructure",
            "description": "...",
            "dependencies_pattern": ["@auth_*"]  # 模式匹配
          },
          {
            "id": "auth_concurrent_session_control",
            "label": "异地登录踢出",
            ...
          }
        ]
      },
      {
        "keywords": ["文件上传", "Upload"],
        "inject_nodes": [
          {
            "id": "upload_chunked",
            "label": "分块上传",
            ...
          },
          {
            "id": "upload_rate_limit",
            "label": "上传限流",
            ...
          }
        ]
      }
      // 首批8-15个节点，覆盖：认证、日志、全局错误、限流
    ]
  }
  ```

- **会话持久化** `.weaver/sessions/{task_id}.json`（项目根目录）：
  ```json
  {
    "task_id": "weaver_20260303_143022",
    "created_at": "2026-03-03T14:30:22Z",
    "status": "waiting_confirmation",  // waiting_confirmation | confirmed | abandoned
    "input_root_nodes": ["企业微信登录", ...],
    "tree_data": { /* 同上 */ }
  }
  ```

**实现要点**：

1. **规则匹配引擎**：关键词模糊匹配（difflib.SequenceMatcher或jieba分词）
2. **依赖引用解析**：`@auth_*` 匹配所有 `auth_` 开头的已存在节点
3. **冲突处理**：首版暂不处理，记录warning日志
4. **原子化保存**：写临时文件 → 重命名覆盖（避免半写状态）

---

### 1.2 VS Code Extension (`extension/`)

**职责**：MCP进程管理、stdio拦截分发、Webview生命周期、多级注入策略

**核心模块**：

#### A. MCP Client 桥接层 (`extension/src/mcp/client.ts`)

```typescript
class MCPBridge {
  private process: ChildProcess;
  private pendingRequests: Map<string, {resolve, reject}>;
  
  async startServer(): Promise<void> {
    // 1. 查找Python解释器（优先venv/conda → 系统python）
    // 2. 启动 `python -m mcp_server` via stdio
    // 3. 监听stderr日志 → 转发到Output Channel
  }
  
  async callTool(name: string, args: any): Promise<any> {
    // 发送JSON-RPC请求到MCP Server
    const response = await this.sendRequest({
      method: "tools/call",
      params: { name, arguments: args }
    });
    
    // ✅ 关键：拦截分发逻辑
    if (response.tree_data) {
      // 提取完整树发给Webview
      await this.webviewManager.showTree(response.tree_data, response.task_id);
      
      // 净化后返回给Agent（仅保留status/message/task_id）
      return {
        status: response.status,
        message: response.message,
        task_id: response.task_id
      };
    }
    return response;
  }
}
```

#### B. Webview 管理器 (`extension/src/webview/manager.ts`)

```typescript
class WebviewManager {
  private panel: vscode.WebviewPanel | undefined;
  
  async showTree(treeData: any, taskId: string): Promise<void> {
    // 1. 创建或复用Webview Panel
    // 2. 发送tree_data给React前端
    this.panel.webview.postMessage({
      type: 'LOAD_TREE',
      payload: { treeData, taskId }
    });
    
    // 3. 监听Webview回传确认事件
    this.panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'CONFIRM_AND_GENERATE') {
        await this.handleConfirm(msg.payload.finalTree, taskId);
      }
    });
  }
  
  async handleConfirm(finalTree: any, taskId: string): Promise<void> {
    // 1. 原子化保存到 .weaver/active_architecture.json
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const savePath = path.join(workspaceRoot, '.weaver', 'active_architecture.json');
    await atomicSave(savePath, finalTree);
    
    // 2. 更新session状态
    await this.mcpBridge.callTool('weaver_update_session', {
      task_id: taskId,
      status: 'confirmed'
    });
    
    // 3. 执行多级注入策略
    await this.injectionStrategy.execute(finalTree, savePath);
  }
}
```

#### C. 多级注入策略 (`extension/src/injection/strategy.ts`)

```typescript
class InjectionStrategy {
  async execute(tree: any, filePath: string): Promise<void> {
    // L1: 尝试全自动注入
    try {
      await vscode.commands.executeCommand('workbench.action.chat.open', {
        query: this.buildPrompt(tree, filePath)
      });
      vscode.window.showInformationMessage('✅ 架构已注入，Agent正在生成代码...');
      return;
    } catch (e) {
      console.warn('[Weaver] L1 failed, fallback to L2:', e);
    }
    
    // L2: 剪贴板 + 聚焦Chat
    try {
      const prompt = this.buildPrompt(tree, filePath);
      await vscode.env.clipboard.writeText(prompt);
      await vscode.commands.executeCommand('workbench.action.chat.open');
      vscode.window.showInformationMessage(
        '📋 架构已就绪！按 Ctrl+V 并回车开始生成',
        { modal: false }
      );
      return;
    } catch (e) {
      console.warn('[Weaver] L2 failed, fallback to L3:', e);
    }
    
    // L3: 打开文件 + 语义上下文
    const promptPath = path.join(path.dirname(filePath), 'prompt.md');
    await fs.promises.writeFile(promptPath, this.buildPrompt(tree, filePath));
    await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(promptPath));
    vscode.window.showWarningMessage(
      '⚠️ 请手动将此内容粘贴到Chat中',
      { modal: false }
    );
  }
  
  private buildPrompt(tree: any, filePath: string): string {
    return `我已经确认了系统架构，请严格按照以下JSON结构生成代码（禁止新增未定义模块）：

\`\`\`json
${JSON.stringify(tree, null, 2)}
\`\`\`

架构文件路径：${filePath}

请从根节点开始，按依赖顺序实现每个功能模块。`;
  }
}
```

**实现要点**：

1. **启动时恢复**：读取 `.weaver/sessions/` 下状态为 `waiting_confirmation` 的任务，自动唤起Webview
2. **单任务串行**：全局锁，同一workspace仅允许一个活跃任务
3. **日志分级**：info级别记录关键事件（规则触发、用户确认），warning记录兜底降级

---

### 1.3 React Webview (`extension/webview-ui/`)

**职责**：可视化编辑、状态管理、双向通信

**核心组件**：

```tsx
// src/App.tsx
import ReactFlow, { Node, Edge } from 'reactflow';

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [taskId, setTaskId] = useState<string>('');
  
  useEffect(() => {
    // 监听Extension消息
    window.addEventListener('message', (event) => {
      if (event.data.type === 'LOAD_TREE') {
        const { treeData, taskId } = event.data.payload;
        setTaskId(taskId);
        setNodes(transformToReactFlowNodes(treeData.nodes));
        setEdges(transformToReactFlowEdges(treeData.nodes));
      }
    });
  }, []);
  
  const handleConfirm = () => {
    // 将React Flow状态转回扁平JSON
    const finalTree = {
      schema_version: '1.0.0',
      project_name: '...',
      nodes: transformBackToJSON(nodes, edges)
    };
    
    vscode.postMessage({
      type: 'CONFIRM_AND_GENERATE',
      payload: { finalTree }
    });
  };
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={(changes) => setNodes(applyNodeChanges(changes, nodes))}
      onEdgesChange={(changes) => setEdges(applyEdgeChanges(changes, edges))}
    >
      <Panel position="top-right">
        <NodeToolbar />  {/* 增删节点、切换状态 */}
        <button onClick={handleConfirm}>确认并生成代码</button>
      </Panel>
    </ReactFlow>
  );
}
```

**实现要点**：

1. **节点样式区分**：`core_feature`用蓝色，`infrastructure`用灰色；`status=confirmed`加绿框
2. **依赖编辑**：拖拽连线自动更新`dependencies`数组
3. **状态切换**：右键菜单切换 pending/confirmed/modified/rejected

---

## 二、核心文件框架 (Core File Framework)

```
FunctionWeaver/
├── mcp_server/                    # Python MCP Server
│   ├── __main__.py                # FastMCP入口
│   ├── tools/
│   │   ├── plan_architecture.py   # weaver_plan_architecture实现
│   │   └── update_session.py      # weaver_update_session实现
│   ├── rules/
│   │   ├── web_app_baseline.json  # 首批规则库（8-15节点）
│   │   └── schema.json            # 规则库JSON Schema定义
│   ├── engine/
│   │   ├── matcher.py             # 关键词匹配引擎
│   │   ├── injector.py            # 节点注入与依赖解析
│   │   └── storage.py             # 会话持久化（原子化保存）
│   └── requirements.txt           # fastmcp, jieba
│
├── extension/                     # VS Code Extension
│   ├── package.json               # 插件清单（激活事件、命令、配置）
│   ├── src/
│   │   ├── extension.ts           # 入口，注册命令与MCP桥接
│   │   ├── mcp/
│   │   │   └── client.ts          # MCP Client（stdio、拦截分发）
│   │   ├── webview/
│   │   │   └── manager.ts         # Webview生命周期管理
│   │   ├── injection/
│   │   │   └── strategy.ts        # L1/L2/L3多级注入策略
│   │   └── utils/
│   │       ├── python_finder.ts   # Python解释器定位
│   │       └── atomic_save.ts     # 原子化文件写入
│   ├── webview-ui/                # React Webview前端
│   │   ├── src/
│   │   │   ├── App.tsx            # React Flow主界面
│   │   │   ├── components/
│   │   │   │   ├── NodeToolbar.tsx
│   │   │   │   └── CustomNode.tsx # 自定义节点样式
│   │   │   └── vscode.d.ts        # VS Code Webview API类型定义
│   │   └── package.json           # react, reactflow, vite
│   └── .vscodeignore
│
├── shared_schema/                 # 跨组件共享（可选，或通过文档管理）
│   └── function_tree_schema.json  # Function Tree JSON Schema
│
├── docs/
│   ├── Function Weaver Proposal.md
│   ├── sequenceDiagram.md
│   └── implementation_decisions.md  # 本次确认的所有决策记录
│
└── README.md                      # 项目总览、启动指南、架构图
```

---

## 三、实施步骤 (Implementation Steps)

### 阶段1：基础设施搭建 (2-3天)

1. **初始化项目结构**
   - 创建 `mcp_server/`、`extension/`、`shared_schema/` 目录
   - 配置Python虚拟环境（`python -m venv .venv`）
   - 初始化Extension脚手架（`yo code`）

2. **MCP Server骨架**
   - 实现最小可用的 `weaver_plan_architecture` 工具（先返回硬编码JSON）
   - 验证stdio通信：Extension启动Python进程并成功调用工具

3. **Extension核心桥接**
   - 实现 MCPBridge.startServer 与 `callTool`
   - 验证拦截分发逻辑：打印完整response，确认可分离 `tree_data`

### 阶段2：规则引擎与数据持久化 (3-4天)

4. **规则库设计**
   - 根据"通用Web应用"场景，设计首批8-15个节点（认证、日志、错误处理、限流）
   - 编写 `rules/web_app_baseline.json`

5. **匹配引擎实现**
   - 关键词模糊匹配（jieba分词 + SequenceMatcher）
   - 依赖模式解析（`@auth_*` → 匹配已有节点）

6. **会话持久化**
   - 实现 `.weaver/sessions/{task_id}.json` 的原子化写入
   - 实现 `weaver_update_session` 工具更新状态

### 阶段3：Webview可视化 (4-5天)

7. **React Webview基础**
   - 搭建React + ReactFlow开发环境（Vite + webview通信）
   - 实现节点/边的初始渲染

8. **交互功能**
   - 节点增删改（右键菜单）
   - 依赖编辑（拖拽连线）
   - 状态切换（pending/confirmed/modified/rejected）

9. **数据回传**
   - 确认按钮触发 `CONFIRM_AND_GENERATE` 消息
   - Extension接收后原子化保存到 `.weaver/active_architecture.json`

### 阶段4：多级注入策略与闭环 (3-4天)

10. **L1自动注入**
    - 尝试 `workbench.action.chat.open` 填充query
    - 记录成功/失败日志

11. **L2剪贴板兜底**
    - 复制Prompt到剪贴板 + 聚焦Chat
    - 弹窗提示用户粘贴

12. **L3文件上下文**
    - 生成 `.weaver/prompt.md`
    - 打开文件并提示用户

13. **端到端验证**
    - 完整流程测试：用户输入 → Agent调用工具 → Webview编辑 → 确认 → Agent继续生成代码
    - 验证跨重启恢复

### 阶段5：打磨与文档 (2天)

14. **日志与错误处理**
    - 统一日志格式（info/warning/error）
    - 异常情况友好提示

15. **README与演示**
    - 编写启动指南（Python环境、Extension安装、首次运行）
    - 录制5分钟演示视频（从需求输入到代码生成）

---

## 四、验证计划 (Verification)

### 功能性验证

1. **工具调用链**：Agent → Extension → MCP → 返回挂起信号（不超过5秒）
2. **规则注入准确性**：输入"企业微信登录"，自动挂载Token刷新、异地登录踢出
3. **Webview编辑**：手动删除1个节点、新增1个节点、修改2个依赖关系，确认后JSON正确保存
4. **多级注入降级**：
   - L1成功：Chat自动填充并发送
   - L1失败 → L2成功：剪贴板有内容且Chat获得焦点
   - L2失败 → L3成功：临时文件被打开
5. **跨重启恢复**：关闭IDE → 重新打开 → Webview自动弹出未完成任务

### 性能与稳定性

1. **超时防护**：Python进程卡死时，Extension 15秒超时保护
2. **并发保护**：同时触发两次工具调用，第二次被拒绝并提示"任务进行中"
3. **原子化保存**：模拟写入过程中断电（kill -9），验证不产生半写文件

### 可用性验证

1. **首次安装体验**：在干净环境安装Extension，自动检测Python环境并给出提示
2. **错误提示**：故意输入不存在的根节点，验证友好错误提示
3. **可重复性**：三次独立运行同一场景，生成的架构树结构一致（节点ID、依赖关系稳定）

---

## 五、风险预控与多级方案 (Risk & Fallback Management)

### 风险1：Chat自动注入API不可用

**预控方案**：
- **检测策略**：启动时尝试调用 `workbench.action.chat.open`，记录成功率
- **降级路径**：L1 → L2 → L3（已在代码中实现）
- **用户通知**：首次降级时弹窗说明原因，并提供"不再提示"选项

### 风险2：Python环境多样性

**预控方案**：
- **查找顺序**：`.venv/Scripts/python.exe` → `conda` → 系统PATH
- **版本检测**：要求Python ≥ 3.9，不满足时提示安装链接
- **手动配置**：`settings.json` 提供 `functionWeaver.pythonPath` 配置项

### 风险3：规则匹配误报/漏报

**预控方案**：
- **误报**：在Webview明显标记 `source=rule` 的节点，用户可一键删除
- **漏报**：提供"手动添加基建节点"按钮，从规则库选择
- **迭代优化**：记录所有匹配日志（`.weaver/logs/match_history.log`），供后续分析

### 风险4：Webview状态丢失

**预控方案**：
- **自动保存**：每次编辑节点后2秒防抖保存到session文件
- **恢复逻辑**：Webview关闭再打开时，从session文件恢复最新状态
- **手动快照**：提供"保存草稿"按钮，生成带时间戳的备份

---

## 六、关键决策记录 (Key Decisions)

1. **stdio拦截分发**：MCP单次返回完整response，Extension分离tree_data（给Webview）与status（给Agent）
2. **节点ID策略**：语义化ID（`auth_login`），允许人工编辑，不强制UUID
3. **依赖语义**：严格前置依赖（必须先完成），不支持推荐依赖
4. **多仓结构**：在当前workspace下按子目录组织（`mcp_server/`、`extension/`），暂不拆仓
5. **语言本地化**：中英双语并存（UI中文、代码/schema英文、注释中文）
6. **首批规则领域**：通用Web应用（认证+日志+错误+限流），8-15节点
7. **研究字段**：`source`（user/rule/manual）、`triggered_by`用于论文复盘，不在UI展示

---

## 七、后续扩展点 (Future Work)

- **规则版本化**：支持多规则库切换（Web/移动端/微服务）
- **冲突自动消解**：基于优先级或LLM辅助决策
- **节点模板库**：用户自定义节点类型与字段
- **遥测数据采集**：停留时长、编辑次数、降级频率（需用户授权）
- **多任务并发**：支持多workspace同时运行

---

**下一步行动**：等待计划最终确认，然后进入"阶段1：基础设施搭建"的实施。
