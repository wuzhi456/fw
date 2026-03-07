import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { WebviewManager } from '../webview/manager';

export class SessionWatcher {
  private watcher: vscode.FileSystemWatcher | undefined;

  constructor(
    private readonly webviewManager: WebviewManager,
    private readonly channel: vscode.OutputChannel
  ) {}

  start(workspaceRoot: string): void {
    const pattern = new vscode.RelativePattern(
      workspaceRoot,
      '.weaver/sessions/*.json'
    );
    this.watcher = vscode.workspace.createFileSystemWatcher(pattern);

    // 检测到 MCP Server 新写入的 session 文件时触发
    this.watcher.onDidCreate(async (uri) => {
      this.channel.appendLine(`[Weaver][INFO] session detected: ${path.basename(uri.fsPath, '.json')}`);
      await this.handleSessionFile(uri);
    });

    // 文件被覆写时也触发（重新展示）
    this.watcher.onDidChange(async (uri) => {
      await this.handleSessionFile(uri);
    });

    // 启动时扫描已存在的 waiting_confirmation session（跨重启恢复）
    this.recoverPendingSessions(workspaceRoot);
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private parseSessionJson(text: string): any {
    const normalized = text.replace(/^\uFEFF/, '').trim();
    return JSON.parse(normalized);
  }

  private async handleSessionFile(uri: vscode.Uri): Promise<void> {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const raw = await vscode.workspace.fs.readFile(uri);
        const sessionData = this.parseSessionJson(Buffer.from(raw).toString('utf-8'));

        if (sessionData.status === 'waiting_confirmation') {
          this.channel.appendLine(`[Weaver][INFO] showTree called for task: ${sessionData.task_id}`);
          await this.webviewManager.showTree(sessionData, sessionData.task_id);
        }
        return;
      } catch (err) {
        if (attempt < maxAttempts) {
          await this.delay(80);
          continue;
        }
        this.channel.appendLine(`[Weaver][ERROR] Failed to handle session file: ${err}`);
      }
    }
  }

  private async recoverPendingSessions(workspaceRoot: string): Promise<void> {
    const sessionDir = path.join(workspaceRoot, '.weaver', 'sessions');
    try {
      const files = await fs.readdir(sessionDir);
      for (const file of files) {
        if (!file.endsWith('.json')) { continue; }
        const filePath = path.join(sessionDir, file);
        const raw = await fs.readFile(filePath, 'utf-8');
        const sessionData = this.parseSessionJson(raw);
        if (sessionData.status === 'waiting_confirmation') {
          this.channel.appendLine(`[Weaver][INFO] Recovering pending session: ${sessionData.task_id}`);
          await this.webviewManager.showTree(sessionData, sessionData.task_id);
          break; // 单任务串行，只恢复最新一个
        }
      }
    } catch {
      // 目录不存在时静默忽略
    }
  }

  dispose(): void {
    this.watcher?.dispose();
  }
}
