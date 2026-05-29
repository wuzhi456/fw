# Baseline group intervention

**Intervention:** none.

Use the frozen requirement text from the task file referenced by `base_requirement_path` in the run log:

- `experiments/tasks/task-list-page.md` (v2 formal)
- `experiments/tasks/task-responsive-dashboard.md` (v2 formal)
- `experiments/tasks/task-async-form.md` (exploratory pilot only)

## Validation contract (Protocol v2 — all groups equally)

Also attach:

`experiments/tasks/VALIDATION-CONTRACT.md`

- Use every listed `data-testid` exactly.
- Implement the listed API paths and JSON shapes.
- Do **not** add Playwright specs or validation files to `output/`.

Do not attach `frontend-productization` or the Full Prompt checklist.
