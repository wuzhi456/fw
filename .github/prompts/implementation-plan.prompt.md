## Function Weaver MVP - 实施计划 (Implementation Plan)

> 原则：**每个任务有明确的完成标准（Done Criteria）与配套测试**，测试跑通后才能进入下一任务。优先打通主干链路，再补充细节。

---

### 阶段1：基础设施 + 主干链路打通（2-3天）

#### Task 1.1 — 项目脚手架

**操作**：
```powershell
# 在 FunctionWeaver/ 根目录下
python -m venv .venv
.venv\Scripts\pip install fastmcp jieba

mkdir mcp_server, mcp_server\tools, mcp_server\engine, mcp_server\rules
New-Item mcp_server\__main__.py, mcp_server\__init__.py

cd extension
npm install -g yo generator-code
yo code  # 选择 TypeScript Extension (without bundler)
npm install  # 安装依赖
```

**Done Criteria**：`python -m mcp_server` 能启动不报错；`F5` 能在 Extension Development Host 中加载插件

**测试**：
```powershell
# 验证 Python 依赖
.venv\Scripts\python.exe -c "import fastmcp, jieba; print('OK')"
# 验证 Extension（手动）：F5 → Extension Development Host 启动 → Output Channel 出现 "Function Weaver activated"
```

---

#### Task 1.2 — MCP Server 骨架（硬编码返回）

**文件**：`mcp_server/__main__.py`

```python
from fastmcp import FastMCP
import json, os, pathlib, tempfile, time

mcp = FastMCP("FunctionWeaver")

@mcp.tool()
def weaver_plan_architecture(root_nodes: list[str]) -> dict:
    # 阶段1：硬编码树数据，用于验证文件系统分流链路
    task_id = f"weaver_stub_{int(time.time())}"
    tree_data = {
        "task_id": task_id,
        "status": "waiting_confirmation",
        "schema_version": "1.0.0",
        "project_name": "stub",
        "nodes": [
            {"id": "stub_feature", "label": root_nodes[0] if root_nodes else "功能A",
             "node_type": "core_feature", "status": "pending",
             "dependencies": [], "source": "user"},
            {"id": "stub_infra", "label": "（注入）全局日志",
             "node_type": "infrastructure", "status": "pending",
             "dependencies": ["stub_feature"], "source": "rule",
             "triggered_by": "stub_feature"}
        ]
    }
    # 🔑 核心：写入 session 文件（Extension 通过 fs.watch 检测）
    workspace_root = os.environ.get("WORKSPACE_ROOT", ".")
    session_dir = pathlib.Path(workspace_root) / ".weaver" / "sessions"
    session_dir.mkdir(parents=True, exist_ok=True)
    session_path = session_dir / f"{task_id}.json"
    tmp_path = session_path.with_suffix(".tmp")
    tmp_path.write_text(json.dumps(tree_data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp_path.rename(session_path)  # 原子化重命名
    
    # 只返回挂起信号（不含 tree_data）
    return {
        "status": "waiting_for_human",
        "message": "架构已生成，请在 Function Weaver 画板中审阅后继续。",
        "task_id": task_id
    }

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

**Done Criteria**：调用工具后，`.weaver/sessions/{task_id}.json` 被写入（含完整 nodes）；向 Copilot 返回的响应**不含 `tree_data` 字段**

**测试**（`mcp_server/tests/test_stub.py`）：
```python
import subprocess, json, os, tempfile, pathlib

def test_stub_writes_session_file_and_returns_signal():
    session_dir = tempfile.mkdtemp()
    env = {**os.environ, "WORKSPACE_ROOT": session_dir}
    payload = json.dumps({
        "jsonrpc": "2.0", "id": 1,
        "method": "tools/call",
        "params": {"name": "weaver_plan_architecture", "arguments": {"root_nodes": ["登录"]}}
    })
    result = subprocess.run(
        [".venv/Scripts/python.exe", "-m", "mcp_server"],
        input=payload, capture_output=True, text=True, timeout=10, env=env
    )
    data = json.loads(result.stdout)
    response = data["result"]
    # Copilot 侧不应看到 tree_data
    assert "tree_data" not in response
    assert response["status"] == "waiting_for_human"
    task_id = response["task_id"]
    # session 文件应被写入磁盘
    sessions = list(pathlib.Path(session_dir).glob(".weaver/sessions/*.json"))
    assert len(sessions) == 1
    session_data = json.loads(sessions[0].read_text(encoding="utf-8"))
    assert session_data["task_id"] == task_id
    assert len(session_data["nodes"]) >= 1
```
运行：`.venv\Scripts\python.exe -m pytest mcp_server/tests/test_stub.py -v`

---

#### Task 1.3 — Extension 文件系统监听层

**文件**：`extension/src/watcher/session-watcher.ts`

重点实现：
- `SessionWatcher.start(workspaceRoot)`：使用 `vscode.workspace.createFileSystemWatcher` 监听 `.weaver/sessions/*.json`
- `onDidCreate` 回调：读取新 session 文件 → 检查 `status === 'waiting_confirmation'` → 调用 `webviewManager.showTree()` 
- `recoverPendingSessions()`：启动时扫描已有 waiting_confirmation session，自动恢复
- **不需要**启动 Python 子进程（MCP Server 由 VS Code 通过 `mcp.json` 自动管理）

**Done Criteria**：在 `.weaver/sessions/` 目录下新建一个 `test_session.json`（手动写入，模拟 MCP Server 写入），Extension 自动检测并弹起 Webview，Output Channel 显示 `[Weaver][INFO] session detected: test_session`

**测试**（`extension/src/watcher/session-watcher.test.ts`）：
```typescript
import { SessionWatcher } from './session-watcher';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

test('onDidCreate triggers showTree for waiting_confirmation session', async () => {
  const shown: any[] = [];
  const mockWM = { showTree: async (data: any, id: string) => shown.push({ data, id }) };
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'weaver-'));
  const sessionDir = path.join(tmpDir, '.weaver', 'sessions');
  await fs.mkdir(sessionDir, { recursive: true });

  const watcher = new SessionWatcher(mockWM as any);
  await watcher.start(tmpDir);

  // 模拟 MCP Server 写入 session 文件
  const sessionData = {
    task_id: 'test_001',
    status: 'waiting_confirmation',
    nodes: [{ id: 'feat_a', label: '功能A', source: 'user' }]
  };
  await fs.writeFile(
    path.join(sessionDir, 'test_001.json'),
    JSON.stringify(sessionData)
  );

  // 等待 watcher 触发（文件系统事件异步）
  await new Promise(r => setTimeout(r, 200));
  expect(shown.length).toBe(1);
  expect(shown[0].id).toBe('test_001');
  watcher.dispose();
});

test('ignores session with status !== waiting_confirmation', async () => {
  const shown: any[] = [];
  const mockWM = { showTree: async (data: any, id: string) => shown.push({ data, id }) };
  // ... 写入 status=confirmed 的文件，验证不触发 showTree
  expect(shown.length).toBe(0);
});
```
运行：`cd extension && npm test`

---

#### Task 1.4 — Webview 骨架（只显示JSON）

**文件**：`extension/src/webview/manager.ts`（仅 `showTree` 方法）

暂不用 ReactFlow，先用 `<pre>` 标签渲染原始 JSON，验证 Extension ↔ Webview 消息通信

**Done Criteria**：在 `.weaver/sessions/` 目录下手动写入一个 `waiting_confirmation` 状态的 session JSON，Webview 在 Chat 旁边自动弹起，显示 `nodes` 的 JSON 内容

**测试**（手动 + 截图存档）：
1. F5 启动 Extension Development Host
2. 在 `.weaver/sessions/` 目录下手动写入一个测试 session JSON（模拟 MCP Server 写入）
3. 验证：
   - [ ] Webview 在 Chat 右侧自动弹起，不覆盖 Chat
   - [ ] `<pre>` 显示 session 的 nodes JSON 内容
   - [ ] Output Channel 有 `[Weaver][INFO] showTree called` 日志
4. 截图保存至 `docs/screenshots/m1-trunk-verified.png`

**这是主干链路验证节点**：MCP Server 写文件 → Extension fs.watch 检测 → Webview 弹起 全链路打通

---

### 阶段2：规则引擎与数据持久化（3-4天）

#### Task 2.1 — KnowledgeProvider 接口 + 首个实现

**文件**：`mcp_server/engine/provider.py`

```python
from abc import ABC, abstractmethod

class KnowledgeProvider(ABC):
    @abstractmethod
    def match(self, root_nodes: list[str]) -> list[dict]:
        pass

    @property
    @abstractmethod
    def provider_id(self) -> str:
        pass
```

**文件**：`mcp_server/engine/infrastructure_provider.py`（继承上面的接口，读 JSON 规则库）

**Done Criteria**：`InfrastructureRulesProvider().match(["登录"])` 返回包含 `auth_token_refresh` 节点的列表

**测试**（`mcp_server/tests/test_provider.py`）：
```python
from mcp_server.engine.infrastructure_provider import InfrastructureRulesProvider

def test_provider_id():
    assert InfrastructureRulesProvider().provider_id == "infrastructure_rules_v1"

def test_match_returns_list_of_dicts():
    result = InfrastructureRulesProvider().match(["登录"])
    assert isinstance(result, list) and all(isinstance(n, dict) for n in result)

def test_match_injects_token_refresh_for_auth():
    ids = [n["id"] for n in InfrastructureRulesProvider().match(["登录"])]
    assert "auth_token_refresh" in ids

def test_no_match_for_unrelated():
    assert len(InfrastructureRulesProvider().match(["天气查询"])) == 0
```
运行：`.venv\Scripts\python.exe -m pytest mcp_server/tests/test_provider.py -v`

---

#### Task 2.2 — 规则库 JSON（首批 8-15 节点）

**文件**：`mcp_server/rules/web_app_baseline.json`

覆盖 5 个触发域：

| 触发关键词 | 注入节点 |
|----------|---------|
| 登录/认证/Auth | Token刷新、并发会话控制（异地踢出） |
| 日志/Logging | 全局请求日志中间件、慢查询日志 |
| 错误/Error | 全局异常处理器、错误码规范化 |
| 限流/Rate | 接口限流（IP维度）、限流降级页 |
| 文件上传/Upload | 分块上传、上传限流 |

**Done Criteria**：5个触发域均能命中至少1个注入节点，总节点数8-15

**测试**（`mcp_server/tests/test_rules.py`）：
```python
import json, pathlib, pytest

RULES_PATH = pathlib.Path("mcp_server/rules/web_app_baseline.json")

def test_rules_file_valid_json():
    data = json.loads(RULES_PATH.read_text(encoding="utf-8"))
    assert "trigger_rules" in data

def test_total_injected_nodes_in_range():
    data = json.loads(RULES_PATH.read_text(encoding="utf-8"))
    total = sum(len(r["inject_nodes"]) for r in data["trigger_rules"])
    assert 8 <= total <= 15

@pytest.mark.parametrize("keyword", ["登录", "日志", "错误处理", "限流", "文件上传"])
def test_five_trigger_domains_present(keyword):
    from mcp_server.engine.infrastructure_provider import InfrastructureRulesProvider
    result = InfrastructureRulesProvider().match([keyword])
    assert len(result) >= 1, f"触发词 '{keyword}' 未命中任何节点"
```
运行：`.venv\Scripts\python.exe -m pytest mcp_server/tests/test_rules.py -v`

---

#### Task 2.3 — 模糊匹配引擎

**文件**：`mcp_server/engine/matcher.py`

策略：`jieba.lcut()` 分词 + `difflib.SequenceMatcher` 相似度 ≥ 0.6 命中

**Done Criteria**：`match_keywords("企业微信登录", ["登录", "认证"])` 返回 `True`；`match_keywords("文档目录树", ["登录"])` 返回 `False`

**测试**（`mcp_server/tests/test_matcher.py`）：
```python
from mcp_server.engine.matcher import match_keywords

def test_exact_match():        assert match_keywords("用户登录", ["登录"]) is True
def test_fuzzy_wechat():       assert match_keywords("企业微信登录", ["登录", "认证"]) is True
def test_no_match_unrelated(): assert match_keywords("文档目录树", ["登录"]) is False
def test_english_keyword():    assert match_keywords("User Authentication", ["Authentication"]) is True
def test_threshold_boundary(): assert match_keywords("完全无关内容xyz", ["登录"]) is False
```
运行：`.venv\Scripts\python.exe -m pytest mcp_server/tests/test_matcher.py -v`

---

#### Task 2.4 — Session 持久化

**文件**：`mcp_server/engine/storage.py`

原子化写入：`write_tmp → fsync → rename`

Session 结构（含研究字段）：
```json
{
  "task_id": "...",
  "created_at": "...",
  "status": "waiting_confirmation",
  "input_root_nodes": [],
  "providers_used": ["infrastructure_rules_v1"],
  "tree_data": {}
}
```

**Done Criteria**：调用工具后，`.weaver/sessions/{task_id}.json` 被写入；模拟进程中途 kill -9，文件不损坏

**测试**（`mcp_server/tests/test_storage.py`）：
```python
import json, pathlib, tempfile
from mcp_server.engine.storage import atomic_save

def test_atomic_save_creates_file():
    with tempfile.TemporaryDirectory() as d:
        p = pathlib.Path(d) / "session.json"
        atomic_save(p, {"task_id": "t1", "status": "waiting_confirmation"})
        assert p.exists()
        assert json.loads(p.read_text())["task_id"] == "t1"

def test_atomic_save_no_partial_write(monkeypatch):
    with tempfile.TemporaryDirectory() as d:
        p = pathlib.Path(d) / "session.json"
        atomic_save(p, {"task_id": "original"})
        monkeypatch.setattr(pathlib.Path, "rename", lambda *a: exec('raise OSError("crash")'))
        try:
            atomic_save(p, {"task_id": "corrupted"})
        except OSError:
            pass
        assert json.loads(p.read_text())["task_id"] == "original"
```
运行：`.venv\Scripts\python.exe -m pytest mcp_server/tests/test_storage.py -v`

---

#### Task 2.5 — 将 Task 1.2 的硬编码替换为真实引擎

将 `__main__.py` 中的 stub 替换为：调用 `InfrastructureRulesProvider` + `storage.save_session()`

**Done Criteria**：输入 `["企业微信登录"]`，返回包含 `auth_token_refresh`（source=rule）的真实树；`.weaver/sessions/` 下有对应文件

**测试**（`mcp_server/tests/test_integration.py`）：
```python
import subprocess, json, pathlib, tempfile, os

def test_real_engine_end_to_end():
    payload = json.dumps({
        "jsonrpc": "2.0", "id": 1,
        "method": "tools/call",
        "params": {"name": "weaver_plan_architecture",
                   "arguments": {"root_nodes": ["企业微信登录"]}}
    })
    session_dir = tempfile.mkdtemp()
    env = {**os.environ, "WEAVER_SESSION_DIR": session_dir}
    result = subprocess.run(
        [".venv/Scripts/python.exe", "-m", "mcp_server"],
        input=payload, capture_output=True, text=True, timeout=15, env=env
    )
    data = json.loads(result.stdout)
    nodes = data["result"]["tree_data"]["nodes"]
    rule_nodes = [n for n in nodes if n["source"] == "rule"]
    assert any(n["id"] == "auth_token_refresh" for n in rule_nodes)
    task_id = data["result"]["task_id"]
    assert (pathlib.Path(session_dir) / f"{task_id}.json").exists()
```
运行：`.venv\Scripts\python.exe -m pytest mcp_server/tests/test_integration.py -v`

---

### 阶段3：Webview 可视化（4-5天）

#### Task 3.1 — React + ReactFlow 开发环境

**目录**：`extension/webview-ui/`

```powershell
npm create vite@latest webview-ui -- --template react-ts
cd webview-ui
npm install reactflow
```

配置 Vite 使所有资源内联（Webview CSP 要求），接入 `acquireVsCodeApi()`

**Done Criteria**：`npm run build` 产出单文件 `dist/index.html`，Extension 能加载它并弹起空白画布

**测试**：
```powershell
cd extension/webview-ui; npm run build
$files = Get-ChildItem dist -Recurse -File
if ($files.Count -eq 1 -and $files[0].Name -eq "index.html") { Write-Host "PASS" } else { Write-Error "FAIL: 期望单文件输出" }
```
手动验证：F5 → 调用工具 → Webview 弹起显示空白 ReactFlow 画布（无控制台报错）。

---

#### Task 3.2 — 节点渲染（只读）

实现 `transformToReactFlowNodes()` 和 `transformToReactFlowEdges()`：
- `core_feature` → 蓝色节点
- `infrastructure` → 灰色节点，左上角显示 `[规则注入]` 标签（`source=rule` 时）
- `status=rejected` → 半透明 + 删除线样式

**Done Criteria**：从 Extension 发来的 `LOAD_TREE` 消息后，画布正确渲染节点和依赖连线

**测试**（`extension/webview-ui/src/__tests__/App.test.tsx`，Vitest + @testing-library/react）：
```tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

const mockTree = {
  schema_version: '1.0.0', project_name: 'test',
  nodes: [
    { id: 'feat_a', label: '功能A', node_type: 'core_feature',
      status: 'pending', dependencies: [], source: 'user' },
    { id: 'infra_b', label: '基建B', node_type: 'infrastructure',
      status: 'pending', dependencies: ['feat_a'], source: 'rule', triggered_by: 'feat_a' }
  ]
};

test('renders both nodes', () => {
  render(<App />);
  window.dispatchEvent(new MessageEvent('message', {
    data: { type: 'LOAD_TREE', payload: { treeData: mockTree, taskId: 't1' } }
  }));
  expect(screen.getByText('功能A')).toBeInTheDocument();
  expect(screen.getByText('基建B')).toBeInTheDocument();
});

test('infrastructure node shows rule injection label', () => {
  render(<App />);
  window.dispatchEvent(new MessageEvent('message', {
    data: { type: 'LOAD_TREE', payload: { treeData: mockTree, taskId: 't1' } }
  }));
  expect(screen.getByText('[规则注入]')).toBeInTheDocument();
});
```
运行：`cd extension/webview-ui && npm run test`

---

#### Task 3.3 — 交互编辑

- 右键菜单：切换 `status`（pending / confirmed / modified / rejected）
- **软删除**：没有"删除"按钮，"标记拒绝"按钮将 `status` 置为 `rejected`（保留在画布）
- 新增节点：弹出表单，`source` 默认为 `manual`
- 拖拽连线更新 `dependencies`
- 每次编辑后 → `postMessage({ type: 'AUTO_SAVE_SESSION', payload: { treeData } })`（前端 2 秒防抖）

**Done Criteria**：右键标记拒绝后节点变为半透明；新增节点后 JSON 中 `source=manual`；2 秒后 session 文件更新

**测试**（`extension/webview-ui/src/__tests__/interactions.test.tsx`）：
```tsx
import { render, waitFor } from '@testing-library/react';
import App from '../App';

test('soft-delete: reject sets status=rejected, node stays in DOM', async () => {
  const messages: any[] = [];
  (globalThis as any).acquireVsCodeApi = () => ({ postMessage: (m: any) => messages.push(m) });
  render(<App />);
  // 发送树 -> 右键节点 -> 点击「标记拒绝」（具体 fireEvent 视实现而定）
  await waitFor(() => {
    const saveMsg = messages.find(m => m.type === 'AUTO_SAVE_SESSION');
    expect(saveMsg).toBeDefined();
    const rejected = saveMsg.payload.treeData.nodes.filter((n: any) => n.status === 'rejected');
    expect(rejected.length).toBeGreaterThan(0);
  }, { timeout: 3000 });
  // 断言：被拒绝的节点仍在 DOM（软删除，不从画布移除）
});

test('add manual node has source=manual', async () => {
  const messages: any[] = [];
  (globalThis as any).acquireVsCodeApi = () => ({ postMessage: (m: any) => messages.push(m) });
  render(<App />);
  // 点击「新增节点」-> 填写 label -> 确认
  await waitFor(() => {
    const saveMsg = messages.find(m => m.type === 'AUTO_SAVE_SESSION');
    const manual = saveMsg?.payload.treeData.nodes.find((n: any) => n.source === 'manual');
    expect(manual).toBeDefined();
  }, { timeout: 3000 });
});
```
运行：`cd extension/webview-ui && npm run test`

---

#### Task 3.4 — 确认按钮与数据回传

实现 `handleConfirm()`：
1. `transformBackToJSON(nodes, edges)` → 重建扁平 JSON
2. `postMessage({ type: 'CONFIRM_AND_GENERATE', payload: { finalTree } })`
3. Extension 接收后原子化保存 `.weaver/active_architecture.json`

**Done Criteria**：点击确认后，`.weaver/active_architecture.json` 中的 `rejected` 节点保留（软删除有效），`confirmed` 节点内容正确

**测试**（`extension/webview-ui/src/__tests__/confirm.test.tsx`）：
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

test('confirm message contains rejected nodes (soft-delete)', () => {
  const messages: any[] = [];
  (globalThis as any).acquireVsCodeApi = () => ({ postMessage: (m: any) => messages.push(m) });
  render(<App />);
  // 发送树 -> 标记一个节点 rejected -> 点击确认
  fireEvent.click(screen.getByText('确认并生成代码'));
  const confirm = messages.find(m => m.type === 'CONFIRM_AND_GENERATE');
  expect(confirm).toBeDefined();
  const rejected = confirm.payload.finalTree.nodes.filter((n: any) => n.status === 'rejected');
  expect(rejected.length).toBeGreaterThan(0);
});
```
运行：`cd extension/webview-ui && npm run test`

---

### 阶段4：Prompt文件注入与完整闭环（2-3天）

#### Task 4.1 — 写入 functions.prompt.md

写入 `.github/prompts/functions.prompt.md`（含 YAML frontmatter + 约束规则 + 完整 tree JSON），并调用 `vscode.open` 自动打开文件，弹出 Toast 提示用户附加到Chat。

**Done Criteria**：文件路径包含 `functions.prompt.md`，内容含 `description:`、`schema_version`、`rejected`（软删除节点保留）、`infrastructure`；`vscode.open` 命令被执行

**测试**（`extension/src/injection/strategy.test.ts`）：
```typescript
test('writes functions.prompt.md with correct content', async () => {
  let writtenPath = '';
  let writtenContent = '';
  const mockFs = {
    promises: {
      mkdir: async () => {},
      writeFile: async (p: any, c: string) => { writtenPath = String(p); writtenContent = c; }
    }
  };
  const strategy = new InjectionStrategy(mockVscode as any, mockFs as any);
  await strategy.execute(mockTree, 'weaver_stub_001');
  expect(writtenPath).toContain('functions.prompt.md');
  expect(writtenContent).toContain('description:');
  expect(writtenContent).toContain('schema_version');
  expect(writtenContent).toContain('rejected');
  expect(writtenContent).toContain('infrastructure');
});

test('vscode.open is called after writing prompt file', async () => {
  const executed: string[] = [];
  const mockVscodeOpen = {
    ...mockVscode,
    commands: { executeCommand: async (cmd: string) => executed.push(cmd) }
  };
  const strategy = new InjectionStrategy(mockVscodeOpen as any, mockFs as any);
  await strategy.execute(mockTree, 'weaver_stub_001');
  expect(executed).toContain('vscode.open');
});
```
运行：`cd extension && npm test`

---

#### Task 4.2 — 启动时会话恢复

`extension.ts` 激活时：扫描 `.weaver/sessions/*.json`，找 `status=waiting_confirmation` → 自动调用 `webviewManager.showTree()`

**Done Criteria**：关闭 IDE → 重开 → Webview 自动弹出，恢复上次编辑的树

**测试**（`extension/src/webview/manager.test.ts`）：
```typescript
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';

test('on activate, finds waiting_confirmation session and calls showTree', async () => {
  const sessionDir = await fs.mkdtemp(path.join(os.tmpdir(), 'weaver-'));
  const sessionData = { task_id: 't99', status: 'waiting_confirmation', tree_data: mockTree };
  await fs.writeFile(path.join(sessionDir, 't99.json'), JSON.stringify(sessionData));

  const shown: any[] = [];
  const manager = new WebviewManager({ sessionDir, mcpBridge: mockBridge } as any);
  manager.showTree = async (tree: any, id: string) => { shown.push({ tree, id }); };
  await manager.recoverPendingSessions();

  expect(shown.length).toBe(1);
  expect(shown[0].id).toBe('t99');
});
```
运行：`cd extension && npm test`

---

#### Task 4.3 — 端到端冒烟测试

固定场景：输入 `["用户登录", "文章发布"]`，走完完整流程

**Done Criteria**：`.weaver/active_architecture.json` 节点数 = 用户节点 + 接受的注入节点 + manual 节点；rejected 节点保留在 JSON 中；Copilot 生成的代码包含结构中的模块

**测试**（全链路手动检查单，执行结果截图存档）：
```
[ ] 1. 输入 ["用户登录", "文章发布"] -> Webview 弹起，注入节点带 [规则注入] 标签
[ ] 2. 右键拒绝 1 个注入节点 -> 节点半透明，2s 后 session 更新且 status=rejected
[ ] 3. 新增 1 个手动节点 -> session 中该节点 source=manual
[ ] 4. 点击「确认」-> active_architecture.json 存在，rejected 节点保留
[ ] 5. functions.prompt.md 被写入并自动打开，内容包含完整 Function Tree JSON
[ ] 6. Copilot 在 Chat 中输出覆盖 auth_token_refresh 的代码
截图保存至 docs/screenshots/m4-e2e-verified.png
```

---

### 阶段5：打磨（2天）

#### Task 5.1 — 日志与异常处理

- MCP Server：`logging` 模块，格式 `[Weaver][INFO] 规则命中: auth_token_refresh <- 登录`
- Extension：Output Channel `Function Weaver`，分级打印
- 所有对外 API 加 try/catch，异常时展示友好错误

**Done Criteria**：故意传入空 `root_nodes`，Extension 显示友好错误而非崩溃

**测试**（`mcp_server/tests/test_error_handling.py`）：
```python
import subprocess, json

def test_empty_root_nodes_no_crash():
    payload = json.dumps({
        "jsonrpc": "2.0", "id": 1,
        "method": "tools/call",
        "params": {"name": "weaver_plan_architecture", "arguments": {"root_nodes": []}}
    })
    result = subprocess.run(
        [".venv/Scripts/python.exe", "-m", "mcp_server"],
        input=payload, capture_output=True, text=True, timeout=10
    )
    assert result.returncode == 0  # 进程不崩溃
    data = json.loads(result.stdout)
    r = data.get("result", {})
    assert r.get("status") == "error" or "error" in data
```
运行：`.venv\Scripts\python.exe -m pytest mcp_server/tests/test_error_handling.py -v`

---

#### Task 5.2 — README + 首次安装体验

- Python 环境检测失败时弹窗给出安装链接
- README：环境要求、快速开始（5步）、架构图
- 准备 demo 场景脚本（用于论文截图/录屏）

**Done Criteria**：在干净 Windows 环境按 README 操作，15分钟内完成首次运行

**测试**（在干净 Windows 虚拟机中执行，记录耗时）：
```
[ ] 1. 全新 Python 3.11 安装（无 fastmcp/jieba）
[ ] 2. 按 README「快速开始」操作，不看其他文档
[ ] 3. 从开始到成功触发 Webview 耗时 <= 15 分钟
[ ] 4. Python < 3.9 时弹窗提示安装链接
[ ] 5. 截图保存至 docs/screenshots/m5-fresh-install.png
```

---

### 关键里程碑

| 里程碑 | 完成标志 | 验收方式 |
|-------|---------|---------|
| **M1（阶段1末）** | 主干链路打通：Copilot → MCP → Webview 单次完整流转 | 截图 m1-trunk-verified.png |
| **M2（阶段2末）** | 真实规则注入：输入"登录"自动挂载2个基建节点，session 落盘 | `pytest mcp_server/tests/ -v` 全绿 |
| **M3（阶段3末）** | 完整可视化：软删除、新增节点、确认回传均正常 | `npm run test`（webview-ui）全绿 |
| **M4（阶段4末）** | 端到端闭环：注入 → 编辑 → 确认 → Copilot 继续生成 | 截图 m4-e2e-verified.png |
| **M5（阶段5末）** | 研究就绪：日志完整、可复现、可采集对照组数据 | 截图 m5-fresh-install.png |
