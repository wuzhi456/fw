#!/usr/bin/env python3
"""Generate frozen P4 execution order CSVs (protocol §7). Reproducible seed."""

from __future__ import annotations

import argparse
import csv
import random
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
OUT_27 = REPO_ROOT / "experiments" / "randomization-table-27.csv"
OUT_18 = REPO_ROOT / "experiments" / "randomization-table-mvp-18.csv"

TASKS = [
    "task-list-page",
    "task-async-form",
    "task-responsive-dashboard",
]
GROUPS_3 = ["baseline", "experience-skill", "full-prompt"]
GROUPS_2 = ["baseline", "experience-skill"]


def slots_for_task(groups: list[str], replicates: int) -> list[tuple[str, int]]:
    out: list[tuple[str, int]] = []
    for g in groups:
        for r in range(1, replicates + 1):
            out.append((g, r))
    return out


def shuffle_task_blocks(
    rng: random.Random,
    groups: list[str],
    replicates: int,
) -> list[tuple[str, str, int]]:
    rows: list[tuple[str, str, int]] = []
    for task in TASKS:
        slot = slots_for_task(groups, replicates)
        rng.shuffle(slot)
        for g, r in slot:
            rows.append((task, g, r))
    return rows


def write_csv(path: Path, rows: list[tuple[int, str, str, int, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(
            [
                "execution_order",
                "task_id",
                "group",
                "replicate",
                "planned_run_dir",
            ]
        )
        for execution_order, task_id, group, replicate, planned in rows:
            w.writerow([execution_order, task_id, group, replicate, planned])


def build_rows(
    rng: random.Random,
    groups: list[str],
    replicates: int,
) -> list[tuple[int, str, str, int, str]]:
    triples = shuffle_task_blocks(rng, groups, replicates)
    out: list[tuple[int, str, str, int, str]] = []
    for i, (task_id, group, replicate) in enumerate(triples, start=1):
        planned = f"runs/{task_id}/{group}/rep-{replicate:02d}/"
        out.append((i, task_id, group, replicate, planned))
    return out


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--seed", type=int, default=20260512, help="RNG seed (frozen for batch)")
    args = p.parse_args()
    rng = random.Random(args.seed)

    rows27 = build_rows(rng, GROUPS_3, 3)
    rng18 = random.Random(args.seed + 1)
    rows18 = build_rows(rng18, GROUPS_2, 3)

    write_csv(OUT_27, rows27)
    write_csv(OUT_18, rows18)
    print(f"Wrote {OUT_27.relative_to(REPO_ROOT)} ({len(rows27)} rows)")
    print(f"Wrote {OUT_18.relative_to(REPO_ROOT)} ({len(rows18)} rows)")


if __name__ == "__main__":
    main()
