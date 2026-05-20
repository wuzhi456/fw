# Evidence audit table (P1 Experience Units)

本表覆盖现有 **18** 条 Experience Units（EU），记录证据强度与裁决动作。

| EU id | risk_class | evidence_strength | action | notes |
| --- | --- | --- | --- | --- |
| async-explicit-states | async | partial | keep | 证据为文档+代码，覆盖显式状态。 |
| async-stale-cancel | async | partial | keep | 证据间接支持竞态取消。 |
| async-retry-recover | async | partial | keep | Issue+文档支撑重试与通知。 |
| list-pagination-server | list | partial | keep | 文档+代码描述服务端分页。 |
| list-virtualize-window | list | partial | keep | 文档+Issue 支撑大列表虚拟化。 |
| list-incremental-prefetch | list | partial | keep | PR 证据偏实现但仍可复用。 |
| form-duplicate-submit-guard | form | partial | keep | docs+代码支撑重复提交防护。 |
| form-async-validation-feedback | form | strong | keep | Issue+文档直接描述异步校验。 |
| form-submit-recovery | form | strong | keep | PR 与 hook 文档直接对齐恢复流程。 |
| state-optimistic-rollback | state | partial | keep | 文档/PR 需结合解释。 |
| state-cache-invalidation | state | strong | keep | useInvalidate 文档强支撑。 |
| state-stale-response-guard | state | strong | keep | Discover issues 直接支撑。 |
| ux-error-boundary-granularity | ux | partial | keep | 引入 kibana-error-boundary-003 替换弱证据，置信度升至 medium。 |
| ux-empty-state-actionable | ux | strong | keep | 空状态 PR 明确可操作提示。 |
| ux-fallback-recoverable-errors | ux | needs-replacement | replace | 低置信证据拉低 EU。 |
| responsive-mobile-navigation-density | responsive | partial | keep | Issue+文档可复用。 |
| responsive-long-text-overflow | responsive | partial | keep | Issue 覆盖溢出场景。 |
| responsive-dense-dashboard-layout | responsive | partial | keep | Hook/PR 证据偏间接。 |
