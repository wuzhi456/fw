import argparse
import json
import os
import sys
from typing import Dict, List, Tuple

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import route_experience_units as router


def _tokenize(text: str) -> List[str]:
    return router._tokenize_words(text)


def _build_doc_text(unit: Dict) -> str:
    parts = [
        unit.get("id", ""),
        unit.get("title", ""),
        " ".join(unit.get("tags", [])),
        " ".join(unit.get("triggers", [])),
        router._failure_mode_by_unit(unit.get("id", "")),
    ]
    return " ".join(part for part in parts if part).lower()


def _bm25_scores(docs: List[List[str]], query: List[str], k1: float, b: float) -> List[float]:
    avgdl = sum(len(doc) for doc in docs) / max(1, len(docs))
    doc_freq: Dict[str, int] = {}
    for doc in docs:
        for term in set(doc):
            doc_freq[term] = doc_freq.get(term, 0) + 1

    scores = []
    for doc in docs:
        doc_len = len(doc)
        term_counts: Dict[str, int] = {}
        for term in doc:
            term_counts[term] = term_counts.get(term, 0) + 1

        score = 0.0
        for term in query:
            if term not in term_counts:
                continue
            df = doc_freq.get(term, 0)
            idf = 0.0
            if df:
                idf = max(0.0, (len(docs) - df + 0.5) / (df + 0.5))
            tf = term_counts[term]
            denom = tf + k1 * (1 - b + b * (doc_len / max(avgdl, 1.0)))
            score += idf * (tf * (k1 + 1)) / max(denom, 1e-6)
        scores.append(score)
    return scores


def _dot(a: List[float], b: List[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def _load_dense_index(path: str) -> Tuple[Dict[str, List[float]], Dict[str, List[float]], str]:
    if not os.path.exists(path):
        return {}, {}, "dense_index_missing"
    with open(path, "r", encoding="utf-8") as handle:
        data = json.load(handle)

    unit_map = {item["id"]: item["vector"] for item in data.get("units", [])}
    task_map = {item["task_id"]: item["vector"] for item in data.get("tasks", [])}
    return unit_map, task_map, "ok"


def _normalize_scores(scores: List[float]) -> List[float]:
    if not scores:
        return []
    min_score = min(scores)
    max_score = max(scores)
    if max_score - min_score < 1e-6:
        return [0.0 for _ in scores]
    return [(score - min_score) / (max_score - min_score) for score in scores]


def main() -> None:
    parser = argparse.ArgumentParser(description="Hybrid (BM25 + dense) router for experience units.")
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
        default=os.path.join("experiments", "routing", "router-output-semantic.json"),
        help="Path to output JSON file.",
    )
    parser.add_argument(
        "--output-log",
        default=os.path.join("experiments", "routing", "router-decision-log-semantic.md"),
        help="Path to output decision log markdown.",
    )
    parser.add_argument("--alpha", type=float, default=0.6, help="Dense weight for hybrid score.")
    parser.add_argument("--bm25-k1", type=float, default=1.5, help="BM25 k1 parameter.")
    parser.add_argument("--bm25-b", type=float, default=0.75, help="BM25 b parameter.")
    parser.add_argument(
        "--dense-index",
        default=os.path.join("frontend-productization", "dense-index.json"),
        help="Path to offline dense index JSON.",
    )
    parser.add_argument(
        "--dense-min-score",
        type=float,
        default=0.25,
        help="Minimum cosine score to keep dense signal.",
    )

    args = parser.parse_args()
    stage = args.stage.strip().lower()
    if stage not in router.STAGE_KEYS:
        raise ValueError(f"Unsupported stage: {args.stage}")

    task_text = router._normalize_text(router._read_text(args.task_file))
    index = json.loads(router._read_text(args.index_file))
    units = index.get("units", [])

    cue_tokens, risk_classes, unit_matches, suppressed_terms = router._extract_cues(task_text, units)
    words = router._tokenize_words(task_text)
    budget = router._compute_budget(words, risk_classes, cue_tokens)
    rules = router._load_router_rules(args.rules_file)

    doc_texts = [_build_doc_text(unit) for unit in units]
    doc_tokens = [_tokenize(text) for text in doc_texts]
    query_tokens = _tokenize(task_text)

    bm25_scores = _bm25_scores(doc_tokens, query_tokens, args.bm25_k1, args.bm25_b)
    unit_vectors, task_vectors, dense_status = _load_dense_index(args.dense_index)
    task_id = os.path.splitext(os.path.basename(args.task_file))[0]
    task_vector = task_vectors.get(task_id)
    dense_scores: List[float] = []
    if dense_status == "ok" and task_vector:
        for unit in units:
            unit_vector = unit_vectors.get(unit.get("id", ""))
            if not unit_vector:
                dense_scores.append(0.0)
                continue
            dense_scores.append(_dot(unit_vector, task_vector))
    else:
        if dense_status == "ok":
            dense_status = "task_embedding_missing"
        dense_scores = [0.0 for _ in units]

    dense_scores = _normalize_scores(dense_scores) if dense_scores else [0.0 for _ in units]
    bm25_scores = _normalize_scores(bm25_scores)

    scored_all: List[router.RouteResult] = []
    for unit, bm25_score, dense_score in zip(units, bm25_scores, dense_scores):
        unit_id = unit.get("id", "")
        unit_risk = router._primary_risk_class(unit)
        risk_match = 1 if unit_risk and unit_risk in risk_classes else 0
        stage_match = 1 if unit.get("stage_fit", {}).get(stage, 0) else 0
        confidence_weight = router.CONFIDENCE_WEIGHT.get(unit.get("evidence_confidence", "medium"), 0.7)

        if dense_score < args.dense_min_score:
            dense_score = 0.0

        hybrid = args.alpha * dense_score + (1 - args.alpha) * bm25_score
        score = 0.55 * hybrid + 0.20 * stage_match + 0.15 * risk_match + 0.10 * confidence_weight

        matched_terms = unit_matches.get(unit_id, [])
        matched_tags = [term.split(":", 1)[1] for term in matched_terms if term.startswith("tag:")]
        trigger_hits = sorted(set(matched_tags))
        trigger_match = len(matched_terms)

        scored_all.append(
            router.RouteResult(
                unit_id=unit_id,
                title=unit.get("title", ""),
                channel="B",
                score=score,
                trigger_match=trigger_match,
                risk_match=risk_match,
                stage_match=stage_match,
                confidence_weight=confidence_weight,
                risk_severity=unit.get("risk_severity", "medium"),
                matched_cues=trigger_hits,
                matched_terms=matched_terms,
                failure_mode=router._failure_mode_by_unit(unit_id),
            )
        )

    scored_all.sort(key=lambda item: (-item.score, -item.trigger_match, item.unit_id))

    mandatory = [
        item
        for item in scored_all
        if (item.risk_match and item.trigger_match >= 1) or (item.risk_severity == "high" and item.stage_match)
    ][: min(2, budget)]

    mandatory_ids = {item.unit_id for item in mandatory}
    remaining_budget = max(0, budget - len(mandatory))
    contextual = [item for item in scored_all if item.unit_id not in mandatory_ids][:remaining_budget]

    selected = router._apply_rules(mandatory + contextual, scored_all, rules, budget)

    selected_ids = {item.unit_id for item in selected}
    near_misses = [item for item in scored_all if item.unit_id not in selected_ids][:3]

    result = {
        "task_id": task_id,
        "stage": stage,
        "task_file": args.task_file,
        "cue_tokens": sorted(cue_tokens),
        "budget": budget,
        "negation_suppressed": sorted(suppressed_terms),
        "dense_status": dense_status,
        "selected": [item.__dict__ for item in selected],
        "near_misses": [item.__dict__ for item in near_misses],
    }

    os.makedirs(os.path.dirname(args.output_json), exist_ok=True)
    with open(args.output_json, "w", encoding="utf-8") as handle:
        json.dump(result, handle, ensure_ascii=False, indent=2)

    log_text = router._format_log(
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
    print(f"Dense status: {dense_status}")
    print("Selected: " + ", ".join([item.unit_id for item in selected]))
    print(f"Output JSON: {args.output_json}")
    print(f"Decision log: {args.output_log}")


if __name__ == "__main__":
    main()
