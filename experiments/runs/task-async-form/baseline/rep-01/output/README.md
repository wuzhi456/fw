# Baseline run — task-async-form

React + TypeScript (Vite) form that POSTs JSON to a mock remote API. One field is validated asynchronously on the server before submit is enabled.

## Mock API (same-origin `fetch`)

During **`npm run dev`** and **`npm run preview`**, a small Vite plugin registers Connect middleware:

| Method | Path | Body | Behavior |
|--------|------|------|------------|
| `POST` | `/api/validate-code` | `{ "code": string }` | ~350ms delay; `valid: true` only if `code` (trimmed, case-insensitive) is `alpha`. |
| `POST` | `/api/submit` | JSON payload | ~400ms delay; `201` if `code` is `alpha`, else `400` with an error message. |

`npm run build` only emits static assets; there is no Node server in the `dist/` folder. Use `npm run preview` to exercise the same `/api/*` routes locally.

## Scripts

- `npm run dev` — dev server with mock API
- `npm run build` — typecheck + production bundle
- `npm run preview` — preview server with the same mock API
