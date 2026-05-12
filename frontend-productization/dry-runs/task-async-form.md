# Dry run: 异步校验表单页

Task id: `task-async-form`

## Hard triggers (synthetic)
`form`, `async`, `request`

## Routed units (3–5)

- `form-duplicate-submit-guard` — **core-mandatory**: 提交类硬触发
- `form-async-validation-feedback` — **core-mandatory**: 异步校验显式在域内
- `form-submit-recovery` — **contextual-topk**: 失败恢复未在需求写明
- `async-retry-recover` — **contextual-topk**: 网络失败重试与表单联动
- `state-optimistic-rollback` — **contextual-topk**: 若采用乐观保存策略

## Dedup / conflict notes
- No duplicate category intent: async state vs form submit kept separate.
- Conflict arbitration: `risk_severity` favored for list task (async + stale).