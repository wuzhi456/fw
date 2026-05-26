import argparse
import json
import os
import subprocess
import sys
from typing import Dict, List


def _task_id(path: str) -> str:
    return os.path.splitext(os.path.basename(path))[0]


def _run_router(cmd: List[str]) -> None:
    subprocess.run(cmd, check=True)


def _read_json(path: str) -> Dict:
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run deterministic + semantic routers over all tasks.")
    parser.add_argument("--stage", required=True, help="Stage: plan, coding, review, or test.")
    parser.add_argument(
        "--tasks-dir",
        default=os.path.join("experiments", "tasks"),
        help="Directory containing task files.",
    )
    args = parser.parse_args()

    stage = args.stage.strip().lower()
    tasks_dir = args.tasks_dir
    if not os.path.isdir(tasks_dir):
        raise FileNotFoundError(f"Tasks directory not found: {tasks_dir}")

    task_files = [
        os.path.join(tasks_dir, name)
        for name in sorted(os.listdir(tasks_dir))
        if name.endswith(".md")
    ]
    if not task_files:
        raise FileNotFoundError(f"No task files found in {tasks_dir}")

    summaries = []
    for task_file in task_files:
        task_id = _task_id(task_file)

        det_json = os.path.join("experiments", "routing", f"router-output-{task_id}.json")
        det_log = os.path.join("experiments", "routing", f"decision-log-{task_id}.md")
        sem_json = os.path.join("experiments", "routing", f"router-output-{task_id}-semantic.json")
        sem_log = os.path.join("experiments", "routing", f"decision-log-{task_id}-semantic.md")

        det_cmd = [
            sys.executable,
            os.path.join("scripts", "route_experience_units.py"),
            "--task-file",
            task_file,
            "--stage",
            stage,
            "--output-json",
            det_json,
            "--output-log",
            det_log,
        ]
        sem_cmd = [
            sys.executable,
            os.path.join("scripts", "route_experience_units_semantic.py"),
            "--task-file",
            task_file,
            "--stage",
            stage,
            "--output-json",
            sem_json,
            "--output-log",
            sem_log,
        ]

        _run_router(det_cmd)
        _run_router(sem_cmd)

        det_data = _read_json(det_json)
        sem_data = _read_json(sem_json)

        summaries.append(
            {
                "task_id": task_id,
                "budget": det_data.get("budget"),
                "det_count": len(det_data.get("selected", [])),
                "sem_count": len(sem_data.get("selected", [])),
                "dense_status": sem_data.get("dense_status", "unknown"),
            }
        )

    print("\nBatch summary")
    print("task_id | budget | det_count | sem_count | dense_status")
    for item in summaries:
        print(
            f"{item['task_id']} | {item['budget']} | {item['det_count']} | {item['sem_count']} | {item['dense_status']}"
        )


if __name__ == "__main__":
    main()
