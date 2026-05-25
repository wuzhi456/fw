# Evidence audit table (P1 Experience Units)



**Status:** complete (18/18 EU, Gate B+E via extract-experience skill v1.2.0)

**Completed:** 2026-05-25



| EU id | risk_class | evidence_strength | action | notes |

| --- | --- | --- | --- | --- |

| async-explicit-states | async | partial | keep | Gate B 2026-05-25：3 条 URL 200；001 partial/medium，002/003 strong/high；E1≥2 E2 strong |

| async-stale-cancel | async | strong | keep | Gate B 2026-05-25：#4658+#4718 verified；换证 Actions/spec→issue+PR；E1≥2 E2 strong×2；与 explicit-states failure mode 不重叠 |

| async-retry-recover | async | partial | keep | Gate B 2026-05-25：#10180 verified strong/high，Admin queryClient partial/medium；E2 strong；E4 issue verified |

| list-pagination-server | list | partial | keep | Gate B 2026-05-25：List.md+List.tsx HTTP 200；001 strong/high 002 partial/medium；E1≥2 E2 strong；failure mode 缺 total/跳页 |

| list-virtualize-window | list | partial | keep | Gate B 2026-05-25：Datagrid.md+#8075 verified；001 partial/medium 002 strong/high；E2 strong；E4 issue freeze |

| list-incremental-prefetch | list | strong | keep | Gate B 2026-05-25：#134306+#152311 verified；001/002 strong/high；E2 strong×2；换证 001 自 PR #106163 |
| form-duplicate-submit-guard | form | partial | keep | Gate B 2026-05-25：Forms.md+SaveButton.tsx HTTP 200；001 partial/medium 002 strong/high；E1≥2 E2 strong；failure mode 连点双建 |
| form-async-validation-feedback | form | strong | keep | Gate B 2026-05-25：#2955 verified + useForm docs HTTP 200；001/002 strong/high；E2 strong×2；E4 issue verified |
| form-submit-recovery | form | strong | keep | Gate B 2026-05-25：useUpdate docs+#3657 verified；001/002 strong/high；E2 strong×2；E4 PR verified optimistic rollback |
| state-optimistic-rollback | state | strong | keep | Gate B 2026-05-25：useUpdate docs+#3657 HTTP 200 verified；001/002 strong/high 复用；E1≥2 E2 strong×2；failure mode 缓存回滚≠form-submit-recovery 表单保留 |
| state-cache-invalidation | state | partial | keep | Gate B 2026-05-25：useInvalidate+useForm docs HTTP 200；001 strong/high 002 partial/medium；E2 strong；failure mode 失效范围过宽/过窄 |
| state-stale-response-guard | state | strong | keep | Gate B 2026-05-25：#149488+#129020 verified；001/002 strong/high；E2 strong×2；E4 issue verified 上下文绑定 callout |
| ux-error-boundary-granularity | ux | partial | keep | Gate B 2026-05-25：#153457+#139710+epic/6359+#381151 HTTP 200；002/003 strong，gitlab-002 partial/medium；E1≥2 E2 strong×2；排除 weak 001 |
| ux-empty-state-actionable | ux | strong | keep | Gate B 2026-05-25：#128754+#79671 verified；001/002 strong/high；E2 strong×2；failure mode 无下一步 vs 错误混 empty |
| ux-fallback-recoverable-errors | ux | partial | keep | Gate B 2026-05-25：#381151 verified strong/high + RFC#94 partial/medium；E2 strong；replace refine 低置信；Week 1 watchlist 换证 |
| responsive-mobile-navigation-density | responsive | partial | keep | Gate B 2026-05-25：#6323+#router docs HTTP 200；001 strong/high 002 partial/medium；E1≥2 E2 strong；E4 issue verified overlap |
| responsive-long-text-overflow | responsive | partial | keep | Gate B 2026-05-25：#36386+#221577 verified；001 partial/medium 002 strong/high；E2 strong；failure mode 长文本撑破/截断 |
| responsive-dense-dashboard-layout | responsive | partial | keep | Gate B 2026-05-25：useList docs+#4896 HTTP 200；001 strong/high 002 strong/medium；E2 strong；复用 dashboard-async 重映射 grid+多卡边界 |



## Promotion checklist



After each EU is promoted, append one row with:



- `evidence_strength`: strong | partial | weak (weakest linked evidence)

- `action`: keep | replace | downgraded | merge

- `notes`: Gate B/E summary, caveats

