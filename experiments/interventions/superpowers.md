# Superpowers group intervention (v2)

**Intervention:** enable the **Superpowers** Cursor plugin with **all bundled skills available** to the agent.

## Frozen activation

1. Confirm Superpowers plugin is installed and enabled in Cursor.
2. Do **not** disable or restrict individual Superpowers skills for this run — treat this arm as **full generic agent workflow** (TDD, debugging, brainstorming, verification-before-completion, etc.).
3. Use the same frozen requirement text from the task file referenced by `base_requirement_path`.
4. Do **not** attach `frontend-productization` Skill or `experiments/full-prompt-checklist.md`.

## Validation contract (Protocol v2 — all groups equally)

Also attach:

`experiments/tasks/VALIDATION-CONTRACT.md`

- Use every listed `data-testid` exactly.
- Implement the listed API paths and JSON shapes.
- Do **not** add Playwright specs or validation files to `output/`.

## Fairness constraints (protocol v2 §3)

- Same bash / npm / test / browser tool permissions as other groups.
- Do **not** rely on pre-written Playwright/Cypress tests that other groups did not receive; validation scripts are applied **after** generation by operator C only.
- Record approximate `context_length_estimate` and wall-clock `duration_minutes` in the run log.

## Purpose

Strong **general-purpose agent** baseline — not a strawman. If experience-skill beats superpowers on **both** validation and rubric endpoints, the domain routing claim is stronger.

**Sign-off:** pending project owner approval before first v2 run.
