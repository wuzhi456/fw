import argparse
import json
import os
import re
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
    matched_terms: List[str]
    failure_mode: str


def _tokenize_id(unit_id: str) -> Set[str]:
    return {token for token in unit_id.split("-") if token}


def _normalize_text(text: str) -> str:
    return " ".join(text.lower().split())


def _tokenize_words(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


def _negation_mask(words: List[str]) -> List[bool]:
    negators = {
        "no",
        "not",
        "never",
        "without",
        "avoid",
        "disable",
        "disabled",
        "skip",
        "omit",
        "exclude",
        "dont",
    }
    mask = [False] * len(words)
    for idx, word in enumerate(words):
        if word in negators:
            for next_idx in range(idx + 1, min(idx + 5, len(words))):
                mask[next_idx] = True
    return mask


def _phrase_words(phrase: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", phrase.lower())


def _phrase_matches(words: List[str], phrase_words: List[str]) -> List[int]:
    if not phrase_words or len(phrase_words) > len(words):
        return []
    matches = []
    for idx in range(0, len(words) - len(phrase_words) + 1):
        if words[idx : idx + len(phrase_words)] == phrase_words:
            matches.append(idx)
    return matches


def _extract_cues(text: str, units: List[Dict]) -> Tuple[Set[str], Set[str], Dict[str, List[str]], Set[str]]:
    words = _tokenize_words(text)
    negation_mask = _negation_mask(words)

    cue_tokens: Set[str] = set()
    risk_classes: Set[str] = set()
    matched: Dict[str, List[str]] = {}
    suppressed: Set[str] = set()

    for unit in units:
        unit_id = unit.get("id", "")
        tags = unit.get("tags", [])
        triggers = unit.get("triggers", [])
        unit_matches: List[str] = []

        for tag in tags:
            tag_words = _phrase_words(tag)
            matches = _phrase_matches(words, tag_words)
            if not matches:
                continue
            if any(negation_mask[idx] for idx in matches):
                suppressed.add(tag)
                continue
            unit_matches.append(f"tag:{tag}")
            cue_tokens.add(tag)

        for trigger in triggers:
            trigger_words = _phrase_words(trigger)
            matches = _phrase_matches(words, trigger_words)
            if not matches:
                continue
            if any(negation_mask[idx] for idx in matches):
                suppressed.add(trigger)
                continue
            unit_matches.append(f"trigger:{trigger}")

        if unit_matches:
            matched[unit_id] = unit_matches
            unit_risk = _primary_risk_class(unit)
            if unit_risk:
                risk_classes.add(unit_risk)

    return cue_tokens, risk_classes, matched, suppressed


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


def _score_unit(
    unit: Dict,
    cue_tokens: Set[str],
    risk_classes: Set[str],
    stage: str,
    unit_matches: Dict[str, List[str]],
) -> Tuple[float, int, int, int, float, List[str], List[str]]:
    tags = set(unit.get("tags", []))
    unit_tokens = tags | _tokenize_id(unit.get("id", ""))

    matched_terms = unit_matches.get(unit.get("id", ""), [])
    matched_tags = sorted(tag.split(":", 1)[1] for tag in matched_terms if tag.startswith("tag:"))
    trigger_hits = sorted(set(matched_tags + list(unit_tokens.intersection(cue_tokens))))
    trigger_match = len(matched_terms) or len(trigger_hits)

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

    return score, trigger_match, risk_match, stage_match, confidence_weight, trigger_hits, matched_terms


BASE_BUDGET = 2


def _compute_budget(words: List[str], risk_classes: Set[str], cue_tokens: Set[str]) -> int:
    length_score = min(len(words) / 120.0, 2.0)
    risk_score = len(risk_classes) * 0.7
    cue_score = len(cue_tokens) * 0.15
    raw = length_score + risk_score + cue_score

    if raw < 0.7:
        budget = 0
    elif raw < 1.4:
        budget = 2
    elif raw < 2.2:
        budget = 3
    elif raw < 3.0:
        budget = 4
    elif raw < 3.8:
        budget = 5
    elif raw < 4.6:
        budget = 6
    elif raw < 5.4:
        budget = 7
    else:
        budget = 8

    if words:
        return max(BASE_BUDGET, budget)
    return BASE_BUDGET


def _select_mandatory(
    units: List[Dict],
    cue_tokens: Set[str],
    risk_classes: Set[str],
    stage: str,
    unit_matches: Dict[str, List[str]],
    budget: int,
) -> List[RouteResult]:
    candidates = []
    for unit in units:
        score, trigger_match, risk_match, stage_match, confidence_weight, trigger_hits, matched_terms = _score_unit(
            unit, cue_tokens, risk_classes, stage, unit_matches
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
                    matched_terms=matched_terms,
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

    max_mandatory = min(2, budget)
    return candidates[:max_mandatory]


def _select_contextual(
    units: List[Dict],
    cue_tokens: Set[str],
    risk_classes: Set[str],
    stage: str,
    unit_matches: Dict[str, List[str]],
    exclude_ids: Set[str],
    budget: int,
) -> List[RouteResult]:
    candidates = []
    for unit in units:
        if unit["id"] in exclude_ids:
            continue
        score, trigger_match, risk_match, stage_match, confidence_weight, trigger_hits, matched_terms = _score_unit(
            unit, cue_tokens, risk_classes, stage, unit_matches
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
                matched_terms=matched_terms,
                failure_mode=_failure_mode_by_unit(unit["id"]),
            )
        )

    candidates.sort(key=lambda item: (-item.score, -item.trigger_match, item.unit_id))
    return candidates[:max(0, budget)]


def _score_all(
    units: List[Dict],
    cue_tokens: Set[str],
    risk_classes: Set[str],
    stage: str,
    unit_matches: Dict[str, List[str]],
) -> List[RouteResult]:
    candidates = []
    for unit in units:
        score, trigger_match, risk_match, stage_match, confidence_weight, trigger_hits, matched_terms = _score_unit(
            unit, cue_tokens, risk_classes, stage, unit_matches
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
                matched_terms=matched_terms,
                failure_mode=_failure_mode_by_unit(unit["id"]),
            )
        )
    candidates.sort(key=lambda item: (-item.score, -item.trigger_match, item.unit_id))
    return candidates


def _format_log(
    task_id: str,
    stage: str,
    task_file: str,
    cue_tokens: Set[str],
    budget: int,
    suppressed_terms: Set[str],
    selected: List[RouteResult],
    near_misses: List[RouteResult],
) -> str:
    lines = [
        "# Router Decision Log",
        "",
        "## Task",
        f"- Task id: {task_id}",
        f"- Stage: {stage}",
        f"- Task file: {task_file}",
        f"- Budget: {budget}",
        "",
        "## Task Cues",
        f"- Cues: {', '.join(sorted(cue_tokens))}",
        f"- Negation suppressed: {', '.join(sorted(suppressed_terms)) or 'none'}",
        "",
        "## Selected EUs",
    ]

    for item in selected:
        lines.append(f"- {item.unit_id} | Channel: {item.channel} | Score: {item.score:.2f}")
        lines.append(f"  - Why selected? matched cues: {', '.join(item.matched_cues) or 'none'}")
        lines.append(f"  - Match sources: {', '.join(item.matched_terms) or 'none'}")
        lines.append(f"  - What failure mode it prevents? {item.failure_mode}")

    lines.extend(["", "## Near Misses"])
    for item in near_misses:
        lines.append(f"- {item.unit_id} | Score: {item.score:.2f}")
        lines.append("  - Why excluded? budget full or lower score")

    return "\n".join(lines) + "\n"


def _load_router_rules(path: str) -> Dict[str, Dict[str, List[str]]]:
    if not os.path.exists(path):
        return {"requires": {}, "excludes": {}}
    data = json.loads(_read_text(path))
    return {
        "requires": data.get("requires", {}),
        "excludes": data.get("excludes", {}),
    }


def _apply_rules(
    selected: List[RouteResult],
    scored_all: List[RouteResult],
    rules: Dict[str, Dict[str, List[str]]],
    budget: int,
) -> List[RouteResult]:
    by_id = {item.unit_id: item for item in selected}
    scored_map = {item.unit_id: item for item in scored_all}

    for unit_id, required_ids in rules.get("requires", {}).items():
        if unit_id not in by_id:
            continue
        for required_id in required_ids:
            if required_id in by_id:
                continue
            if required_id in scored_map:
                required_item = scored_map[required_id]
                by_id[required_id] = RouteResult(
                    unit_id=required_item.unit_id,
                    title=required_item.title,
                    channel="R",
                    score=required_item.score,
                    trigger_match=required_item.trigger_match,
                    risk_match=required_item.risk_match,
                    stage_match=required_item.stage_match,
                    confidence_weight=required_item.confidence_weight,
                    risk_severity=required_item.risk_severity,
                    matched_cues=required_item.matched_cues,
                    matched_terms=required_item.matched_terms,
                    failure_mode=required_item.failure_mode,
                )

    for unit_id, excluded_ids in rules.get("excludes", {}).items():
        if unit_id not in by_id:
            continue
        for excluded_id in excluded_ids:
            if excluded_id not in by_id:
                continue
            keep_id = unit_id
            drop_id = excluded_id
            if by_id[excluded_id].score > by_id[unit_id].score:
                keep_id, drop_id = excluded_id, unit_id
            if drop_id in by_id:
                del by_id[drop_id]

    channel_priority = {"A": 0, "R": 1, "B": 2}
    ordered = sorted(
        by_id.values(),
        key=lambda item: (channel_priority.get(item.channel, 9), -item.score, item.unit_id),
    )

    if budget <= 0:
        return []

    return ordered[:budget]


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
        "--rules-file",
        default=os.path.join("frontend-productization", "router-rules.json"),
        help="Path to router-rules.json.",
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

    cue_tokens, risk_classes, unit_matches, suppressed_terms = _extract_cues(task_text, units)
    words = _tokenize_words(task_text)
    budget = _compute_budget(words, risk_classes, cue_tokens)
    rules = _load_router_rules(args.rules_file)

    mandatory = _select_mandatory(units, cue_tokens, risk_classes, stage, unit_matches, budget)
    mandatory_ids = {item.unit_id for item in mandatory}
    remaining_budget = max(0, budget - len(mandatory))
    contextual = _select_contextual(
        units, cue_tokens, risk_classes, stage, unit_matches, mandatory_ids, remaining_budget
    )

    selected = mandatory + contextual

    scored_all = _score_all(units, cue_tokens, risk_classes, stage, unit_matches)
    selected = _apply_rules(selected, scored_all, rules, budget)

    selected_ids = {item.unit_id for item in selected}
    near_misses = [item for item in scored_all if item.unit_id not in selected_ids][:3]

    task_id = os.path.splitext(os.path.basename(args.task_file))[0]

    result = {
        "task_id": task_id,
        "stage": stage,
        "task_file": args.task_file,
        "cue_tokens": sorted(cue_tokens),
        "budget": budget,
        "negation_suppressed": sorted(suppressed_terms),
        "selected": [item.__dict__ for item in selected],
        "near_misses": [item.__dict__ for item in near_misses],
    }

    os.makedirs(os.path.dirname(args.output_json), exist_ok=True)
    with open(args.output_json, "w", encoding="utf-8") as handle:
        json.dump(result, handle, ensure_ascii=False, indent=2)

    log_text = _format_log(
        task_id,
        stage,
        args.task_file,
        cue_tokens,
        budget,
        suppressed_terms,
        selected,
        near_misses,
    )
    with open(args.output_log, "w", encoding="utf-8") as handle:
        handle.write(log_text)

    print(f"Task: {task_id} | Stage: {stage}")
    print(f"Cues: {', '.join(sorted(cue_tokens)) or 'none'}")
    print("Selected: " + ", ".join([item.unit_id for item in selected]))
    print(f"Output JSON: {args.output_json}")
    print(f"Decision log: {args.output_log}")


if __name__ == "__main__":
    main()
