# Check catalog (Protocol v2 — frozen before first run)

**Owner:** C  
**Sign-off:** pending

## Global

| check_id | type | applies_to | pass criterion |
| --- | --- | --- | --- |
| `gate-build` | operational | all | `npm run build` exit 0 (not in validation_pass_rate numerator) |

## task-list-page

| check_id | type | pass criterion |
| --- | --- | --- |
| `smoke-list-render` | smoke | List route renders ≥1 row or explicit empty state |
| `smoke-list-filter` | smoke | Filter/search control changes visible list or empty state |
| `stress-list-empty` | stress | Empty API → empty state UI, no crash |
| `stress-list-slow-fail-retry` | stress | Slow/fail API → loading then error/recover path visible |
| `stress-list-stale-filter` | stress | Rapid filter changes → no stale data flash (or explicit guard) |
| `stress-list-large-page` | stress | Large page/bounded render without main-thread freeze timeout |

## task-responsive-dashboard

| check_id | type | pass criterion |
| --- | --- | --- |
| `smoke-dash-render` | smoke | Dashboard shell + ≥1 KPI/card region renders |
| `smoke-dash-resize` | smoke | Resize viewport → layout reflows without horizontal overflow crash |
| `stress-dash-narrow` | stress | ≤375px width: nav/KPI usable (no total clip) |
| `stress-dash-long-text` | stress | Long label/ID truncated or wrapped without layout break |
| `stress-dash-partial-error` | stress | One card/chart error → rest of dashboard still usable |
| `stress-dash-dense-kpi` | stress | Dense KPI grid readable at laptop width |

## Formula

```text
validation_pass_rate = (# pass) / (# pass + # fail)
```

Exclude `not_applicable` and `not_testable` from denominator. Document NA per check in validation-results.csv notes.
