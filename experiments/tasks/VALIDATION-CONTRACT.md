# Validation Contract (Protocol v2 — Endpoint A)

**Owner:** C  
**Audience:** All four intervention groups (baseline, full-prompt, experience-skill, superpowers)  
**Purpose:** Minimum **operational** hooks so Playwright checks can run fairly. This is **not** a product spec or rubric hint.

**Authority:** Check definitions in [`../validation/CHECK_CATALOG.md`](../validation/CHECK_CATALOG.md). This document lists only what automated tests locate in the DOM and network.

**Fairness:** Include this file (or the Phase 3 agent prompt block that references it) for **every** group equally. Validation scripts remain operator-run after generation.

---

## Global requirements

| Requirement | Detail |
| --- | --- |
| Build | `npm install` + `npm run build` must succeed in `output/` |
| Entry | Single-page app served at `/` after `npm run preview` |
| Test hooks | Use `data-testid` exactly as listed below (React: `data-testid="..."`) |
| API | Relative paths below; JSON responses; Playwright may mock routes during stress checks |

---

## task-list-page

### API

| Method | Path | Query (optional) | Response body |
| --- | --- | --- | --- |
| `GET` | `/api/items` | `q` (search string), `category` (filter value) | `{ "items": Item[] }` |

```ts
type Item = { id: string; name: string; category: string };
```

App should `fetch('/api/items')` (with query params when filtering). Handle loading, HTTP errors, and empty arrays.

### Required `data-testid` values

| testid | When visible / purpose |
| --- | --- |
| `list-page` | Root list view container (always after mount) |
| `search-input` | Text search control |
| `category-filter` | Filter control (`<select>` or equivalent) |
| `loading-state` | While a fetch is in flight |
| `error-state` | After a failed fetch |
| `retry-button` | Inside or beside error state; triggers re-fetch |
| `empty-state` | When fetch succeeded but zero rows match |
| `items-table` | Table (or list container) when rows exist |
| `item-row` | One per rendered row |

### Minimal behavior (for checks to pass)

1. Initial load shows `loading-state`, then rows **or** `empty-state`.
2. Search/filter changes update visible rows or show `empty-state`.
3. Failed API → `error-state` + working `retry-button`.
4. Rapid filter changes should not flash stale rows (request sequencing or equivalent guard).

---

## task-responsive-dashboard

### API

| Method | Path | Response body |
| --- | --- | --- |
| `GET` | `/api/kpis` | `{ "kpis": Kpi[] }` |
| `GET` | `/api/cards` | `{ "cards": { id: string; title: string }[] }` (optional section) |

```ts
type Kpi = {
  id: string;       // must include: users, revenue, orders, uptime
  label: string;
  value: string;
  error?: boolean;  // when true, card shows error UI but dashboard stays usable
};
```

### Required `data-testid` values

| testid | When visible / purpose |
| --- | --- |
| `dashboard-shell` | Root dashboard layout |
| `dashboard-nav` | Top/side navigation region |
| `kpi-grid` | Container for KPI cards |
| `kpi-card-users` | KPI card (`id === "users"`) |
| `kpi-card-revenue` | KPI card (`id === "revenue"`) |
| `kpi-card-orders` | KPI card (`id === "orders"`) |
| `kpi-card-uptime` | KPI card (`id === "uptime"`) |
| `kpi-label` | Label inside each KPI card |
| `kpi-value` | Value inside each KPI card |
| `kpi-error` | Shown on a card when that metric failed (partial error check) |
| `management-actions` | Action button group (export/refresh/manage, etc.) |

Pattern: other cards may use `kpi-card-{id}`; tests require the four IDs above.

### Minimal behavior (for checks to pass)

1. Shell, nav, KPI grid, and `management-actions` render on `/`.
2. Layout reflows at 1280px, 768px, 375px without horizontal overflow breaking nav/KPI.
3. Long KPI labels wrap or truncate without breaking layout.
4. One KPI with `error: true` (or failed fetch for one card) shows `kpi-error` on that card only; others remain usable.
5. Four KPI cards readable at ~1024px laptop width.

---

## Phase 3 agent prompt snippet (copy block)

```markdown
## Validation contract (Endpoint A — all groups)

Implement the frozen task **and** the operational hooks in:
`experiments/tasks/VALIDATION-CONTRACT.md`

- Use every listed `data-testid` exactly.
- Implement the listed API paths and JSON shapes.
- Do not add Playwright specs or validation files to `output/`.
```

---

## References

- Checks: [`../validation/CHECK_CATALOG.md`](../validation/CHECK_CATALOG.md)
- CLI: [`../validation/README.md`](../validation/README.md)
- Frozen tasks: `task-list-page.md`, `task-responsive-dashboard.md`
