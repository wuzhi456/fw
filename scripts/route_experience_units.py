import argparse
import json
import os
from dataclasses import dataclass
from typing import Dict, List, Set, Tuple


CONFIDENCE_WEIGHT = {
    "high": 1.0,
    "medium": 0.7,
    "low": 0.4,
}

STAGE_KEYS = {"plan", "coding", "review", "test"}


def _read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as handle:
        return handle.read()


@dataclass
class RouteResult:
    unit_id: str
    title: str
    channel: str
    score: float
    trigger_match: int
    risk_match: int
    stage_match: int
    confidence_weight: float
    risk_severity: str
    matched_cues: List[str]
    failure_mode: str


def _tokenize_id(unit_id: str) -> Set[str]:
    return {token for token in unit_id.split("-") if token}


def _normalize_text(text: str) -> str:
    return " ".join(text.lower().split())


def _extract_cues(text: str) -> Tuple[Set[str], Set[str], Dict[str, List[str]]]:
    cue_definitions = {
        "async": [
            "async",
            "asynchronous",
            "request",
            "remote api",
            "api",
            "server",
            "backend",
            "network",
            "fetch",
            "load",
            "loading",
            "retry",
            "sync",
            "synchronize",
            "refresh",
        ],
        "form": [
            "form",
            "submit",
            "validation",
            "field",
            "input",
            "checkout",
            "payment",
            "billing",
            "address",
            "login",
            "signup",
            "register",
            "profile",
            "edit",
            "create",
            "update",
            "upload",
            "apply",
            "promo code",
            "coupon",
            "verify",
        ],
        "list": [
            "list",
            "table",
            "rows",
            "filter",
            "search",
            "pagination",
            "catalog",
            "grid",
            "cards",
            "gallery",
            "results",
            "items",
            "summary",
        ],
        "state": [
            "cache",
            "stale",
            "race",
            "optimistic",
            "invalidate",
            "consistency",
            "rollback",
        ],
        "ux": [
            "empty",
            "error",
            "fallback",
            "toast",
            "boundary",
            "disabled",
            "pending",
            "success",
            "failure",
        ],
        "responsive": [
            "responsive",
            "mobile",
            "tablet",
            "laptop",
            "dashboard",
            "grid",
            "layout",
            "compact",
            "dense",
            "overflow",
        ],
    }

    async_hard_cues = {
        "async",
        "asynchronous",
        "request",
        "remote api",
        "api",
        "server",
        "backend",
        "network",
        "fetch",
        "load",
        "loading",
        "retry",
    }

    cue_tokens = set()
    risk_classes = set()
    matched = {}

    for label, patterns in cue_definitions.items():
        hits = [pattern for pattern in patterns if pattern in text]
        if hits:
            cue_tokens.add(label)
            matched[label] = hits
            if label != "async":
                risk_classes.add(label)

    async_hits = set(matched.get("async", []))
    if async_hits.intersection(async_hard_cues):
        risk_classes.add("async")

    expanded_tokens = set(cue_tokens)
    if "search" in text or "filter" in text:
        expanded_tokens.update({"list", "search", "filter"})
    if "dashboard" in text:
        expanded_tokens.update({"dashboard", "responsive"})
    if "submit" in text or "validation" in text:
        expanded_tokens.update({"form", "mutation"})
    if any(token in text for token in async_hard_cues):
        expanded_tokens.update({"async", "request"})

    return expanded_tokens, risk_classes, matched


def _primary_risk_class(unit: Dict) -> str:
    unit_id = unit.get("id", "")
    tags = set(unit.get("tags", []))

    if unit_id.startswith("async"):
        return "async"
    if unit_id.startswith("list"):
        return "list"
    if unit_id.startswith("form"):
        return "form"
    if unit_id.startswith("state"):
        return "state"
    if unit_id.startswith("ux"):
        return "ux"
    if unit_id.startswith("responsive"):
        return "responsive"

    if "list" in tags or "pagination" in tags:
        return "list"
    if "form" in tags or "validation" in tags:
        return "form"
    if "state" in tags or "cache" in tags:
        return "state"
    if "ux" in tags or "error-boundary" in tags:
        return "ux"
    if "responsive" in tags or "mobile" in tags:
        return "responsive"
    if "async" in tags or "request" in tags:
        return "async"

    return ""


def _failure_mode_by_unit(unit_id: str) -> str:
    mapping = {
        "async-explicit-states": "No explicit loading/error/empty state for async data.",
        "async-stale-cancel": "Stale responses overwrite newer state during rapid changes.",
        "async-retry-recover": "Recoverable errors lack retry or fallback path.",
        "list-pagination-server": "Large lists render or fetch too much data at once.",
        "list-virtualize-window": "Long lists freeze UI without virtualization.",
        "list-incremental-prefetch": "Infinite list loads too aggressively without backpressure.",
        "form-duplicate-submit-guard": "Duplicate submits trigger repeated mutations.",
        "form-async-validation-feedback": "Async validation lacks per-field feedback and debouncing.",
        "form-submit-recovery": "Failed submit loses user input or lacks safe retry.",
        "state-optimistic-rollback": "Optimistic updates cannot rollback on failure.",
        "state-cache-invalidation": "Cache invalidation is too broad or inconsistent.",
        "state-stale-response-guard": "Responses from prior context update current state.",
        "ux-error-boundary-granularity": "Errors take down too much UI without isolation.",
        "ux-empty-state-actionable": "Empty states lack guidance for next steps.",
        "ux-fallback-recoverable-errors": "Recoverable errors are blocking or invisible.",
        "responsive-mobile-navigation-density": "Navigation density blocks mobile usability.",
        "responsive-long-text-overflow": "Long identifiers overflow layout without handling.",
        "responsive-dense-dashboard-layout": "Dense dashboard lacks responsive grid constraints.",
    }
    return mapping.get(unit_id, "Failure mode not mapped.")


def _score_unit(unit: Dict, cue_tokens: Set[str], risk_classes: Set[str], stage: str) -> Tuple[float, int, int, int, float, List[str]]:
    tags = set(unit.get("tags", []))
    unit_tokens = tags | _tokenize_id(unit.get("id", ""))

    trigger_hits = sorted(unit_tokens.intersection(cue_tokens))
    trigger_match = len(trigger_hits)

    unit_risk = _primary_risk_class(unit)
    risk_match = 1 if unit_risk and unit_risk in risk_classes else 0

    stage_match = 1 if unit.get("stage_fit", {}).get(stage, 0) else 0

    tech_stack_match = 0

    confidence_weight = CONFIDENCE_WEIGHT.get(unit.get("evidence_confidence", "medium"), 0.7)

    score = (
        0.35 * trigger_match
        + 0.25 * risk_match
        + 0.20 * stage_match
        + 0.10 * tech_stack_match
        + 0.10 * confidence_weight
    )

    return score, trigger_match, risk_match, stage_match, confidence_weight, trigger_hits


def _select_mandatory(units: List[Dict], cue_tokens: Set[str], risk_classes: Set[str], stage: str) -> List[RouteResult]:
    candidates = []
    for unit in units:
        score, trigger_match, risk_match, stage_match, confidence_weight, trigger_hits = _score_unit(
            unit, cue_tokens, risk_classes, stage
        )
        risk_severity = unit.get("risk_severity", "medium")
        unit_risk = _primary_risk_class(unit)
        hard_trigger = bool(unit_risk and unit_risk in risk_classes) and trigger_match >= 1

        if hard_trigger or trigger_match >= 2 or (risk_severity == "high" and stage_match and risk_match):
            candidates.append(
                RouteResult(
                    unit_id=unit["id"],
                    title=unit["title"],
                    channel="A",
                    score=score,
                    trigger_match=trigger_match,
                    risk_match=risk_match,
                    stage_match=stage_match,
                    confidence_weight=confidence_weight,
                    risk_severity=risk_severity,
                    matched_cues=trigger_hits,
                    failure_mode=_failure_mode_by_unit(unit["id"]),
                )
            )

    candidates.sort(
        key=lambda item: (
            0 if item.risk_severity == "high" else 1,
            -item.trigger_match,
            -item.score,
        )
    )

    return candidates[:2]


def _select_contextual(units: List[Dict], cue_tokens: Set[str], risk_classes: Set[str], stage: str, exclude_ids: Set[str]) -> List[RouteResult]:
    candidates = []
    for unit in units:
        if unit["id"] in exclude_ids:
            continue
        score, trigger_match, risk_match, stage_match, confidence_weight, trigger_hits = _score_unit(
            unit, cue_tokens, risk_classes, stage
        )
        if trigger_match == 0 and risk_match == 0:
            continue
        if risk_match == 0 and trigger_match < 2:
            continue
        candidates.append(
            RouteResult(
                unit_id=unit["id"],
                title=unit["title"],
                channel="B",
                score=score,
                trigger_match=trigger_match,
                risk_match=risk_match,
                stage_match=stage_match,
                confidence_weight=confidence_weight,
                risk_severity=unit.get("risk_severity", "medium"),
                matched_cues=trigger_hits,
                failure_mode=_failure_mode_by_unit(unit["id"]),
            )
        )

    candidates.sort(key=lambda item: (-item.score, -item.trigger_match, item.unit_id))
    return candidates[:3]


def _score_all(units: List[Dict], cue_tokens: Set[str], risk_classes: Set[str], stage: str) -> List[RouteResult]:
    candidates = []
    for unit in units:
        score, trigger_match, risk_match, stage_match, confidence_weight, trigger_hits = _score_unit(
            unit, cue_tokens, risk_classes, stage
        )
        if trigger_match == 0 and risk_match == 0:
            continue
        candidates.append(
            RouteResult(
                unit_id=unit["id"],
                title=unit["title"],
                channel="B",
                score=score,
                trigger_match=trigger_match,
                risk_match=risk_match,
                stage_match=stage_match,
                confidence_weight=confidence_weight,
                risk_severity=unit.get("risk_severity", "medium"),
                matched_cues=trigger_hits,
                failure_mode=_failure_mode_by_unit(unit["id"]),
            )
        )
    candidates.sort(key=lambda item: (-item.score, -item.trigger_match, item.unit_id))
    return candidates


def _format_log(task_id: str, stage: str, task_file: str, cue_tokens: Set[str], selected: List[RouteResult], near_misses: List[RouteResult]) -> str:
    lines = [
        "# Router Decision Log",
        "",
        "## Task",
        f"- Task id: {task_id}",
        f"- Stage: {stage}",
        f"- Task file: {task_file}",
        "",
        "## Task Cues",
        f"- Cues: {', '.join(sorted(cue_tokens))}",
        "",
        "## Selected EUs",
    ]

    for item in selected:
        lines.append(f"- {item.unit_id} | Channel: {item.channel} | Score: {item.score:.2f}")
        lines.append(f"  - Why selected? matched cues: {', '.join(item.matched_cues) or 'none'}")
        lines.append(f"  - What failure mode it prevents? {item.failure_mode}")

    lines.extend(["", "## Near Misses"])
    for item in near_misses:
        lines.append(f"- {item.unit_id} | Score: {item.score:.2f}")
        lines.append("  - Why excluded? budget full or lower score")

    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Route experience units for a task and stage.")
    parser.add_argument("--task-file", required=True, help="Path to task text file.")
    parser.add_argument("--stage", required=True, help="Stage: plan, coding, review, or test.")
    parser.add_argument(
        "--index-file",
        default=os.path.join("frontend-productization", "experience-index.json"),
        help="Path to experience-index.json.",
    )
    parser.add_argument(
        "--output-json",
        default=os.path.join("experiments", "routing", "router-output.json"),
        help="Path to output JSON file.",
    )
    parser.add_argument(
        "--output-log",
        default=os.path.join("experiments", "routing", "router-decision-log.md"),
        help="Path to output decision log markdown.",
    )

    args = parser.parse_args()
    stage = args.stage.strip().lower()
    if stage not in STAGE_KEYS:
        raise ValueError(f"Unsupported stage: {args.stage}")

    task_text = _normalize_text(_read_text(args.task_file))
    index = json.loads(_read_text(args.index_file))
    units = index.get("units", [])

    cue_tokens, risk_classes, _ = _extract_cues(task_text)

    mandatory = _select_mandatory(units, cue_tokens, risk_classes, stage)
    mandatory_ids = {item.unit_id for item in mandatory}
    contextual = _select_contextual(units, cue_tokens, risk_classes, stage, mandatory_ids)

    selected = mandatory + contextual

    scored_all = _score_all(units, cue_tokens, risk_classes, stage)

    selected_ids = {item.unit_id for item in selected}
    near_misses = [item for item in scored_all if item.unit_id not in selected_ids][:3]

    task_id = os.path.splitext(os.path.basename(args.task_file))[0]

    result = {
        "task_id": task_id,
        "stage": stage,
        "task_file": args.task_file,
        "cue_tokens": sorted(cue_tokens),
        "selected": [item.__dict__ for item in selected],
        "near_misses": [item.__dict__ for item in near_misses],
    }

    os.makedirs(os.path.dirname(args.output_json), exist_ok=True)
    with open(args.output_json, "w", encoding="utf-8") as handle:
        json.dump(result, handle, ensure_ascii=False, indent=2)

    log_text = _format_log(task_id, stage, args.task_file, cue_tokens, selected, near_misses)
    with open(args.output_log, "w", encoding="utf-8") as handle:
        handle.write(log_text)

    print(f"Task: {task_id} | Stage: {stage}")
    print(f"Cues: {', '.join(sorted(cue_tokens)) or 'none'}")
    print("Selected: " + ", ".join([item.unit_id for item in selected]))
    print(f"Output JSON: {args.output_json}")
    print(f"Decision log: {args.output_log}")


if __name__ == "__main__":
    main()
