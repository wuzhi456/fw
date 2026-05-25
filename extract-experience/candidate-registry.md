# Candidate experience registry (P1)

记录候选经验的触发条件、失败模式与裁决结果，便于审计与复现。

| id | risk_class | triggers | failure_mode | decision | conflict_note |
| --- | --- | --- | --- | --- | --- |
| C-001 | async | 列表首屏加载/无骨架 | 空白/误判无数据 | add | 晋升 `async-explicit-states`（B-ra-async-1-r20260525） |
| C-002 | async | 详情切换/并发请求 | 旧数据覆盖新记录 | add | 晋升 `async-stale-cancel`（B-ra-async-2-r20260525） |
| C-003 | async | 全局 QueryClient/多源错误 | 错误提示不一致 | park | 证据弱且与核心 EU 重叠 |
| C-004 | async | 长耗时查询/无取消 | 请求堆积/结果迟到 | add | 合并入 `async-stale-cancel`（与 C-002 同 EU） |
| C-005 | async | 自动重试/连续失败 | 重试风暴/限流 | add | 晋升 `async-retry-recover`（Admin queryClient retry 配置） |
| C-006 | async | 空结果+错误码混用 | 误判成功或空数据 | add | 合并入 `async-explicit-states`（ListView error≠empty 分支） |
| C-007 | list | 大列表/客户端排序 | 渲染卡顿 | add | 合并入 `list-virtualize-window`（#8075 freeze；B-ra-list-1-r20260525） |
| C-008 | list | 分页控件/缺 total | 分页错位/跳页异常 | add | 晋升 `list-pagination-server`（List.md total 契约；B-ra-list-1-r20260525） |
| C-009 | list | 宽表/横向滚动 | 可读性差/操作困难 | merge | - |
| C-010 | list | 字段元数据编辑 | 大量渲染卡顿 | park | 与 incremental prefetch 部分重叠但 evidence 弱；#134306 已覆盖 lazy load |
| C-011 | list | 虚拟化/多选 | 选择态丢失 | park | 超出 MVP；`list-virtualize-window` 已覆盖 freeze failure mode |
| C-012 | list | 无限滚动/重复 key | 列表抖动/重渲染 | add | 晋升 `list-incremental-prefetch`（#134306+#152311；B-kb-list-1-r20260525） |
| C-013 | form | 保存按钮连点 | 重复提交 | add | 晋升 `form-duplicate-submit-guard`（B-ra-form-1-r20260525；C-014 合并同 EU） |
| C-014 | form | 提交中无 pending | 用户重复点击 | merge | 合并入 `form-duplicate-submit-guard`（SaveButton saving/pending） |
| C-015 | form | 远程唯一校验 | 校验风暴/卡顿 | add | 合并入 `form-async-validation-feedback`（#2955+useForm docs；B-rf-form-1-r20260525） |
| C-016 | form | 字段级异步校验 | 状态不可见 | merge | 合并入 `form-async-validation-feedback`（与 C-015 同 EU） |
| C-017 | form | mutationMode/乐观更新 | 失败难回滚 | add | 晋升 `form-submit-recovery`（useUpdate+#3657；B-rf-form-2-r20260525） |
| C-018 | form | 422 校验错误 | 其他字段未清理 | merge | 合并入 `form-submit-recovery`（422 字段映射与 recovery 同 EU 验收） |
| C-019 | state | 乐观更新/缓存 | 旧数据停留/undefined patch | add | 晋升 `state-optimistic-rollback`（B-rf-state-1-r20260525；form-submit-recover-001/002 复用） |
| C-020 | state | invalidate 范围过宽/过窄 | 过度刷新或脏读 | add | 晋升 `state-cache-invalidation`（B-rf-state-1-r20260525；mutation-invalidation-001/002 复用） |
| C-021 | state | 时间范围切换 | 旧请求覆盖新 | add | 晋升 `state-stale-response-guard`（B-kb-state-1-r20260525；#129020） |
| C-022 | state | 插件状态/上下文 | 状态错位/过期 toast | add | 合并入 `state-stale-response-guard`（#149488 inline 错误与上下文绑定） |
| C-023 | state | 多标签页共享缓存 | 跨页脏读 | park | 证据不足且超出 MVP |
| C-024 | state | SSR+局部缓存 | 首屏与客户端不一致 | park | 需要更强主样本证据 |
| C-025 | ux | 局部组件崩溃 | 整页空白 | add | 晋升 `ux-error-boundary-granularity`（B-kb-err-1-r20260525+#139710；B-gl-ux-1-r20260525 epic/6359） |
| C-026 | ux | 错误边界过细 | 噪音提示/难定位 | add | 合并入 `ux-error-boundary-granularity`（#381151 partial + #153457 embeddable 定位） |
| C-027 | ux | 无结果提示弱 | 无下一步指引 | add | 晋升 `ux-empty-state-actionable`（B-kb-empty-1-r20260525；#79671 error≠empty） |
| C-028 | ux | 空索引/首次使用 | 缺少引导 | add | 合并入 `ux-empty-state-actionable`（#128754 可操作建议） |
| C-029 | ux | 403/权限失败 | 误解为空数据 | merge | 低置信需替换 |
| C-030 | ux | 可恢复错误 | 误用阻塞弹窗 | add | 晋升 `ux-fallback-recoverable-errors`（B-gl-ux-1-r20260525；#381151+RFC#94 换证） |
| C-031 | responsive | 小屏侧栏/菜单与标题 | 层叠不可点/导航遮挡 | add | 晋升 `responsive-mobile-navigation-density`（B-rf-resp-1-r20260525；#6323+router docs） |
| C-032 | responsive | 路由+菜单响应式策略 | 窄屏导航模式未定义 | merge | 合并入 `responsive-mobile-navigation-density`（refine-responsive-002） |
| C-033 | responsive | 长字段名/图表标签 | 布局撑破/轴重叠 | add | 晋升 `responsive-long-text-overflow`（B-kb-overflow-1-r20260525；#36386+#221577） |
| C-034 | responsive | 高数据量可视化文本 | 纯视觉不可读 | merge | 合并入 `responsive-long-text-overflow`（与 C-033 同 EU） |
| C-035 | responsive | 密集仪表多卡片查询 | 空白挤塌网格/单卡拖累 | add | 晋升 `responsive-dense-dashboard-layout`（B-rf-resp-1-r20260525；dashboard-async-001/002 复用） |
| C-036 | responsive | KPI 优先级/多查询 refetch | 小屏 KPI 被挤没/状态错位 | merge | 合并入 `responsive-dense-dashboard-layout`（#4896 invalidate 测试） |

## GitLab frontend backup（2026-05-22，`B-gl-*`）

| 候选 | GitLab 证据 | 裁决 |
| --- | --- | --- |
| C-013/C-014 | `evidence/gitlab/gitlab-form-dup-guard-001/002` | merge→`form-duplicate-submit-guard`（EU 已增第三/四证） |
| C-025/C-026 | `evidence/gitlab/gitlab-ux-error-boundary-001/002` + kibana 002/003 | add→`ux-error-boundary-granularity`（Gate E 2026-05-25） |
| C-030 | `evidence/gitlab/gitlab-ux-recoverable-errors-001/002` | add→`ux-fallback-recoverable-errors`（replace refine；Gate E 2026-05-25） |
| C-008/C-012 | `evidence/gitlab/gitlab-list-pagination-001/002` | merge（仅备份，未改 EU 主路径） |
