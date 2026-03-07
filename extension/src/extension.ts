import * as vscode from 'vscode';
import { SessionWatcher } from './watcher/session-watcher';
import { WebviewManager } from './webview/manager';

let sessionWatcher: SessionWatcher | undefined;

export function activate(context: vscode.ExtensionContext) {
  const channel = vscode.window.createOutputChannel('Function Weaver');
  channel.appendLine('[Weaver][INFO] Function Weaver activated');

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    channel.appendLine('[Weaver][WARN] No workspace folder found, skipping session watcher');
    return;
  }

  channel.appendLine(`[Weaver][INFO] Workspace folders: ${workspaceFolders.map((f) => f.uri.fsPath).join(' | ')}`);

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const mcpJsonPath = vscode.Uri.joinPath(workspaceFolders[0].uri, '.vscode', 'mcp.json');
  vscode.workspace.fs
    .stat(mcpJsonPath)
    .then(
      () => channel.appendLine(`[Weaver][INFO] MCP config found: ${mcpJsonPath.fsPath}`),
      () => channel.appendLine(`[Weaver][WARN] MCP config missing in active root: ${mcpJsonPath.fsPath}`)
    );

  const webviewManager = new WebviewManager(context, workspaceRoot, channel);
  sessionWatcher = new SessionWatcher(webviewManager, channel);
  sessionWatcher.start(workspaceRoot);

  context.subscriptions.push(
    vscode.commands.registerCommand('functionWeaver.showStatus', () => {
      channel.show();
      vscode.window.showInformationMessage('Function Weaver is active. Watching .weaver/sessions/ for new plans.');
    }),
    { dispose: () => sessionWatcher?.dispose() }
  );

  channel.appendLine(`[Weaver][INFO] Watching ${workspaceRoot}/.weaver/sessions/*.json`);
}

export function deactivate() {
  sessionWatcher?.dispose();
}
