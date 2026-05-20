import argparse
import csv
import json
import os


def _load_labels(label_path: str):
    labels = {}
    with open(label_path, "r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            key = (row["task_id"], row["stage"], row["unit_id"])
            labels[key] = int(row["relevance_label"])
    return labels


def _score_for_run(run_path: str, labels: dict):
    with open(run_path, "r", encoding="utf-8") as handle:
        data = json.load(handle)

    task_id = data["task_id"]
    stage = data["stage"]
    selected = data.get("selected", [])
    selected_sorted = sorted(selected, key=lambda item: (-item["score"], item["unit_id"]))

    topk = selected_sorted[:5]
    denom = max(1, len(topk))

    relevant = 0
    must_hit = 0
    must_total = 0

    for unit in selected_sorted:
        label = labels.get((task_id, stage, unit["unit_id"]), 0)
        if label == 3:
            must_hit += 1

    for unit in topk:
        label = labels.get((task_id, stage, unit["unit_id"]), 0)
        if label >= 2:
            relevant += 1

    for key, label in labels.items():
        if key[0] == task_id and key[1] == stage and label == 3:
            must_total += 1

    precision = relevant / denom if denom else 0.0
    recall = must_hit / must_total if must_total else 0.0

    return {
        "task_id": task_id,
        "stage": stage,
        "precision_at_5": f"{precision:.3f}",
        "recall": f"{recall:.3f}",
        "must_hit": must_hit,
        "must_total": must_total,
        "selected_count": len(selected_sorted),
        "run_file": os.path.basename(run_path),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate routing metrics.")
    parser.add_argument(
        "--labels",
        default=os.path.join("experiments", "routing", "relevance-labels.csv"),
        help="Path to relevance labels CSV.",
    )
    parser.add_argument(
        "--router-dir",
        default=os.path.join("experiments", "routing", "outputs"),
        help="Directory with router output JSON files.",
    )
    parser.add_argument(
        "--output",
        default=os.path.join("experiments", "routing", "routing-metrics.csv"),
        help="Path to output metrics CSV.",
    )

    args = parser.parse_args()
    labels = _load_labels(args.labels)

    rows = []
    for name in sorted(os.listdir(args.router_dir)):
        if not name.endswith(".json"):
            continue
        run_path = os.path.join(args.router_dir, name)
        rows.append(_score_for_run(run_path, labels))

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "task_id",
                "stage",
                "precision_at_5",
                "recall",
                "must_hit",
                "must_total",
                "selected_count",
                "run_file",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {args.output}")


if __name__ == "__main__":
    main()
