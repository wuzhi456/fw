# Dry run: 响应式管理仪表

Task id: `task-responsive-dashboard`

## Hard triggers (synthetic)
`dashboard`, `responsive`, `list`

## Routed units (3–5)

- `async-explicit-states` — **core-mandatory**: 仪表多卡片异步数据
- `responsive-dense-dashboard-layout` — **core-mandatory**: 响应式+密集布局
- `responsive-long-text-overflow` — **contextual-topk**: 管理页长标签/ID
- `responsive-mobile-navigation-density` — **contextual-topk**: 移动端后台
- `ux-error-boundary-granularity` — **contextual-topk**: 多模块失败隔离

## Dedup / conflict notes
- No duplicate category intent: async state vs form submit kept separate.
- Conflict arbitration: `risk_severity` favored for list task (async + stale).