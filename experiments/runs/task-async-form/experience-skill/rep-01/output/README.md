# Async validated form (rep-01, experience-skill)

Frozen task: build a form that submits to a remote API, with some fields validated asynchronously before submit is allowed; the user can fix errors and submit successfully.

Stack: Vite, React 18, TypeScript. The “remote” layer is a **mock delayed API** in `src/mockRemoteApi.ts`.

## Productization plan (injected units)

### 1. `form-duplicate-submit-guard`

**Plan — idempotency**

- **Frontend:** debounce rapid submit intents (`SUBMIT_DEBOUNCE_MS` in `AsyncForm.tsx`); UI disables submit while `submitPhase === "submitting"` (state machine lock).
- **Backend (mock):** `idempotencyKey` on each submit body; identical key within 60s returns the cached success payload without re-running side effects.

**Coding**

- Submit phases: `idle | submitting | success | error` (`SubmitPhase` in `src/types.ts`).
- Primary submit control uses `aria-busy={submitPhase === "submitting"}`.

### 2. `form-async-validation-feedback`

**Plan — remote fields and triggers**

- **Username:** server validation on **`blur`** (user must leave the field to arm checks).
- **Email:** server validation on **`change`**, debounced ~420ms (`useDebouncedValue`) so typing does not spam the mock API.

**Coding**

- `useKeyedRemoteValidator` binds each in-flight validation to `(field, value)`; `AbortController` in `useEffect` cleanup aborts stale work on value change or unmount.

### 3. `form-submit-recovery`

**Plan**

- **Always keep** user-entered `username`, `email`, and `message` on failure (no silent overwrite of free text).
- **Server-mapped fields:** merge `fieldErrors` from the unified error object onto individual inputs; toast only summarizes the failure.

**Coding**

- `submitFieldErrors` in `AsyncForm.tsx` maps server errors per `FieldKey`; cleared at the start of each new submit attempt.

### 4. `async-retry-recover`

**Plan — user copy and retry**

| Class   | Example | User-facing copy (toast / banner) | Retry                         |
| ------- | ------- | --------------------------------- | ----------------------------- |
| `client_4xx` | 409 conflict | Conflict / fix highlighted fields | No automatic retry            |
| `server_5xx` | 503        | Server error; automatic retry when possible | Yes, exponential backoff in `runWithRetry` |
| `timeout`    | (abort)    | Server took too long; retry may help | Yes, bounded attempts         |
| `network`    | thrown     | Connection problem                | Yes, bounded attempts         |

**Coding**

- `runWithRetry` in `src/apiClient.ts` centralizes timeout, retries, and `UnifiedApiError`; the form only inspects `{ ok, data } | { ok, error }`.

### 5. `state-optimistic-rollback`

**N/A for this deliverable**

- This UI is a **request/response form submit** with an explicit `submitting` phase rather than an optimistic mutation of shared server state.
- There is no client-side “assume success then roll back” path; conflict detection via version/timestamp would require a versioned resource contract beyond the frozen task. No optimistic update list is implemented.

## Commands

```bash
npm install
npm run build
```
