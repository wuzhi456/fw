````markdown
### Function Weaver Proposal

**Function Weaver: Graph-Augmented Progressive Reification for Human-AI Collaborative Software Development** #### 一、 研究背景与痛点 (Problem Statement & Motivation)

当前以 Copilot / Cursor 为代表的 Agentic IDE 展现了强大的代码生成能力。但在处理中大型需求（从自然语言 PRD 到完整系统架构）时，其原生"规划（Plan）"模式面临三大系统性缺陷：

1. **发散与难以收敛**：大模型对开放式自然语言的自回归推理具有高度不确定性，面对相同需求，多次生成的系统架构模块差异巨大。
2. **企业级"隐性需求"黑洞**：现有的模型规划往往只聚焦于用户显式提出的"业务主线"（如文件上传），而严重遗漏权限鉴权、并发限流、全局错误兜底等软件工程中必须的"隐性基建"。
3. **黑盒执行与极高的纠错成本**：现有的 Plan 是一次性生成的纯文本。由于缺乏细粒度的人类干预节点，一旦上游规划出现遗漏，将导致下游生成的数百行代码面临推翻重来的高昂成本。

**核心洞察 (Key Insight)**：软件工程的底层结构是高度收敛的，而大模型的生成天性是发散的。解决这一矛盾的关键，不在于训练一个更聪明的规划 Agent，而在于在 LLM 的"高层意图规划"与"底层代码执行"之间，硬性嵌入一个**带有先验领域知识的交互式边界对象 (Interactive Boundary Object)**。

#### 二、 系统架构与工作流 (System Architecture & Pipeline)

本项目提出 Function Weaver，一个基于 Model Context Protocol (MCP) 与 IDE 插件强协同构建的"混合状态机中间件"。它通过以下"四步走"工作流（The Weaver Pipeline），实现了从自然语言到高精度架构树的收敛：

**架构概览（Option A：真实 MCP + 文件系统分流）**

用户安装两个独立组件：
- `pip install function-weaver-mcp`（PyPI，真实 MCP Server，Copilot 自动发现并调用）
- VS Code Extension（Marketplace，可视化层，通过文件系统监听与 MCP Server 解耦通信）

```text
Copilot ──自动调用──→ Python MCP Server（真实 MCP 协议）
                           ↓ 写入完整 tree_data
        .weaver/sessions/{task_id}.json
                           ↓ 仅返回挂起信号
                      {status, message, task_id}
Extension ←──fs.watch──── 检测到新文件 → 读取 tree_data → Webview
```

**第一步：自然语言摸底与意图锚定 (Agent 主场)**

- **场景**：用户在 IDE（如 VS Code + Copilot）中输入："我想做一个给内部员工用的文档管理系统"。
- **行为**：Copilot 发挥其强大的语义理解能力，与用户确认高阶边界，提炼出核心的"根节点 (Root Nodes)"（例如：企业微信登录、文档树状目录、富文本编辑器）。

**第二步：系统级强引导与工具调用 (Prompt-Driven Tool Call)**

- **机制约束**：通过注入项目级系统提示词（如 `.github/prompts/` 中的约束文件），建立工作流边界规则："在生成任何系统级代码前，**必须**先调用 `weaver_plan_architecture` 工具生成功能图谱，并等待人类确认"。

- **数据流**：Copilot 基于上下文自主判断，将聊天中抽象出的根节点作为 JSON 参数，向真实 MCP Server 发起工具调用：

  ```json
  {
    "root_nodes": ["企业微信登录", "文档树状目录", "富文本编辑器"]
  }
  ```

**第三步：图谱注入、文件系统分流与视觉触发 (Weaver 核心机制 / 绕过超时壁垒)**

- **后台图谱注入 (MCP Server)**：本地 MCP Server 收到根节点后，查询预设的"企业级应用功能图谱"。基于规则引擎补充隐性需求（如自动挂载 `Token刷新`、`并发异地登录踢出`、`全局错误处理` 等基建节点），构建出一棵完整的强类型 JSON 树。
- **文件系统分流（核心机制）**：MCP Server 将完整的 `tree_data`**原子化写入本地文件** `.weaver/sessions/{task_id}.json`。这是数据分流的关键一步——树数据直接落磁盘，不经过 Copilot 响应链路。
- **秒级返回与防超时 (Fast Return)**：为避免人类在 UI 交互时触发 LLM 严苛的 API Timeout（通常 60 秒），MCP Server 在写入文件后**立即**向 Copilot 返回轻量挂起信号：`{"status": "waiting_for_human", "message": "图谱已生成，请在 Function Weaver 画板中审阅后继续", "task_id": "..."}` 。Copilot 收到此信息后自动结束当前生成轮次（Turn），实现优雅挂起。
- **文件监听与前台视觉触发 (VS Code Extension)**：VS Code Extension 通过 `vscode.workspace.createFileSystemWatcher('.weaver/sessions/*.json')` 持续监听 session 目录。检测到新文件后，Extension 读取 `tree_data` 并在 Chat 旁边（`ViewColumn.Beside`）弹起交互式画板——无 IPC、无进程间通信、无 stdio 拦截，完全解耦。
- **个性化编织 (Human-in-the-Loop)**：用户在可视化的树状图中，看到系统补全的企业级节点。用户通过拖拽、增删、添加注释，对功能树进行充裕的白盒修改与审阅。**(The Tree is the Prompt)**

**第四步：上下文自动注入与精准生成 (自动闭环)**

- **结构化 Prompt 写入**：用户在画板点击"确认并生成代码"。Extension 将终版 JSON 架构自动写入 `.github/prompts/functions.prompt.md`（含 YAML frontmatter、约束规则与完整 tree JSON），并调用 `vscode.open` 自动打开该文件。
- **用户主动附加**：Toast 提示用户在 Chat 中附加该文件（显示为「Prompt」标签），发送"开始生成代码"。
- **结果**：Copilot 接收到这份结构化、毫无歧义的 Context，像一台精密打字机一样，极其精准地输出高质量的、覆盖所有基建节点的代码。

#### 三、 核心学术与工程贡献 (Contributions)

1. **架构层（文件系统分流中间件 File-System Decoupled Middleware）**：设计了一种通过本地文件系统解耦 MCP Server 与 IDE 插件的异步交互模式——MCP 写磁盘、Extension 监听文件，两个组件独立发布、独立维护，首次在 Copilot 工作流中实现了真正解耦的 Human-in-the-Loop 拦截。
2. **机制层（知识注入图谱 Graph Injection）**：提出了一种结合"通用大模型动态推理"与"静态领域规则图谱"的混合规划架构，大幅提升了生成代码的企业级可用性下限。
3. **交互层（树即提示词 The Tree is the Prompt）**：设计并验证了全新的交互范式，将不可控的 Text-to-Code 转化为高确定性的 `Text → Visual Tree → Code`，显著降低了开发者掌控复杂系统架构的认知负荷。

#### 四、 评估与实验设计 (Evaluation / User Study)

为全面评估 Function Weaver 在系统收敛性、代码质量以及人机协同体验上的有效性，本项目将采用"混合方法研究 (Mixed-methods Research)"，结合受控用户实验与线上真实环境的纵向日志分析。

**4.1 受控用户实验 (Controlled User Study)**

- **任务设计 (Tasks)**：选取 2-3 个具有典型"隐性基建"特征的中大型系统需求。例如："开发一个支持文件分块上传、附带用户鉴权与并发限流的 Node.js 后端服务"。
- **评估指标 (Dependent Variables)**：
  - **客观指标**：任务完成时间 (Task Completion Time)、生成的底层基建代码覆盖率（如是否遗漏日志记录、全局错误拦截等）、一次性编译通过率。
  - **主观指标**：使用 NASA-TLX 量表评估开发者的认知负荷；使用 Likert 量表评估开发者对 AI 生成架构的**控制感 (Perceived Control)** 与**信任度 (Trust)**。

**4.2 线上环境部署与遥测日志分析 (In-the-Wild Deployment)**

- **核心日志挖掘指标 (Telemetry Metrics)**：
  - **视觉交互深度 (Visual Interaction Depth)**：记录开发者在可视化的"功能节点树"上的平均停留时间、对节点进行"增删改查"的平均次数。
  - **指令重试衰减率 (Prompt Iteration Reduction)**：对比安装 Weaver 前后，开发者发起多轮对话修正的频次变化，验证系统是否有效降低了"纠错成本"。

#### 五、预期结论（Expected Outcomes）

Function Weaver 将证明：在 Agentic 软件工程中，通过引入外部图谱知识库和建立关键的"视觉交互停顿点（Visual Interception）"，系统能够在不损失 LLM 自动化效率的前提下，极大地提高架构规划的稳定收敛性，并确立更可靠的人机信任共识。
````