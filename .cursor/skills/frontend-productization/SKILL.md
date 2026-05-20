---
name: frontend-productization
description: >-
  Cursor entrypoint: routed 3-5 experience units for frontend productization (P4 experiment).
  Canonical instructions and JSON index live under frontend-productization/ at repo root.
---

# frontend-productization (Cursor project skill)

Follow the **canonical** skill spec and assets in the workspace:

1. Read `frontend-productization/SKILL.md` (routing, limits, stage templates).
2. Read `frontend-productization/experience-index.json` for ids, triggers, and evidence paths.
3. Open only the **selected** files under `frontend-productization/experiences/` (never load all units in one prompt).

Evidence files resolve from `frontend-productization/experiences/` via paths such as `../../evidence/<project>/...` to the repo `evidence/` tree.
