# Routing Packet: task-list-page

## Plan

# Router Decision Log

## Task
- Task id: task-list-page
- Stage: plan
- Task file: experiments\tasks\task-list-page.md

## Task Cues
- Cues: async, filter, list, request, search

## Selected EUs
- async-explicit-states | Channel: A | Score: 1.22
  - Why selected? matched cues: async, request
  - What failure mode it prevents? No explicit loading/error/empty state for async data.
- async-stale-cancel | Channel: A | Score: 0.87
  - Why selected? matched cues: async
  - What failure mode it prevents? Stale responses overwrite newer state during rapid changes.
- async-retry-recover | Channel: B | Score: 0.87
  - Why selected? matched cues: async
  - What failure mode it prevents? Recoverable errors lack retry or fallback path.
- list-incremental-prefetch | Channel: B | Score: 0.87
  - Why selected? matched cues: list
  - What failure mode it prevents? Infinite list loads too aggressively without backpressure.
- list-pagination-server | Channel: B | Score: 0.87
  - Why selected? matched cues: list
  - What failure mode it prevents? Large lists render or fetch too much data at once.

## Near Misses
- list-virtualize-window | Score: 0.87
  - Why excluded? budget full or lower score
- form-async-validation-feedback | Score: 0.65
  - Why excluded? budget full or lower score

## Coding

# Router Decision Log

## Task
- Task id: task-list-page
- Stage: coding
- Task file: experiments\tasks\task-list-page.md

## Task Cues
- Cues: async, filter, list, request, search

## Selected EUs
- async-explicit-states | Channel: A | Score: 1.22
  - Why selected? matched cues: async, request
  - What failure mode it prevents? No explicit loading/error/empty state for async data.
- async-stale-cancel | Channel: A | Score: 0.87
  - Why selected? matched cues: async
  - What failure mode it prevents? Stale responses overwrite newer state during rapid changes.
- async-retry-recover | Channel: B | Score: 0.87
  - Why selected? matched cues: async
  - What failure mode it prevents? Recoverable errors lack retry or fallback path.
- list-incremental-prefetch | Channel: B | Score: 0.87
  - Why selected? matched cues: list
  - What failure mode it prevents? Infinite list loads too aggressively without backpressure.
- list-pagination-server | Channel: B | Score: 0.87
  - Why selected? matched cues: list
  - What failure mode it prevents? Large lists render or fetch too much data at once.

## Near Misses
- list-virtualize-window | Score: 0.87
  - Why excluded? budget full or lower score
- form-async-validation-feedback | Score: 0.65
  - Why excluded? budget full or lower score
