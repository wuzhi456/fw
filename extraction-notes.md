# Extraction notes (P1)

## Batch policy

- Each batch: one risk class × one main sample maximum scope; cap Issue/PR screen to 10 candidates per class before human distill (per plan §5 P1).
- Evidence files store short summaries only; immutable ref pins repository `HEAD` at `2026-05-12T12:00:00Z` via `git ls-remote` SHAs (drift possible; re-pin before publication if required).

## Batch log

| batch_id | query / lens | scope | cap | selected | include_reason | exclude_reason |
| --- | --- | --- | --- | --- | --- | --- |
| B-ra-async-1 | async state admin list | react-admin docs+core | 10 | async-explicit-states-001/002 | 覆盖 loading/error/empty 核心模式，文档+代码可追溯 | 同类条目重复或仅描述 API |
| B-ra-async-1-r20260525 | `loading error empty list show` + `ListView ShowView isPending errorState` | react-admin `docs/List.md` + `packages/ra-ui-materialui/src/list|detail/` | 10 | async-explicit-states-001/002/003 | List/Show 文档+ListView/ShowView 源码直接编码 loading/error/empty 分支；换证空 DataFetchingGuide | Issue 初筛 #10892 #11243 #11242 #8801 #10835 #11018 #10813 #10941 #4658 #9876：竞态/notify/retry 留 B-ra-async-2/3，#8801 留 issue 批次 |
| B-ra-async-2 | race cancel stale | react-admin actions+tests | 10 | async-stale-cancel-001/002 | 文档+单测提及刷新与非成功路径 | 缺少明确竞态/取消语义 |
| B-ra-async-2-r20260525 | `race stale cancel pagination filter` + `#4658 #4718` | react-admin List 竞态 issue+PR | 10 | async-stale-cancel-001/002 | #4658 用户可见乱序覆盖 + #4718 框架修复；换证 Actions.md/spec | #8801 归 ux/error 批次；#7622 重复 pagination 排除 |
| B-ra-async-3 | retry + notifications | react-admin docs+issues | 10 | async-retry-001/002 | Issue 直指通知/重试问题 | 仅日志或非用户可见错误 |
| B-ra-async-3-r20260525 | `notify retry queryClient onError` + `#10180 Admin.md` | react-admin issue+docs | 10 | async-retry-001/002 | #10180 notify 链路 gap + Admin queryClient retry 默认/配置 | 纯后端 500、与前端恢复无关 issue 排除 |
| B-ra-list-1 | pagination | react-admin list docs+ui | 10 | list-pagination-001/002 | 明确服务端分页语义 | 仅 API 示例或缺 total |
| B-ra-list-1-r20260525 | `pagination sort total List Datagrid` + `docs/List.md` + `packages/ra-ui-materialui/src/list/` | react-admin list docs+code | 10 | list-pagination-001/002, list-window-001/002 | List.md total 契约+List 控制器+#8075 freeze；晋升 pagination-server + virtualize-window | Issue 初筛 #8075 #7622 #8801：竞态归 async；宽表-only 归 responsive |
| B-ra-list-2 | virtualization perf | react-admin datagrid+PR class | 10 | list-window-001/002 | 文档+Issue 覆盖大列表性能 | 与列表渲染风险弱相关 |
| B-rf-form-1 | remote validation | refine docs+hooks | 10 | form-async-validation-001/002 | 异步校验与错误展示直连 | 仅同步校验或非表单 |
| B-rf-form-2 | mutation modes | refine docs+PR class | 10 | form-submit-recover-001/002 | mutation 模式与回滚修复 | 仅 API 变更说明 |
| B-ra-form-1-r20260525 | `SaveButton saving pending duplicate submit` + `docs/Forms.md` + `SaveButton.tsx` | react-admin form docs+code | 10 | form-dup-guard-001/002 | Forms 提交契约+SaveButton 读 saving 禁用；晋升 form-duplicate-submit-guard | Issue 初筛 #8801 #10180：归 async/ux；GitLab B-gl-form-1 备份未入主路径 |
| B-rf-form-1-r20260525 | `async validation server side useForm` + `#2955` + useForm docs | refine form docs+hooks | 10 | form-async-validation-001/002 | #2955 服务端校验示例缺口+useForm async validate 文档；晋升 form-async-validation-feedback | 纯 MUI 样式、无字段级错误语义 issue 排除 |
| B-rf-form-2-r20260525 | `mutationMode optimistic rollback useUpdate` + `#3657` | refine form mutation docs+PR | 10 | form-submit-recover-001/002 | useUpdate mutationMode 文档+#3657 optimistic list 回滚修复；晋升 form-submit-recovery | 仅 cache key 重构、无用户可见失败路径 PR 排除 |
| B-rf-state-1 | invalidate hooks | refine documentation | 10 | mutation-invalidation-001/002 | invalidate 策略与缓存失效明确 | 仅缓存介绍无失效策略 |
| B-rf-dash-1 | dashboard hooks | refine docs+tests | 10 | dashboard-async-001/002 | dashboard 异步 hooks + 失效 PR | 仅 UI 组件样式 |
| B-rf-ux-1 | Result/empty patterns | refine UI docs | 10 | authz-empty-001/002 | 空状态/可恢复错误语义 | 纯 UI 介绍无风险说明 |
| B-rf-resp-1 | responsive admin | refine issues+router docs | 10 | refine-responsive-001/002 | issue+路由策略覆盖移动适配 | 仅主题配置或样式 |
| B-kb-async-1 | long discover queries | kibana docs+issues | 10 | kibana-async-001/002 | Discover 查询与空态异常 | 仅索引配置 |
| B-kb-list-1 | field list perf | kibana code+PR class | 10 | kibana-list-perf-001/002 | PR 体现列表性能/内联错误 | 仅可视化文案 |
| B-kb-list-1-r20260525 | `field list performance infinite scroll` + Discover field list issues+PR | kibana list perf / Discover field list | 10 | kibana-list-perf-001/002 | #134306 lazy scroll 分页+#152311 toast 背压；晋升 list-incremental-prefetch | 初筛 #106163 render tags、#146063 sticky UX、#247513 trace virtualizer：failure mode 不重叠或归 virtualize；#152159 跟进 lazy load |
| B-kb-err-1 | error boundaries | kibana docs+issues | 10 | kibana-error-boundary-001/002/003 | Issue+PR 覆盖边界拆分与调试 | 仅 dev 指南或弱相关 |
| B-kb-empty-1 | empty states | kibana discover tests/docs | 10 | kibana-empty-001/002 | PR 明确空结果/错误提示 | 仅测试或无 UI 反馈 |
| B-kb-overflow-1 | layout overflow | kibana issues+PR class | 10 | kibana-overflow-001/002 | issues 讨论溢出与可读性 | 仅功能需求 |
| B-kb-state-1 | stale async context | kibana docs+issues | 10 | kibana-state-001/002 | issues 描述上下文与错误提示 | 仅运维/配置讨论 |
| B-gl-ux-1 | error alerts + ErrorBoundary epic | gitlab issues+epic | 10 | gitlab-ux-recoverable-errors-001/002, gitlab-ux-error-boundary-001/002 | #381151 与 epic/6359 可核验；RFC#94 作 partial 补证 | 纯后端 500、与前端反馈无关的 issue |
| B-gl-form-1 | MR submit loading / dup click | gitlab MR+code | 10 | gitlab-form-dup-guard-001/002 | !232653 merged + issuable_form.js 钉选 SHA | 服务端重复 merge（#276919）无前端 pending 语义 |
| B-gl-list-1 | GLQL load more / infinite scroll | gitlab issue+MR | 10 | gitlab-list-pagination-001/002 | 用户可见分页/滚载失败 | GitHub import 后端分页（#548950） |
| B-ra-form-1-r20260525 | `SaveButton saving pending duplicate submit` + `docs/Forms.md` + `SaveButton.tsx` | react-admin form docs+code | 10 | form-dup-guard-001/002 | Forms 文档约定+SaveButton 读取 saving 禁用；复用 P0 evidence 重过 B+E | Issue 初筛无更强独立 failure mode；GitLab !232653 留 backup |
| B-rf-form-1-r20260525 | `async validation server side useForm` + `#2955` + use-form docs | refine form docs+hooks | 10 | form-async-validation-001/002 | Issue 追踪 MUI 服务端校验示例+useForm async validate 文档；晋升 async-validation-feedback | 纯同步校验、非表单 scope 排除 |
| B-rf-form-2-r20260525 | `mutationMode optimistic rollback useUpdate` + `#3657` | refine form docs+PR | 10 | form-submit-recover-001/002 | useUpdate mutationMode 文档+#3657 optimistic list 回滚修复；晋升 submit-recovery | 仅 API 变更说明、无用户可见 recovery 排除 |
| B-rf-state-1-r20260525 | `useInvalidate mutationMode optimistic rollback invalidate` + useInvalidate/useUpdate/useForm docs | refine state docs+hooks | 10 | mutation-invalidation-001/002, form-submit-recover-001/002 | useInvalidate 失效策略+useUpdate/#3657 optimistic 回滚；晋升 state-optimistic-rollback + state-cache-invalidation | 仅 cache key 重构 PR、无 invalidate 语义 docs 排除 |
| B-kb-state-1-r20260525 | `Discover stale context time range race inline error` + `#149488 #129020` | kibana Discover state issues | 10 | kibana-state-001/002 | #149488 多 fetch 内联错误+#129020 无匹配索引 callout；晋升 state-stale-response-guard | 运维/配置-only issue、无用户可见上下文竞态排除 |
| B-kb-err-1-r20260525 | `error boundary embeddable blank page` + `#139710 #153457` | kibana ux issue+PR | 10 | kibana-error-boundary-002/003 | #139710 整页空白拆分边界+#153457 embeddable 失败定位；晋升 ux-error-boundary-granularity | CONTRIBUTING-001 weak 不单独 add；与 empty/recoverable failure mode 不重叠 |
| B-kb-empty-1-r20260525 | `Discover empty no results fallback message` + `#128754 #79671` | kibana Discover empty PR | 10 | kibana-empty-001/002 | #128754 可操作建议+#79671 区分 error vs empty；晋升 ux-empty-state-actionable | 仅测试无 UI、与 async empty 分支重复 PR 排除 |
| B-gl-ux-1-r20260525 | `#381151 excessive alerts` + `epic/6359 ErrorBoundary` + RFC#94 | gitlab ux issue+epic | 10 | gitlab-ux-error-boundary-001/002, gitlab-ux-recoverable-errors-001/002 | #381151 堆叠告警+epic 边界规划；晋升 ux-error-boundary-granularity + ux-fallback-recoverable-errors | 纯后端 500、Sentry-only 无用户反馈 issue 排除 |
| B-rf-resp-1-r20260525 | `mobile menu sidebar overlap dashboard grid` + `#6323` + router-provider docs + dashboard-async | refine responsive issue+docs | 10 | refine-responsive-001/002, dashboard-async-001/002 | #6323 菜单标题重叠+路由布局文档；useList 卡级状态+#4896 多查询测试；晋升 mobile-navigation-density + dense-dashboard-layout | 初筛仅主题/样式、无用户可见 layout failure 排除 |
| B-kb-overflow-1-r20260525 | `overflow long text chart label truncate` + `#36386 #221577` | kibana responsive overflow issues | 10 | kibana-overflow-001/002 | 高数据量图表 a11y+#221577 维度文本模型；晋升 responsive-long-text-overflow | 纯功能需求无布局失败、与 list perf 不重叠 issue 排除 |

## Extraction limitations

- Verifier 已于 2026-05-12 将 P1 evidence 中占位 Issue/PR 号替换为 GitHub 可打开的真实编号（见 `docs/verification-spotcheck-2026-05-12.md` 附录）；后续若 claim 与编号语义漂移，应更新摘要而非改回占位符。
- GitLab frontend 在 MVP 主样本中仍为备份（`sample-selection.md`）；2026-05-22 批次 `B-gl-*` 为 Week 1 watchlist 换证与 list 备份证据，immutable_ref 钉选 `4893c18f7ac74048afa35976b65261cd8c8e46b0`（`git ls-remote`）。

## Handoff to P2

- Candidates consolidated into **18** Experience Units (six risk classes × three units each); responsive 3/3 晋升完成 2026-05-25（`B-rf-resp-1-r20260525` + `B-kb-overflow-1-r20260525`）。
- Parked candidates (`C-023`, `C-024`, `C-003`) remain in `experience-candidates.md` without dedicated EU files.
