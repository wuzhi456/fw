import argparse
import json
import os
import sys
from typing import Dict, List

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import route_experience_units as router

try:
    from sentence_transformers import SentenceTransformer
except ImportError as exc:
    raise ImportError("sentence-transformers is required to build the dense index") from exc


def _build_doc_text(unit: Dict) -> str:
    parts = [
        unit.get("id", ""),
        unit.get("title", ""),
        " ".join(unit.get("tags", [])),
        " ".join(unit.get("triggers", [])),
        router._failure_mode_by_unit(unit.get("id", "")),
    ]
    return " ".join(part for part in parts if part).lower()


def _normalize(vec: List[float]) -> List[float]:
    norm = sum(value * value for value in vec) ** 0.5
    if norm == 0:
        return vec
    return [value / norm for value in vec]


def main() -> None:
    parser = argparse.ArgumentParser(description="Build offline dense index for experience units.")
    parser.add_argument(
        "--index-file",
        default=os.path.join("frontend-productization", "experience-index.json"),
        help="Path to experience-index.json.",
    )
    parser.add_argument(
        "--tasks-dir",
        default=os.path.join("experiments", "tasks"),
        help="Directory with task files to embed.",
    )
    parser.add_argument(
        "--output",
        default=os.path.join("frontend-productization", "dense-index.json"),
        help="Path to output dense index JSON.",
    )
    parser.add_argument(
        "--model",
        default="all-MiniLM-L6-v2",
        help="SentenceTransformer model name.",
    )

    args = parser.parse_args()

    index = json.loads(router._read_text(args.index_file))
    units = index.get("units", [])

    if not os.path.isdir(args.tasks_dir):
        raise FileNotFoundError(f"Tasks directory not found: {args.tasks_dir}")

    task_files = [
        os.path.join(args.tasks_dir, name)
        for name in sorted(os.listdir(args.tasks_dir))
        if name.endswith(".md")
    ]

    model = SentenceTransformer(args.model)

    unit_texts = [_build_doc_text(unit) for unit in units]
    unit_embeddings = model.encode(unit_texts, normalize_embeddings=True)

    task_texts = [router._normalize_text(router._read_text(path)) for path in task_files]
    task_embeddings = model.encode(task_texts, normalize_embeddings=True)

    unit_rows = []
    for unit, vector in zip(units, unit_embeddings):
        unit_rows.append({
            "id": unit.get("id", ""),
            "vector": _normalize(vector.tolist()),
        })

    task_rows = []
    for path, vector in zip(task_files, task_embeddings):
        task_id = os.path.splitext(os.path.basename(path))[0]
        task_rows.append({
            "task_id": task_id,
            "vector": _normalize(vector.tolist()),
        })

    payload = {
        "version": 1,
        "model": args.model,
        "units": unit_rows,
        "tasks": task_rows,
    }

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)

    print(f"Wrote dense index with {len(unit_rows)} units and {len(task_rows)} tasks to {args.output}")


if __name__ == "__main__":
    main()
