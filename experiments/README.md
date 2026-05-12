# Experiments workspace

P4 and P5 are **human-controlled** per `experiment-protocol.md`.

Agents may add templates and scripts; batch execution, retries, anonymization, scoring, and conclusions require explicit human approval.

## P4 layout (frozen)

| Path | Purpose |
| --- | --- |
| `tasks/*.md` | Identical base requirements for each task. |
| `interventions/*.md` | Group-specific instructions only (Baseline / Skill / Full Prompt). |
| `full-prompt-checklist.md` | Full Prompt arm text (do not edit mid-batch). |
| `randomization-table-27.csv` | Recommended schedule: 3 tasks × 3 groups × 3 reps (seed `20260512`). |
| `randomization-table-mvp-18.csv` | MVP schedule: Baseline + Experience Skill only (seed `20260513`). |
| `run-log.csv` | Append-only ledger; one row per run with protocol §8 fields. |
| `runs/` | Raw outputs per `planned_run_dir` in the randomization CSV. |
| `anonymous-submissions/` | Blind copies for scoring. |
| `templates/` | `run-metadata.template.json`, `AUTO_CHECKS.md`. |

## Scripts (repo root)

```bash
python3 scripts/validate_frontend_productization_skill.py
python3 scripts/generate_p4_randomization.py --seed 20260512
```

## Cursor Skill

Project skill entrypoint: `.cursor/skills/frontend-productization/SKILL.md` (points at `frontend-productization/`). Validate assets before P4 batch runs.
