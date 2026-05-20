# task-async-form — Full Prompt rep-01 output

Vite + React + TypeScript. Mock remote API in `src/mockRemoteApi.ts`. Username is validated asynchronously before submit unlocks; users can fix `taken` / error simulations and submit successfully.

## Scripts

```bash
npm install
npm run build
```

## Full Prompt checklist — list-only / out-of-scope N/A

These Plan items are **not applicable** to this frozen single-page form (no list, no dashboard shell, no client entity cache, no optimistic writes). They are still counted in `injected_experience_count` (18) as checklist units for the control group.

| Unit | N/A reason |
| --- | --- |
| `list-incremental-prefetch` | No list / infinite scroll. |
| `list-pagination-server` | No paginated list. |
| `list-virtualize-window` | No long list UI. |
| `responsive-mobile-navigation-density` | No admin navigation pattern. |
| `state-cache-invalidation` | No normalized client cache or query keys. |
| `state-optimistic-rollback` | No optimistic mutations. |

Applied behavior for all other units is summarized in `PLAN.md` and reflected in the UI/code.
