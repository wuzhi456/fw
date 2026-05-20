import csv
import json
import os


TASK_LABELS = {
    "task-async-form": {
        "form-duplicate-submit-guard": (3, "Form submit must prevent duplicates."),
        "form-async-validation-feedback": (3, "Async validation is explicitly required."),
        "form-submit-recovery": (3, "Remote submit should preserve input on failure."),
        "async-explicit-states": (2, "Remote API implies loading/error/empty states."),
        "async-retry-recover": (2, "Recoverable API errors should allow retry."),
        "async-stale-cancel": (1, "Async validation can return stale responses."),
        "state-stale-response-guard": (1, "Async checks can arrive out of order."),
        "ux-empty-state-actionable": (1, "Form errors should guide next steps."),
        "ux-fallback-recoverable-errors": (1, "Recoverable errors may use non-blocking feedback."),
    },
    "task-list-page": {
        "async-explicit-states": (3, "Remote list data needs loading/error/empty states."),
        "list-pagination-server": (3, "List implies server pagination for scale."),
        "state-stale-response-guard": (3, "Search/filter changes can race responses."),
        "async-stale-cancel": (2, "Search/filter changes can trigger stale requests."),
        "async-retry-recover": (2, "List fetch failures should be recoverable."),
        "ux-empty-state-actionable": (2, "Search/filter may yield empty results."),
        "list-virtualize-window": (1, "Large lists might need virtualization."),
        "list-incremental-prefetch": (1, "Infinite loading may be a secondary option."),
        "responsive-long-text-overflow": (1, "Tables may contain long identifiers."),
    },
    "task-responsive-dashboard": {
        "responsive-dense-dashboard-layout": (3, "Dashboard layout density is core requirement."),
        "async-explicit-states": (3, "Metrics summary implies remote data loading."),
        "state-cache-invalidation": (2, "Dashboard cards can share cached queries."),
        "ux-error-boundary-granularity": (2, "Multi-module UI benefits from error isolation."),
        "responsive-long-text-overflow": (1, "Metric labels can be long."),
        "responsive-mobile-navigation-density": (1, "Narrow layouts may need navigation adjustments."),
        "async-retry-recover": (1, "Metrics fetch can fail and need retry."),
    },
}

STAGES = ["plan", "coding"]


def main() -> None:
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    index_path = os.path.join(repo_root, "frontend-productization", "experience-index.json")
    output_path = os.path.join(repo_root, "experiments", "routing", "relevance-labels.csv")

    with open(index_path, "r", encoding="utf-8") as handle:
        index = json.load(handle)

    units = [unit["id"] for unit in index.get("units", [])]

    rows = []
    for task_id, label_map in TASK_LABELS.items():
        for stage in STAGES:
            for unit_id in units:
                label, reason = label_map.get(unit_id, (0, "Not implied by task scope."))
                rows.append(
                    {
                        "task_id": task_id,
                        "stage": stage,
                        "unit_id": unit_id,
                        "relevance_label": label,
                        "reason": f"{reason} stage={stage}.",
                    }
                )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["task_id", "stage", "unit_id", "relevance_label", "reason"],
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {output_path}")


if __name__ == "__main__":
    main()
