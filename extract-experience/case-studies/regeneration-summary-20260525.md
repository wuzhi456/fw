# EU 语料库再生总结（2026-05-25）

**编排方式：** Parent Agent 顺序派发 5 个 extract-experience subagent（async 3 条已由前序会话完成，本次 3→18）。  
**Skill 版本：** extract-experience v1.2.0  
**校验：** `python scripts/validate_frontend_productization_skill.py` → `OK: 18 units`

---

## 六类 × 3 条 EU id

| risk_class | EU id |
| --- | --- |
| **async** | `async-explicit-states`, `async-stale-cancel`, `async-retry-recover` |
| **list** | `list-pagination-server`, `list-virtualize-window`, `list-incremental-prefetch` |
| **form** | `form-duplicate-submit-guard`, `form-async-validation-feedback`, `form-submit-recovery` |
| **state** | `state-optimistic-rollback`, `state-cache-invalidation`, `state-stale-response-guard` |
| **ux** | `ux-error-boundary-granularity`, `ux-empty-state-actionable`, `ux-fallback-recoverable-errors` |
| **responsive** | `responsive-mobile-navigation-density`, `responsive-long-text-overflow`, `responsive-dense-dashboard-layout` |

---

## 批次 id（本次 15 条 EU 相关）

| 序 | batch_id | scope |
| ---: | --- | --- |
| 1 | `B-ra-list-1-r20260525` | react-admin / list / docs+code |
| 2 | `B-kb-list-1-r20260525` | kibana / list / issue+pr |
| 3 | `B-ra-form-1-r20260525` | react-admin / form / docs+code |
| 4 | `B-rf-form-1-r20260525` | refine / form / docs+hooks |
| 5 | `B-rf-form-2-r20260525` | refine / form / docs+PR |
| 6 | `B-rf-state-1-r20260525` | refine / state / docs |
| 7 | `B-kb-state-1-r20260525` | kibana / state / issue |
| 8 | `B-kb-err-1-r20260525` | kibana / ux / issue+PR |
| 9 | `B-kb-empty-1-r20260525` | kibana / ux / PR |
| 10 | `B-gl-ux-1-r20260525` | gitlab / ux / issue+epic |
| 11 | `B-rf-resp-1-r20260525` | refine / responsive / issue+docs |
| 12 | `B-kb-overflow-1-r20260525` | kibana / responsive / issue |

（async 三条批次见 `extraction-notes.md`：`B-ra-async-*-r20260525`）

---

## partial / keep caveat 列表

以下 EU 在 `evidence-audit-table.md` 中 `action: keep`，但 `evidence_strength: partial` 或 weakest-link confidence 为 medium，实验解读时需注意：

| EU id | evidence_strength | caveat |
| --- | --- | --- |
| `async-explicit-states` | partial | 001 partial/medium；002/003 strong/high |
| `async-retry-recover` | partial | Admin queryClient partial/medium；#10180 strong/high |
| `list-pagination-server` | partial | 002 partial/medium |
| `list-virtualize-window` | partial | 001 partial/medium |
| `form-duplicate-submit-guard` | partial | 001 partial/medium；002 strong/high |
| `state-cache-invalidation` | partial | 002 partial/medium |
| `ux-error-boundary-granularity` | partial | gitlab-002 partial/medium；排除 weak `kibana-error-boundary-001` |
| `ux-fallback-recoverable-errors` | partial | RFC#94 partial/medium；Week 1 watchlist 换证自 refine |
| `responsive-mobile-navigation-density` | partial | 002 partial/medium |
| `responsive-long-text-overflow` | partial | 001 partial/medium |
| `responsive-dense-dashboard-layout` | partial | 002 strong/medium；复用 dashboard-async 重映射 |

**换证记录：**

- `list-incremental-prefetch`：`kibana-list-perf-001` 自 PR #106163 换证至 #134306
- `ux-fallback-recoverable-errors`：replace refine 低置信 → GitLab #381151 + RFC#94

**证据复用（跨 EU，failure mode 已区分）：**

- `state-optimistic-rollback` 与 `form-submit-recovery` 共用 refine form-submit-recover 证据，主张分别为缓存/UI 回滚 vs 表单字段保留
- `responsive-dense-dashboard-layout` 复用 `dashboard-async-*` 证据，重映射为 grid/多卡布局边界

---

## 验收清单

- [x] `experience-index.json` units = 18，`status: complete`
- [x] `frontend-productization/experiences/*.md`（除 README）= 18，id 与 index 一致
- [x] `evidence-audit-table.md` 18 行 EU
- [x] validate exit 0

---

## 下一步

1. **B — routing packet 更新**（非本再生范围）
2. **C — 启动 `experiment-protocol-v2.md` 正式 16 runs**（依赖完整 18 EU checklist）
