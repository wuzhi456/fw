# Experience candidates (P1)

Status legend: merged→<EU id> means distilled into `frontend-productization/experiences/`. parked means out of MVP EU set but kept for traceability.

| id | risk_class | summary | source_hint | primary_evidence | status |
| --- | --- | --- | --- | --- | --- |
| C-001 | async | 列表初次加载无 skeleton 的风险 | react-admin docs+tests | evidence/react-admin/async-explicit-states-001.md | merged→async-explicit-states |
| C-002 | async | 详情页切换记录时的竞态 | react-admin controller patterns | evidence/react-admin/async-stale-cancel-001.md | merged→async-stale-cancel |
| C-003 | async | 全局 QueryClient 无错误归一 | refine data hooks | evidence/refine/dashboard-async-001.md | parked |
| C-004 | async | Discover 长时间查询无取消 | kibana issues class | evidence/kibana/kibana-async-002.md | merged→async-stale-cancel |
| C-005 | async | 重试风暴无退避 | react-admin issues | evidence/react-admin/async-retry-001.md | merged→async-retry-recover |
| C-006 | async | 空数组与错误码混淆 | react-admin docs | evidence/react-admin/async-explicit-states-002.md | merged→async-explicit-states |
| C-007 | list | 客户端排序大列表 | react-admin list | evidence/react-admin/list-pagination-002.md | merged→list-pagination-server |
| C-008 | list | 无 total 的分页控件 | react-admin list docs | evidence/react-admin/list-pagination-001.md | merged→list-pagination-server |
| C-009 | list | 宽表横向滚动体验 | react-admin datagrid | evidence/react-admin/list-window-001.md | merged→list-virtualize-window |
| C-010 | list | 字段元数据编辑器性能 | kibana field list | evidence/kibana/kibana-list-perf-001.md | merged→list-incremental-prefetch |
| C-011 | list | 虚拟化后选择态丢失 | react-admin PR class | evidence/react-admin/list-window-002.md | merged→list-virtualize-window |
| C-012 | list | 无限滚动重复 key | kibana perf PR | evidence/kibana/kibana-list-perf-002.md | merged→list-incremental-prefetch |
| C-013 | form | Save 连点双建 | react-admin SaveButton | evidence/react-admin/form-dup-guard-001.md | merged→form-duplicate-submit-guard |
| C-014 | form | 提交中无 pending 样式 | react-admin SaveButton code | evidence/react-admin/form-dup-guard-002.md | merged→form-duplicate-submit-guard |
| C-015 | form | 远程唯一性校验风暴 | refine hooks | evidence/refine/form-async-validation-001.md | merged→form-async-validation-feedback |
| C-016 | form | 字段级异步状态缺失 | refine useForm | evidence/refine/form-async-validation-002.md | merged→form-async-validation-feedback |
| C-017 | form | mutationMode 误用导致难回滚 | refine docs | evidence/refine/form-submit-recover-001.md | merged→form-submit-recovery |
| C-018 | form | 422 不清空其他字段 | refine PR class | evidence/refine/form-submit-recover-002.md | merged→form-submit-recovery |
| C-019 | state | 乐观更新无失效 | refine invalidate | evidence/refine/mutation-invalidation-001.md | merged→state-optimistic-rollback |
| C-020 | state | invalidate 过宽 | refine hooks | evidence/refine/mutation-invalidation-002.md | merged→state-cache-invalidation |
| C-021 | state | 时间范围切换竞态 | kibana discover | evidence/kibana/kibana-state-002.md | merged→state-stale-response-guard |
| C-022 | state | 插件状态与查询上下文不一致 | kibana docs | evidence/kibana/kibana-state-001.md | merged→state-stale-response-guard |
| C-023 | state | 多标签页脏读 | refine+kibana cross | evidence/refine/dashboard-async-002.md | parked |
| C-024 | state | 局部缓存与 SSR 不一致 | kibana plugin docs | evidence/kibana/kibana-async-001.md | parked |
| C-025 | ux | 单组件错误白屏整页 | kibana issues | evidence/kibana/kibana-error-boundary-003.md | merged→ux-error-boundary-granularity |
| C-026 | ux | 错误边界过细导致噪音 | kibana contributing | evidence/kibana/kibana-error-boundary-001.md | merged→ux-error-boundary-granularity |
| C-027 | ux | Discover 无结果提示弱 | kibana tests | evidence/kibana/kibana-empty-002.md | merged→ux-empty-state-actionable |
| C-028 | ux | 索引模式空数据引导 | kibana discover docs | evidence/kibana/kibana-empty-001.md | merged→ux-empty-state-actionable |
| C-029 | ux | 403 与空数据混淆 | refine Result | evidence/refine/authz-empty-001.md | merged→ux-fallback-recoverable-errors |
| C-030 | ux | 非阻塞错误呈现策略 | refine UI docs | evidence/refine/authz-empty-002.md | merged→ux-fallback-recoverable-errors |
| C-031 | responsive | 侧栏小屏溢出 | refine responsive issues | evidence/refine/refine-responsive-001.md | merged→responsive-mobile-navigation-density |
| C-032 | responsive | 路由+菜单响应式策略 | refine docs | evidence/refine/refine-responsive-002.md | merged→responsive-mobile-navigation-density |
| C-033 | responsive | 长字段名撑破面板 | kibana overflow issues | evidence/kibana/kibana-overflow-001.md | merged→responsive-long-text-overflow |
| C-034 | responsive | dashboard grid minmax | kibana PR | evidence/kibana/kibana-overflow-002.md | merged→responsive-long-text-overflow |
| C-035 | responsive | 仪表卡片加载独立失败 | refine dashboard hooks | evidence/refine/dashboard-async-001.md | merged→responsive-dense-dashboard-layout |
| C-036 | responsive | KPI 优先级折叠 | refine dashboard tests | evidence/refine/dashboard-async-002.md | merged→responsive-dense-dashboard-layout |
