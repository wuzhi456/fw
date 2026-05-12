# Plan (Full Prompt checklist — frozen task-async-form)

Pre-implementation notes mapping each Experience Unit to concrete behavior for this run.

### async-explicit-states

- Username remote check: **loading** (“Checking username…”), **valid**, **invalid** (server message), **error** (typed code pill), **idle** (copy + hints). Submit: **submitting** via button label + `aria-busy`, success and error **banners** with `aria-live="polite"`.

### async-retry-recover

- Validation: **Retry check** for retryable simulated `5xx` / generic failures; `4xx` and invalid username messages tell the user to fix the value, not retry blindly. Submit: recoverable `5xx` / timeout messaging with **Back to form**; non-retryable cases explain correction.

### async-stale-cancel

- Each validation bumps a **run id**; completions that do not match the latest run are ignored. **AbortController** aborts the in-flight mock delay when a newer validation starts.

### form-async-validation-feedback

- **Username**: debounced **change** (~320ms) plus **blur** (flush debounce + immediate check). Field-level `aria-invalid` and `aria-describedby` tie messages to the input.

### form-duplicate-submit-guard

- Submit **disabled** while `submitting` is true and when prerequisites fail; each attempt uses a new **idempotency key**; mock API deduplicates by key on success only.

### form-submit-recovery

- On submit failure, **inputs are not cleared**; copy states fields are preserved. On success, form resets for a clean next registration.

### list-incremental-prefetch

- **N/A** — no list or infinite scroll in this task (see README table).

### list-pagination-server

- **N/A** — no large list.

### list-virtualize-window

- **N/A** — no long list rendering.

### responsive-dense-dashboard-layout

- Form **max-width** ~36rem, **min-width** ~280px on the panel, stacked single column; comfortable padding reduction under **480px**.

### responsive-long-text-overflow

- Confirmation id uses **ellipsis** + **full value in `title`** (`.mono-clip`).

### responsive-mobile-navigation-density

- **N/A** — no admin chrome or nav rail; only form density tweaks at narrow widths.

### state-cache-invalidation

- **N/A** — no shared client query cache; validation is request-scoped.

### state-optimistic-rollback

- **N/A** — no optimistic mutations.

### state-stale-response-guard

- After await, results apply only if **current trimmed username still equals the validated value** and **run id** still matches (query signature discipline).

### ux-empty-state-actionable

- When both fields are empty and there is no banner, show **Get started** with **Go to display name** focusing the first field.

### ux-error-boundary-granularity

- **One** `FormErrorBoundary` wrapping only the `<form>` subtree with reset control.

### ux-fallback-recoverable-errors

- Recoverable issues use **inline / banner** text (non-modal), **Retry check** on validation, **Back to form** scroll helper on submit errors — no blocking alert dialogs.
