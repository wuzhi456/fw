# Per-run artifact layout (Protocol v2)

Formal v2 schedule: [`../randomization-table-v2-16.csv`](../randomization-table-v2-16.csv)  
Scaffold: `node experiments/scripts/scaffold-v2-runs.mjs`

```text
experiments/runs/<task_id>/<group>/rep-XX/
  metadata.json          # from ../templates/run-metadata.template.json
  output/                # generated project (gitignored)
  validation/            # optional: per-run screenshots/logs
```

**v2 `task_id`:** `task-list-page`, `task-responsive-dashboard`  
**v2 `group`:** `baseline`, `experience-skill`, `full-prompt`, `superpowers`  
**v2 replicates:** `rep-01`, `rep-02`

Exploratory async pilot lives under `task-async-form/` (9 runs, not v2 formal).

Agents must implement hooks in [`../tasks/VALIDATION-CONTRACT.md`](../tasks/VALIDATION-CONTRACT.md) (all groups equally).

After anonymization, copy scorer bundles to `experiments/anonymous-submissions/`.
