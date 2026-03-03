```Mermaid
sequenceDiagram
    autonumber
    participant User as 开发者 (User)
    participant Agent as Copilot/Agent
    participant Ext as VS Code 插件
    participant MCP as Python MCP 端
    participant Webview as 前端画板 Webview

    User->>Agent: 1. 输入需求 (例: "开发文档管理系统")
    Note right of Agent: 意图锚定: 提炼业务根节点
    Agent->>Ext: 2. 触发 Tool (weaver_plan_architecture)
    Ext->>MCP: 3. stdio 转发请求
    
    rect rgb(240, 248, 255)
        Note right of MCP: 核心机制: 图谱注入
        MCP->>MCP: 4. 查库补全隐性基建节点 (如鉴权、限流)
        MCP-->>Ext: 5. 传完整功能树 (旁路通信)
        Ext-->>Agent: 6. 秒回"挂起"信号 (核心: 规避超时)
    end
    
    Note over Agent: Agent 优雅挂起，暂停输出等待人类确认
    
    Ext->>Webview: 7. 唤醒交互式画板
    Note over Webview: 8. 开发者进行可视化编织 (拖拽、修改、审阅)
    Webview-->>Ext: 9. 回传最终修改后的 JSON Schema 
    
    Note over Ext: 将终版架构就地保存至本地 JSON 文件
    Ext->>Agent: 10. 自动注入隐式追问指令 (触发 Agent 读取本地文件)
    
    Note over Agent: 接收精准 Context，作为 Prompt 一部分
    Agent-->>User: 11. 生成高质量、高收敛的代码
```

