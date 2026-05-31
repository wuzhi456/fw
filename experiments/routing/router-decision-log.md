# Router Decision Log

## Task
- Task id: task-responsive-dashboard
- Stage: coding
- Task file: experiments/tasks/task-responsive-dashboard.md
- Budget: 4

## Task Cues
- Cues: admin, dashboard, layout, responsive
- Negation suppressed: none

## Selected EUs
- responsive-dense-dashboard-layout | Channel: A | Score: 1.57
  - Why selected? matched cues: dashboard, layout, responsive
  - Match sources: tag:responsive, tag:dashboard, tag:layout
  - What failure mode it prevents? Dense dashboard lacks responsive grid constraints.
- responsive-mobile-navigation-density | Channel: A | Score: 1.22
  - Why selected? matched cues: admin, responsive
  - Match sources: tag:responsive, tag:admin
  - What failure mode it prevents? Navigation density blocks mobile usability.
- responsive-long-text-overflow | Channel: B | Score: 0.87
  - Why selected? matched cues: responsive
  - Match sources: tag:responsive
  - What failure mode it prevents? Long identifiers overflow layout without handling.
- ux-error-boundary-granularity | Channel: B | Score: 0.87
  - Why selected? matched cues: dashboard
  - Match sources: tag:dashboard
  - What failure mode it prevents? Errors take down too much UI without isolation.

## Near Misses
- ux-empty-state-actionable | Score: 0.55
  - Why excluded? budget full or lower score
- ux-fallback-recoverable-errors | Score: 0.52
  - Why excluded? budget full or lower score
