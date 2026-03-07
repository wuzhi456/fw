import subprocess
import json
import os
import pathlib
import tempfile


def test_stub_writes_session_file_and_returns_signal():
    session_root = tempfile.mkdtemp()
    env = {**os.environ, "WORKSPACE_ROOT": session_root}

    payload = json.dumps(
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": "weaver_plan_architecture",
                "arguments": {"root_nodes": ["登录"]},
            },
        }
    )

    result = subprocess.run(
        [".venv/Scripts/python.exe", "-m", "mcp_server"],
        input=payload,
        capture_output=True,
        text=True,
        timeout=15,
        env=env,
        cwd=str(pathlib.Path(__file__).parent.parent.parent),
    )

    data = json.loads(result.stdout)
    response = data["result"]

    # Copilot 侧不应看到 tree_data
    assert "tree_data" not in response, "响应不应包含 tree_data"
    assert response["status"] == "waiting_for_human"
    task_id = response["task_id"]

    # session 文件应被写入磁盘
    sessions = list(
        (pathlib.Path(session_root) / ".weaver" / "sessions").glob("*.json")
    )
    assert len(sessions) == 1, f"期望 1 个 session 文件，实际 {len(sessions)} 个"

    session_data = json.loads(sessions[0].read_text(encoding="utf-8"))
    assert session_data["task_id"] == task_id
    assert len(session_data["nodes"]) >= 1
