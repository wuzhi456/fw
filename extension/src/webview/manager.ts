import * as vscode from 'vscode';

export class WebviewManager {
  private panel: vscode.WebviewPanel | undefined;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly workspaceRoot: string,
    private readonly channel: vscode.OutputChannel
  ) {}

  async showTree(sessionData: any, taskId: string): Promise<void> {
    this.channel.appendLine(`[Weaver][INFO] showTree called for task: ${taskId}`);

    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        'functionWeaverEditor',
        '🎨 Function Weaver',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );
      this.panel.onDidDispose(() => {
        this.channel.appendLine('[Weaver][INFO] Webview panel disposed');
        this.panel = undefined;
      });
      this.setupMessageHandler(taskId);
    } else {
      this.panel.reveal(vscode.ViewColumn.Beside);
    }

    // Task 1.4 骨架：用 <pre> 展示原始 JSON（后续替换为 ReactFlow）
    this.panel.webview.html = this.buildSkeletonHtml(sessionData);
  }

  private setupMessageHandler(taskId: string): void {
    this.panel?.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'CONFIRM_AND_GENERATE') {
        this.channel.appendLine(`[Weaver][INFO] Confirm received for task: ${taskId}`);
        vscode.window.showInformationMessage('✅ 架构已确认（功能开发中）');
      }
    });
  }

  private buildSkeletonHtml(sessionData: any): string {
    const nodesJson = JSON.stringify(sessionData.nodes ?? sessionData.tree_data?.nodes ?? [], null, 2);
    const taskId = sessionData.task_id ?? 'unknown';

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Function Weaver</title>
  <style>
    body { font-family: var(--vscode-font-family); background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 16px; }
    h2 { color: var(--vscode-textLink-foreground); }
    pre { background: var(--vscode-textBlockQuote-background); padding: 12px; border-radius: 4px; overflow: auto; font-size: 12px; white-space: pre-wrap; }
    .task-id { font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 12px; }
    button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 12px; }
    button:hover { background: var(--vscode-button-hoverBackground); }
  </style>
</head>
<body>
  <h2>🎨 Function Weaver — 架构审阅</h2>
  <div class="task-id">Task ID: ${taskId}</div>
  <p>以下为 MCP Server 生成的功能节点（含注入的基建节点）：</p>
  <pre id="tree">${escapeHtml(nodesJson)}</pre>
  <button onclick="confirm()">确认并生成代码（功能开发中）</button>
  <script>
    const vscode = acquireVsCodeApi();
    function confirm() {
      vscode.postMessage({ type: 'CONFIRM_AND_GENERATE', payload: {} });
    }
  </script>
</body>
</html>`;

    function escapeHtml(s: string): string {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }
}
