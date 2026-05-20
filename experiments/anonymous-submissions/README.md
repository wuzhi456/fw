# Anonymous submissions (P4 → P5)

1. After each run is accepted (or failed-run logged), prepare a **blind** package for reviewers.
2. Use opaque ids such as `anon-001`, `anon-002`, … with no embedded `task_id`, `group`, or `rep` in filenames shown to reviewers.
3. Keep a separate operator-only map file **outside** this folder (e.g. `experiments/anon-map.operator-only.csv`, gitignored if course policy requires) linking `anon-*` → real `run_id` / path. **Do not** commit maps that break blind review unless protocol allows.
4. Scoring uses `rubric.md`; reviewers must not open `run-log.csv` until scores are final (`experiment-protocol.md` §9).

Suggested layout:

```text
anonymous-submissions/
  anon-001/
    README.txt          # short task description only, no group hints
    source/             # redacted output tree for review
```
