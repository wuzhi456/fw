# Full Prompt checklist — Plan bullets applied (task-async-form, rep-02)

Each item mirrors `experiments/full-prompt-checklist.md`. Irrelevant bullets are marked **N/A** with a one-line rationale.

### async-explicit-states

- **Plan:** Username/email validation requests show **checking** (“Checking with server…”), **valid** (availability hint), **invalid** (field error), and **idle** (no message). Submit shows **Submitting…** on the button while the POST is in flight.

### async-retry-recover

- **Plan:** Field checks: **4xx** → “Could not verify…”; **5xx** → “Server error while checking…; **network** → retry-oriented copy. Submit: **4xx/5xx** mapped in `submitMessage`; timeout/abort → “timed out… try again”. **Retry submit** on the error banner; field errors clear when the user edits or re-blurs after fixing.

### async-stale-cancel

- **Plan:** Each remote field validation bumps a sequence counter and aborts the prior `AbortController` so overlapping keystrokes do not apply stale results; submit uses its own controller plus a 25s timeout abort.

### form-async-validation-feedback

- **Plan:** **Username** and **email** are remotely validated with **400ms debounce on change** and **immediate check on blur** (debounce cleared first). Per-field **aria-busy**, **aria-invalid**, and **aria-describedby** wire errors and loading hints.

### form-duplicate-submit-guard

- **Plan:** `submitGuard` ref plus `submitting` state; submit button **disabled** when `submitting` or prerequisites fail, preventing double mutation from double-clicks.

### form-submit-recovery

- **Plan:** On submit failure, **title, body, username, and email stay in the inputs**; inline banner explains the issue and offers **Retry submit** without clearing the form.

### list-incremental-prefetch

- **N/A:** No list or infinite scroll in this task.

### list-pagination-server

- **N/A:** No large list UI.

### list-virtualize-window

- **N/A:** No long virtualized list.

### responsive-dense-dashboard-layout

- **N/A:** Single-column form, not a dense dashboard; card uses `max-width` and comfortable spacing on large screens.

### responsive-long-text-overflow

- **Plan:** Error text, hints, and the monospace API host use **`overflow-wrap: anywhere`** / **`word-break`** so long strings wrap on narrow viewports; body textarea uses **`overflow-wrap`**.

### responsive-mobile-navigation-density

- **N/A:** No admin navigation chrome; form stacks vertically by default for narrow widths.

### state-cache-invalidation

- **N/A:** No client query cache beyond field-level validation state; changing a field resets that field’s remote status until revalidated.

### state-optimistic-rollback

- **N/A:** No optimistic list or entity cache updates in scope.

### state-stale-response-guard

- **Plan:** Validation responses apply only if the **sequence number** still matches the latest scheduled run for that field (paired with abort on new input).

### ux-empty-state-actionable

- **Plan:** After a **successful** submit, the success banner includes **Start another** to reset the form (actionable completion state). Initial empty fields are explained by the header hint (why fields are empty and what to enter).

### ux-error-boundary-granularity

- **Plan:** `ErrorBoundary` wraps only the form subtree so a local render fault shows a small **fallback panel** with **Try again** instead of blanking the whole page.

### ux-fallback-recoverable-errors

- **Plan:** Recoverable issues use **non-blocking** inline **hints**, **field errors**, and the **banner** (not `alert`). Boundary fallback is secondary for non-recoverable render faults.
