# Async validated form (experience-skill rep-02)

Vite + React app. Remote checks use same-origin `fetch` to `/api/validate` and `/api/submit`, implemented by the Vite plugin in `vite.config.ts` for **dev** and **`vite preview`** (static build has no API unless preview is used).

## Injected experiences (5)

| Unit | What we implemented |
|------|---------------------|
| **form-duplicate-submit-guard** | Submit locked with `submitting` / `submitInFlight`; primary button disabled and `aria-busy` while a request is in flight. |
| **form-async-validation-feedback** | Debounced remote handle check, per-field pending text, inline errors, `AbortController` + abort on unmount / new keystrokes. |
| **form-submit-recovery** | Draft values kept on 422/500; field errors mapped to the note field; global banner as supplement. |
| **async-retry-recover** | **Retry submit** after failures; distinguishes 422 (field) vs 500/network messaging. |
| **state-optimistic-rollback** | **N/A** for this screen — see `docs/optimistic-updates.md`. |

Run `npm install`, then `npm run dev` or `npm run build` and `npm run preview`.
