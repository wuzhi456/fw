# Per-run artifact layout

Each completed run should populate a directory matching the frozen schedule in `experiments/randomization-table-27.csv` or `randomization-table-mvp-18.csv`:

```text
experiments/runs/<task_id>/<group>/rep-XX/
  metadata.json          # copy from ../templates/run-metadata.template.json and fill
  prompt/                # optional: exact user prompt + intervention text saved as files
  output/                # generated project tree (or zip extract)
  logs.txt               # optional: tool transcript excerpt
```

`task_id` is one of: `task-list-page`, `task-async-form`, `task-responsive-dashboard`.  
`group` is one of: `baseline`, `experience-skill`, `full-prompt`.  
`rep-XX` matches the `replicate` column (`01`–`03`).

After anonymization, copy scorer-facing bundles to `experiments/anonymous-submissions/` (see that folder’s README).
