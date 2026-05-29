/** Frozen check_id → check_type map (CHECK_CATALOG.md) */
export const CHECK_CATALOG = {
  'task-list-page': {
    'smoke-list-render': 'smoke',
    'smoke-list-filter': 'smoke',
    'stress-list-empty': 'stress',
    'stress-list-slow-fail-retry': 'stress',
    'stress-list-stale-filter': 'stress',
    'stress-list-large-page': 'stress',
  },
  'task-responsive-dashboard': {
    'smoke-dash-render': 'smoke',
    'smoke-dash-resize': 'smoke',
    'stress-dash-narrow': 'stress',
    'stress-dash-long-text': 'stress',
    'stress-dash-partial-error': 'stress',
    'stress-dash-dense-kpi': 'stress',
  },
};

export const TASK_SPECS = {
  'task-list-page': 'specs/task-list-page.spec.ts',
  'task-responsive-dashboard': 'specs/task-responsive-dashboard.spec.ts',
};

export function extractCheckId(title) {
  const match = title.match(/^([a-z0-9-]+):/);
  return match?.[1] ?? null;
}
