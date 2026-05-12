# task-async-form — code quality only (single reviewer = subagent)

**Rubric:** `rubric.md` §5 (five metrics × 0–3). **Category points:** \((\mathrm{mean\ of\ five}) / 3) \times 35\) → max **35** for code quality alone.

**Review procedure:** Nine parallel `Task` subagents; each wrote `code-quality-review.json` beside `output/`. Instructions: `experiments/code-quality-review-instructions.md`.

**Limitations (vs frozen P5 protocol):**

- Only **one** reviewer pass (not two blind reviewers, no Cohen's kappa).
- Paths reveal **group**; reviewers were instructed not to use folder names as evidence, but this is **not** protocol-grade blind review.
- Scores are **LLM-judged**, not human committee.

## Per-run `code_quality_points` (of 35)

| Group | Rep | Points |
| --- | --- | ---: |
| baseline | rep-01 | 21.00 |
| baseline | rep-02 | 23.33 |
| baseline | rep-03 | 23.33 |
| experience-skill | rep-01 | 30.33 |
| experience-skill | rep-02 | 25.67 |
| experience-skill | rep-03 | 25.67 |
| full-prompt | rep-01 | 25.67 |
| full-prompt | rep-02 | 23.33 |
| full-prompt | rep-03 | 23.33 |

## By-group mean (`code_quality_points`)

| Group | Mean / 35 |
| --- | ---: |
| baseline | 22.55 |
| experience-skill | 27.22 |
| full-prompt | 24.11 |

**Grand mean (9 runs):** 24.63 (sample stdev ≈ 2.49).

## Short read

- **experience-skill** runs score highest on average, driven by explicit request/state modeling and structured helpers while still mostly lacking real tests (`test_coverage` often 0–1).
- **baseline** cluster lowest: large monolithic `App` files, little or no automated tests.
- **full-prompt** sits between: more files and boundaries in some reps, but reuse/test gaps and occasional DOM shortcuts pull scores down.

Raw JSON and per-metric breakdowns live next to each run under `code-quality-review.json`.
