# Suggested automatic checks (per run output)

Run from the generated project root inside `experiments/runs/.../output/` (adjust package manager).

1. **Install:** `npm ci` or `npm install` if lockfile present; else `pnpm install` / `yarn install` as applicable.
2. **Lint:** `npm run lint` if defined.
3. **Build:** `npm run build` if defined.
4. **Test:** `npm test` or `npm run test` if defined.
5. **Typecheck:** `npx tsc --noEmit` if TypeScript.

Record commands used, exit codes, and log excerpts in `metadata.json` notes or `logs.txt`.

If the agent output is a single HTML file with no package.json, note that in `metadata.json` and perform any manual smoke checks agreed with the operator.
