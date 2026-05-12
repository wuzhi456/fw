# Dry run: 数据列表页（搜索+筛选）

Task id: `task-list-page`

## Hard triggers (synthetic)
`list`, `request`, `search`

## Routed units (3–5)

- `async-explicit-states` — **core-mandatory**: 任务含列表数据请求，高风险 async
- `list-pagination-server` — **core-mandatory**: 未显式提分页但隐含大数据列表
- `state-stale-response-guard` — **contextual-topk**: 筛选变化导致竞态
- `ux-empty-state-actionable` — **contextual-topk**: 搜索/筛选可能空结果
- `async-retry-recover` — **contextual-topk**: 列表请求失败需要恢复

## Dedup / conflict notes
- No duplicate category intent: async state vs form submit kept separate.
- Conflict arbitration: `risk_severity` favored for list task (async + stale).