# Router Decision Log

## Task
- Task id: task-async-form
- Stage: plan
- Task file: experiments\tasks\task-async-form.md

## Task Cues
- Cues: async, form, mutation, request, ux

## Selected EUs
- async-explicit-states | Channel: A | Score: 1.22
  - Why selected? matched cues: async, request
  - What failure mode it prevents? No explicit loading/error/empty state for async data.
- form-duplicate-submit-guard | Channel: A | Score: 1.22
  - Why selected? matched cues: form, mutation
  - What failure mode it prevents? Duplicate submits trigger repeated mutations.
- form-async-validation-feedback | Channel: B | Score: 1.25
  - Why selected? matched cues: async, form
  - What failure mode it prevents? Async validation lacks per-field feedback and debouncing.
- form-submit-recovery | Channel: B | Score: 0.90
  - Why selected? matched cues: form
  - What failure mode it prevents? Failed submit loses user input or lacks safe retry.
- ux-empty-state-actionable | Channel: B | Score: 0.90
  - Why selected? matched cues: ux
  - What failure mode it prevents? Empty states lack guidance for next steps.

## Near Misses
- async-retry-recover | Score: 0.87
  - Why excluded? budget full or lower score
- async-stale-cancel | Score: 0.87
  - Why excluded? budget full or lower score
- ux-error-boundary-granularity | Score: 0.84
  - Why excluded? budget full or lower score
