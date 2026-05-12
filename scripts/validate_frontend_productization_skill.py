#!/usr/bin/env python3
"""Validate frontend-productization Skill assets: index JSON, experience files, evidence links."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = REPO_ROOT / "frontend-productization" / "experience-index.json"
EXP_DIR = REPO_ROOT / "frontend-productization" / "experiences"


def _id_from_experience_md(text: str) -> str | None:
    m = re.search(r"^id:\s*(\S+)\s*$", text, re.MULTILINE)
    return m.group(1) if m else None


def main() -> int:
    errors: list[str] = []

    if not INDEX_PATH.is_file():
        print(f"ERROR: missing {INDEX_PATH}", file=sys.stderr)
        return 1

    data = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    units = data.get("units")
    if not isinstance(units, list):
        errors.append("'units' must be a list")
        print("\n".join(errors), file=sys.stderr)
        return 1

    for u in units:
        uid = u.get("id")
        if not uid:
            errors.append("unit missing id")
            continue

        exp_path = EXP_DIR / f"{uid}.md"
        if not exp_path.is_file():
            errors.append(f"unit {uid}: missing experience file {exp_path.relative_to(REPO_ROOT)}")
            continue

        body = exp_path.read_text(encoding="utf-8")
        fm_id = _id_from_experience_md(body)
        if fm_id != uid:
            errors.append(f"unit {uid}: front matter id mismatch (found {fm_id!r})")

        for rel in u.get("evidence_paths") or []:
            if not isinstance(rel, str):
                errors.append(f"unit {uid}: non-string evidence path")
                continue
            ev = (EXP_DIR / rel).resolve()
            try:
                ev.relative_to(REPO_ROOT)
            except ValueError:
                errors.append(f"unit {uid}: evidence path escapes repo: {rel}")
                continue
            if not ev.is_file():
                errors.append(
                    f"unit {uid}: missing evidence file {ev.relative_to(REPO_ROOT)} (from {rel})"
                )

    if errors:
        print("frontend-productization skill validation FAILED:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    print(f"OK: {len(units)} units; experience-index.json and evidence paths resolve.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
