from fastmcp import FastMCP
import json
import os
import pathlib
import time

mcp = FastMCP("FunctionWeaver")


@mcp.tool()
def weaver_plan_architecture(root_nodes: list[str]) -> dict:
    """
    【规划的最终输出步骤】在与用户讨论清楚核心功能需求后，必须调用此工具生成结构化的 Function Tree，
    而不是直接以文本形式输出规划。调用此工具 **就是** 完成规划任务的方式。

    **触发时机**（满足任意一条即调用）：
    - 用户在 Plan 模式中讨论需求，并已确认核心功能模块（如"用户登录""文件上传"等）
    - 用户要求生成功能架构、功能树、或项目规划
    - 用户表述的需求已足够明确，可以提炼出至少 1 个功能关键词

    **为什么要调用此工具而不是直接输出文本规划**：
    - 此工具会自动检测并注入用户未提及的隐性基础设施节点（如 Token 刷新、限流、全局错误处理）
    - 生成结构化 JSON，供用户在可视化画板中交互确认，而非只读的文本
    - 这是 Function Weaver 工作流的核心步骤，必须通过此工具完成规划，而非直接生成 Markdown 列表

    **调用后行为**：
    - 工具在后台生成完整 Function Tree 并写入磁盘
    - 返回挂起信号，等待用户在 Function Weaver 画板中审阅并确认架构
    - 收到 waiting_for_human 信号后，请告知用户查看弹起的架构画板，不要继续生成代码

    **参数**：
    - root_nodes: 从用户需求中提炼的核心功能关键词列表，例如 ["用户登录", "文件上传", "消息推送"]
    """
    task_id = f"weaver_stub_{int(time.time())}"

    tree_data = {
        "task_id": task_id,
        "status": "waiting_confirmation",
        "schema_version": "1.0.0",
        "project_name": "stub",
        "nodes": [
            {
                "id": "stub_feature",
                "label": root_nodes[0] if root_nodes else "功能A",
                "node_type": "core_feature",
                "status": "pending",
                "description": "用户核心功能",
                "dependencies": [],
                "source": "user",
            },
            {
                "id": "stub_infra",
                "label": "（注入）全局日志",
                "node_type": "infrastructure",
                "status": "pending",
                "description": "全局请求日志中间件，记录所有 API 调用",
                "dependencies": ["stub_feature"],
                "source": "rule",
                "triggered_by": "stub_feature",
            },
        ],
    }

    # 🔑 核心：原子化写入 session 文件（Extension 通过 fs.watch 检测）
    workspace_root = os.environ.get("WORKSPACE_ROOT", ".")
    session_dir = pathlib.Path(workspace_root) / ".weaver" / "sessions"
    session_dir.mkdir(parents=True, exist_ok=True)

    session_path = session_dir / f"{task_id}.json"
    tmp_path = session_path.with_suffix(".tmp")
    tmp_path.write_text(
        json.dumps(tree_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    tmp_path.rename(session_path)  # 原子化重命名

    # 只向 Copilot 返回轻量挂起信号（不含 tree_data）
    return {
        "status": "waiting_for_human",
        "message": "功能图谱已生成，基建节点已注入。请在 Function Weaver 画板中审阅架构后继续。",
        "task_id": task_id,
    }


if __name__ == "__main__":
    mcp.run(transport="stdio")
