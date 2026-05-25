# Router Decision Log

## Task
- Task id: task-ecommerce-checkout
- Stage: plan
- Task file: experiments\tasks\task-ecommerce-checkout.md
- Budget: 2

## Task Cues
- Cues: 
- Negation suppressed: none

## Selected EUs
- ux-fallback-recoverable-errors | Channel: R | Score: 0.42
  - Why selected? matched cues: none
  - Match sources: none
  - What failure mode it prevents? Recoverable errors are blocking or invisible.
- form-submit-recovery | Channel: B | Score: 0.70
  - Why selected? matched cues: none
  - Match sources: none
  - What failure mode it prevents? Failed submit loses user input or lacks safe retry.

## Near Misses
- ux-empty-state-actionable | Score: 0.72
  - Why excluded? budget full or lower score
- form-async-validation-feedback | Score: 0.63
  - Why excluded? budget full or lower score
- responsive-long-text-overflow | Score: 0.60
  - Why excluded? budget full or lower score
