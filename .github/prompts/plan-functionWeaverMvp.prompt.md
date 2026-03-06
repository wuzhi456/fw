## Plan: Function Weaver MVP - 图谱驱动的人机协同规划系统

**TL;DR**  
构建一个"规划中间件"系统：用户在Copilot的Plan模式中进行自动多轮对话，Copilot理解需求后调用`weaver_plan_architecture`工具。MCP Server根据用户提取的核心功能关键词，通过规则库注入隐性基建节点，生成完整Function Tree。MCP在单次response中同时返回完整树（给Extension）与挂起信号（给Copilot），Extension拦截树数据展示用户可视化编辑的Webview。用户确认后将架构写入 `.github/prompts/functions.prompt.md`，用户在Chat中附加该文件后驱动Copilot继续生成代码。首批规则库8-15节点覆盖Web应用基础域（认证、日志、错误、限流），支持跨重启恢复、单任务串行、原子化保存。目标是端到端可重复、收敛的完整闭环，为CHI论文的"收敛性降低"评估提供工程基础。

---

## 零、研究贡献定位 (Research Contribution)

### 核心问题：这个系统的贡献是什么？

**不是**：提供一个Function Tree的可视化工具（Copilot Plan模式已能生成叙事性计划，可视化只是手段）

**不是**：仅仅为Web应用注入基建节点（这是一个领域的点解决方案，不足以成为顶会贡献）

**是**：提出一个通用框架——**Planning Knowledge Augmentation（规划知识增强）**：在LLM生成叙事性规划后，通过结构化领域知识库主动检测并显式化隐性盲区，经人机协作确认后注入到后续生成流程，研究其对AI辅助开发收敛性的影响

---

### 问题背景：叙事性规划的系统性盲区

Copilot Plan模式生成的是**叙事性自然语言计划**（narrative plan）：

> "我们需要实现登录功能，包括用户认证和权限管理，以及文件上传和版本管理..."

这类计划有一个系统性缺陷：**任何被视为"理所当然"的领域知识都会被遗漏**。这不是Copilot的能力问题，而是自然语言规划的固有局限——用户不说，AI就不会主动展开：

| 知识维度 | 叙事计划的盲区 | 典型遗漏示例 |
|---------|-------------|------------|
| **基建函数**（MVP实现） | 横切关注点 | Token刷新、限流、全局错误处理 |
| **合规约束** | 行业法规 | GDPR数据驻留、无障碍(a11y)、等保三级 |
| **非功能需求** | 性能/可靠性 | 熔断器、缓存策略、降级方案 |
| **集成风险** | 第三方依赖复杂性 | OAuth回调处理、Webhook幂等、API限速 |
| **数据建模盲区** | 隐含关系 | 软删除、审计日志、多租户隔离 |

**后果**：开发者（和AI）写到一半才发现需要补这些内容，引发大量"补丁式迭代"——这正是AI辅助开发中**发散（divergence）**的主要来源。

---

### 统一框架：Planning Knowledge Augmentation

任何结构化的领域知识体，只要它在自然语言规划中被系统性遗漏，都可以接入同一套机制：

```
叙事性计划（Narrative Plan）
        ↓
  KnowledgeProvider接口
  ┌─────────────────────────────┐
  │ Provider A: InfrastructureRules  │  ← MVP实现（Web基建节点）
  │ Provider B: ComplianceRules      │  ← 未来扩展（合规约束）
  │ Provider C: NFRules              │  ← 未来扩展（非功能需求）
  │ Provider D: IntegrationRules     │  ← 未来扩展（集成风险）
  └─────────────────────────────┘
        ↓
  增强后的结构化Function Tree（Human-in-the-loop确认）
        ↓
  注入到代码生成流程
```

**MVP仅实现`InfrastructureRules` Provider，作为框架的proof of concept。**  
框架的可推广性体现在架构设计（`KnowledgeProvider`接口）上，不在MVP实现范围上。

---

### 研究假设

> **H1（主要）**：在规划阶段通过结构化知识库显式化隐性领域知识（infrastructure nodes），能够降低后续AI代码生成的迭代轮次（convergence rounds）。
>
> **H2（次要）**：用户在图形化界面中对注入节点进行审阅确认（human-in-the-loop review），相比纯文本计划，能提升用户对最终代码覆盖度的主观满意度。
>
> **H3（框架推广性）**：`KnowledgeProvider`接口的设计使得同一机制可无缝扩展到其他知识维度（合规、NFR等），验证框架的通用性。

---

### 与相关工作的区别

| 对比维度 | Copilot Plan模式 | 仅可视化工具 | **Function Weaver** |
|---------|----------------|------------|---------------------|
| 知识来源 | LLM生成（用户已知内容） | 用户已知内容图形化 | **结构化领域知识库主动注入** |
| 规划完整性 | 取决于用户表达 | 取决于用户表达 | 由知识库兜底 |
| 人机协作 | 单向生成 | 无 | **双向确认（用户决定接受/拒绝）** |
| 研究价值 | — | 用户体验 | **收敛性可量化、知识接受率可追踪** |
| 框架推广性 | — | — | **KnowledgeProvider接口可扩展** |

---

### 实验设计（Research Design）

#### 对照组设置

| 组别 | 描述 | 工具 |
|------|------|------|
| **Control**（对照组） | 用户使用Copilot Plan模式，直接生成代码 | 原生Copilot |
| **Treatment**（实验组） | 用户使用Function Weaver，经规划干预后生成代码 | Function Weaver |

#### 核心评估指标

1. **收敛轮次**（主要指标）：从初始需求到"用户满意的代码版本"所需的Chat交互轮数
2. **基建节点覆盖率**：最终代码中包含规则库定义的基建节点的比例（自动统计）
3. **节点接受率**：用户在Webview中保留（而非拒绝）`source=rule`注入节点的比例
4. **规划-实现一致性**：确认的Function Tree中的节点在最终代码中的实现率

#### 系统内置的数据采集点

这些字段已设计进数据结构，无需额外工具：

```json
// 每个节点记录
{
  "source": "rule",              // user / rule / manual → 研究注入接受率
  "triggered_by": "auth_wechat", // 哪个用户节点触发了此注入
  "status": "confirmed"          // pending/confirmed/modified/rejected → 研究用户决策
}
```

```
// 每个session记录
.weaver/sessions/{task_id}.json → 记录原始规划状态与用户修改历史
.weaver/logs/match_history.log  → 记录规则匹配全过程（规则命中率分析）
```

---

### 对系统实现的影响

这个定位意味着以下功能**必须完整实现**（不仅是"nice to have"）：

1. **`KnowledgeProvider`接口**：即使MVP只实现一个Provider，接口必须设计好（Python ABC或TypeScript interface）
2. **`source`字段的准确标注**：区分user/rule/manual，这是论文数据的基础
3. **`status`的完整状态流转**：用户每一次"删除节点"都要记录为`rejected`（软删除），而非真正删除
4. **session日志完整性**：每次规划过程的输入、注入结果、用户修改都需要持久化
5. **对照组可复现**：同一需求在Control组（无Function Weaver）下的Chat记录需要可手动采集

---

## 系统时序图与核心交互 (System Sequence & Key Interaction)

### 完整工作流时序（Step-by-Step）

1. **用户选择 Copilot Plan 模式** → Copilot内置驱动多轮对话（≥3轮），Extension无需干预
2. **多轮对话** → Copilot主动提问；用户多轮回答；Copilot最后确认总结
3. **调用工具** → Copilot触发`weaver_plan_architecture`（tool description约束已检查）
4. **MCP处理** → 规则匹配、节点注入、生成完整Function Tree
5. **单次Response** → `{status, message, task_id, tree_data}`
6. **🔑 Extension拦截分发**：
   - 提取`tree_data` → 发给Webview
   - 返回`{status, message, task_id}` → 发给Copilot（挂起信号）
7. **Webview自动弹起** → 在Chat旁边展示可编辑的架构图（无需用户手动操作）
8. **用户编辑** → 增删改节点、依赖关系；2秒防抖自动保存session
9. **点击确认** → 原子化保存、更新session、写入Prompt文件
10. **写入Prompt文件** → 生成 `.github/prompts/functions.prompt.md`，调用 `vscode.open` 自动打开
11. **用户附加文件** → 在Chat附件区选择 `functions.prompt.md`（显示为「Prompt」标签）→ 发送"开始生成代码" → Copilot按结构生成代码

### 关键设计原则

- **Copilot Plan模式多轮对话**：由Copilot内置驱动，tool description中的约束强制遵守"≥3轮+确认"
- **Webview自动弹起**：Extension检测到`tree_data`时无延迟弹起（`ViewColumn.Beside`），不覆盖Chat
- **拦截分发机制**：MCP返回完整response → Extension分离 → 对Copilot对话流透明
- **会话自动保存**：编辑时2秒防抖存session，支持跨重启恢复
- **无状态中间件**：Extension完全无状态，用户始终和Copilot对话

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
    ⚠️ 调用本工具前的必要条件（Copilot 必须严格遵守）：
    1. 你必须已与用户进行至少 3 轮以上的多轮对话
    2. 用户必须明确确认了所有核心功能模块
    3. root_nodes 中的每个关键词都必须来自用户的直接需求表述
    
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

1. **`KnowledgeProvider`接口（架构核心）**：
   ```python
   from abc import ABC, abstractmethod

   class KnowledgeProvider(ABC):
       """
       规划知识增强框架的核心接口。
       MVP只实现 InfrastructureRulesProvider，
       但接口设计允许未来无缝扩展其他知识维度。
       """
       @abstractmethod
       def match(self, root_nodes: list[str]) -> list[dict]:
           """根据用户提供的根节点，返回需要注入的节点列表"""
           pass
       
       @property
       @abstractmethod
       def provider_id(self) -> str:
           """唯一标识符，用于日志与研究追踪"""
           pass

   # MVP实现
   class InfrastructureRulesProvider(KnowledgeProvider):
       """基于规则库的基建节点注入（Web应用横切关注点）"""
       provider_id = "infrastructure_rules_v1"
       
       def match(self, root_nodes: list[str]) -> list[dict]:
           # 关键词模糊匹配 → 返回注入节点列表
           ...
   ```
2. **规则匹配引擎**：关键词模糊匹配（difflib.SequenceMatcher或jieba分词）
3. **依赖引用解析**：`@auth_*` 匹配所有 `auth_` 开头的已存在节点
4. **冲突处理**：首版暂不处理，记录warning日志
5. **原子化保存**：写临时文件 → 重命名覆盖（避免半写状态）

---

### 1.2 VS Code Extension (`extension/`)

**职责**：MCP进程启动与监控、工具响应拦截分发、Webview生命周期管理、Prompt文件注入

**关键设计原则**：
- Extension **不驱动**多轮对话流程（由Copilot Plan模式内置）
- Extension **仅拦截**工具调用的响应（分离tree_data），不修改对话内容
- Extension **无状态参与**整个规划过程，用户始终和Copilot对话，Extension只做中间件

**核心模块**：

#### A. MCP Client 桥接层 (`extension/src/mcp/client.ts`)

```typescript
class MCPBridge {
  private process: ChildProcess;
  private pendingRequests: Map<string, {resolve, reject}>;
  
  async startServer(): Promise<void> {
    // 1. 查找Python解释器（优先.venv/Scripts/python.exe → conda → 系统python）
    // 2. 启动 `python -m mcp_server` via stdio
    // 3. 监听stderr日志 → 转发到VS Code Output Channel
    // 4. 设置15秒超时保护
  }
  
  async callTool(name: string, args: any): Promise<any> {
    // 发送JSON-RPC请求到MCP Server
    const response = await this.sendRequest({
      method: "tools/call",
      params: { name, arguments: args },
      timeout: 15000  // 15秒超时
    });
    
    // ✅ 关键：拦截分发逻辑（仅针对weaver_plan_architecture）
    if (name === 'weaver_plan_architecture' && response.tree_data) {
      // 1. 提取完整树数据发给Webview（不关闭Chat窗口）
      await this.webviewManager.showTree(response.tree_data, response.task_id);
      
      // 2. 净化后返回给Copilot（仅保留status/message/task_id）
      // Copilot会看到"挂起"信号并停止输出，等待用户在Webview中确认
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
  private workspaceRoot: string;
  private mcpBridge: MCPBridge;
  private injectionStrategy: InjectionStrategy;
  
  // ✅ 关键：自动弹起 Webview 的核心方法
  async showTree(treeData: any, taskId: string): Promise<void> {
    // 1. 创建或复用 Webview Panel（自动弹起，无需用户操作）
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        'functionWeaverEditor',
        '🎨 Function Weaver - 架构编辑器',
        vscode.ViewColumn.Beside,  // ⭐ 在 Chat 旁边自动弹起
        { enableScripts: true, retainContextWhenHidden: true }
      );
      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    } else {
      this.panel.reveal(vscode.ViewColumn.Beside);  // 重新聚焦
    }
    
    // 2. 立即发送 tree_data 给前端渲染（无延迟）
    this.panel.webview.postMessage({
      type: 'LOAD_TREE',
      payload: { treeData, taskId }
    });
    
    // 3. 保存 session 到磁盘（跨重启恢复）
    await this.saveSessionToDisk(taskId, treeData);
    
    // 4. 监听 Webview 回传事件
    this.panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'CONFIRM_AND_GENERATE') {
        await this.handleConfirm(msg.payload.finalTree, taskId);
      }
      if (msg.type === 'AUTO_SAVE_SESSION') {
        await this.saveSessionToDiskThrottled(taskId, msg.payload.treeData);
      }
    });
  }
  
  private async saveSessionToDisk(taskId: string, treeData: any): Promise<void> {
    const sessionPath = path.join(this.workspaceRoot, '.weaver', 'sessions', `${taskId}.json`);
    const sessionData = {
      task_id: taskId,
      created_at: new Date().toISOString(),
      status: 'waiting_confirmation',
      tree_data: treeData
    };
    await atomicSave(sessionPath, sessionData);
  }
  
  private saveSessionToDiskThrottled = throttle(
    (taskId: string, treeData: any) => this.saveSessionToDisk(taskId, treeData),
    2000  // 2秒防抖
  );
  
  async handleConfirm(finalTree: any, taskId: string): Promise<void> {
    try {
      // 1. 原子化保存到 .weaver/active_architecture.json
      const savePath = path.join(this.workspaceRoot, '.weaver', 'active_architecture.json');
      await atomicSave(savePath, finalTree);
      vscode.window.showInformationMessage('✅ 架构已保存');
      
      // 2. 更新session状态（用于研究数据追踪）
      await this.mcpBridge.callTool('weaver_update_session', {
        task_id: taskId,
        status: 'confirmed'
      });
      
      // 3. 执行Prompt文件注入策略
      await this.injectionStrategy.execute(finalTree, taskId);
    } catch (error) {
      vscode.window.showErrorMessage(`❌ 确认失败: ${error.message}`);
      throw error;
    }
  }
}
```

#### C. Prompt 文件注入策略 (`extension/src/injection/strategy.ts`)

```typescript
class InjectionStrategy {
  async execute(tree: any, taskId: string): Promise<void> {
    const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
    const promptFilePath = path.join(workspaceRoot, '.github', 'prompts', 'functions.prompt.md');
    await fs.promises.mkdir(path.dirname(promptFilePath), { recursive: true });
    await fs.promises.writeFile(promptFilePath, this.buildPromptFile(tree, taskId));
    await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(promptFilePath));
    vscode.window.showInformationMessage(
      '✅ 架构已写入 functions.prompt.md。请在 Chat 中附加该文件（显示为「Prompt」标签）后发送"开始生成代码"',
      { modal: false }
    );
  }
  
  // 生成符合 Copilot Prompt 文件规范的 Markdown
  // 包含 YAML frontmatter 与结构化指令区块，Copilot 以"结构化指令"方式理解，语义质量优于纯文本粘贴
  private buildPromptFile(tree: any, taskId: string): string {
    return `---
description: Function Weaver 已确认架构 - 供 Copilot 生成代码使用
schema_version: "1.0.0"
task_id: "${taskId}"
---

# 系统架构：已确认

请严格按照以下 Function Tree JSON 结构生成代码，**禁止新增未在节点列表中定义的模块**。

## 约束规则

1. 按 \`dependencies\` 顺序实现（被依赖的节点先实现）
2. \`node_type: infrastructure\` 的节点必须实现，不可省略
3. \`status: rejected\` 的节点跳过不实现

## Function Tree

\`\`\`json
${JSON.stringify(tree, null, 2)}
\`\`\`
`;
  }
}
```

**实现要点**：

1. **自动弹起机制**：Extension检测到MCP返回的`tree_data`时，立即调用`showTree()`在`ViewColumn.Beside`弹起Webview，完全无需用户手动操作
2. **会话自动保存**：用户在Webview编辑时，2秒防抖自动保存到session文件，支持编辑中途的跨重启恢复
3. **启动时恢复**：IDE启动时自动检测 `.weaver/sessions/` 下状态为 `waiting_confirmation` 的任务，静默唤起Webview
4. **单任务串行**：全局锁保证同一workspace仅一个活跃任务，重复调用工具时提示"任务进行中"
5. **日志分级**：info级别记录工具调用、Webview弹起、会话保存、Prompt文件写入；error记录异常
6. **进程生命周期**：IDE激活时启动MCP Server，IDE非活跃30分钟后自动关闭Python进程释放资源

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

1. **节点样式区分**：`core_feature`用蓝色，`infrastructure`用灰色；`status=confirmed`加绿框，`status=rejected`加红色删除线（半透明显示，不从画布移除）
2. **依赖编辑**：拖拽连线自动更新`dependencies`数组
3. **状态切换**：右键菜单切换 pending/confirmed/modified/rejected
4. **⚠️ 软删除原则（研究数据要求）**：用户"删除"节点时，不从`nodes`数组中移除，而是将`status`置为`rejected`。节点在画布上半透明显示。这保证了论文数据的完整性——研究者可以追踪哪些注入节点被用户拒绝了

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
│   │   │   └── strategy.ts        # Prompt文件注入策略（写入 functions.prompt.md）
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
├── .github/
│   └── prompts/
│       ├── plan-functionWeaverMvp.prompt.md    # 本计划文档（作为系统规划上下文）
│       └── functions.prompt.md                 # 由Extension写入的架构指令（Copilot Prompt文件）
│                                               # （Chat附件区显示"Prompt"标签，用户附加后触发代码生成）
│
├── docs/
│   ├── Function Weaver Proposal.md
│   ├── sequenceDiagram.md
│   └── implementation_decisions.md  # 本次确认的所有决策记录
│
└── README.md                      # 项目总览、启动指南、架构图
```

---

## 三、实施计划 (Implementation Plan)

详见 [implementation-plan.prompt.md](implementation-plan.prompt.md)

---

## 四、验证计划 (Verification)

### 功能性验证

1. **工具调用链**：Agent → Extension → MCP → 返回挂起信号（不超过5秒）
2. **规则注入准确性**：输入"企业微信登录"，自动挂载Token刷新、异地登录踢出
3. **Webview编辑**：手动删除1个节点、新增1个节点、修改2个依赖关系，确认后JSON正确保存
4. **Prompt文件注入**：`functions.prompt.md` 被写入，内容包含 YAML frontmatter（含 `schema_version`、`task_id`）、约束规则、完整 tree JSON；`vscode.open` 自动打开文件
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

### 风险1：Python环境多样性

**预控方案**：
- **查找顺序**：`.venv/Scripts/python.exe` → `conda` → 系统PATH
- **版本检测**：要求Python ≥ 3.9，不满足时提示安装链接
- **手动配置**：`settings.json` 提供 `functionWeaver.pythonPath` 配置项

### 风险2：规则匹配误报/漏报

**预控方案**：
- **误报**：在Webview明显标记 `source=rule` 的节点，用户可一键删除
- **漏报**：提供"手动添加基建节点"按钮，从规则库选择
- **迭代优化**：记录所有匹配日志（`.weaver/logs/match_history.log`），供后续分析

### 风险3：Webview状态丢失

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
8. **唯一注入路径——Prompt文件写入**：唯一注入机制是写入 `.github/prompts/functions.prompt.md`。VS Code Copilot 对该目录下的 `.prompt.md` 文件以"结构化指令"方式处理（Chat附件区显示"Prompt"标签），语义传递质量显著优于纯文本粘贴。无需L1/L2降级机制，路径唯一，流程简洁，符合 CHI human-in-the-loop 设计（用户手动附加文件 = 明确确认动作，可作为研究数据点）
9. **`vscode.lm.registerTool()` 而非 `McpServerDefinitionProvider`**：Extension 通过 `vscode.lm.registerTool()` 注册工具，其 `invoke()` 方法在工具调用时被触发，Extension 可在此处拦截完整 response 并分离 `tree_data`，再将净化后的挂起信号返回给 Copilot。若改用 `McpServerDefinitionProvider`，Copilot 会直接通过 stdio 与 Python 进程通信，Extension 无法介入拦截层

---

## 七、后续扩展点 (Future Work)

以下扩展均基于`KnowledgeProvider`接口，无需修改核心架构：

### 知识维度扩展（框架推广性验证）
- **ComplianceProvider**：合规约束注入（GDPR数据驻留、无障碍a11y、等保三级）
- **NFRProvider**：非功能需求显式化（熔断器、缓存策略、SLA指标）
- **IntegrationRiskProvider**：第三方集成风险（OAuth回调、Webhook幂等、API限速）
- **DataModelProvider**：数据建模盲区（软删除、审计日志、多租户隔离）

### 规则库扩展
- **规则版本化**：支持多规则库切换（Web/移动端/微服务）
- **冲突自动消解**：基于优先级或LLM辅助决策
- **用户自定义规则**：允许团队沉淀私有领域知识

### 工程能力扩展
- **节点模板库**：用户自定义节点类型与字段
- **遥测数据采集**：停留时长、编辑次数、降级频率（需用户授权）
- **多任务并发**：支持多workspace同时运行

---

**下一步行动**：等待计划最终确认，然后进入"阶段1：基础设施搭建"的实施。
