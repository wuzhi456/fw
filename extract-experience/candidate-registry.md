# Candidate experience registry (P1)

记录候选经验的触发条件、失败模式与裁决结果，便于审计与复现。

| id | risk_class | triggers | failure_mode | decision | conflict_note |
| --- | --- | --- | --- | --- | --- |
| C-001 | async | 列表首屏加载/无骨架 | 空白/误判无数据 | merge | - |
| C-002 | async | 详情切换/并发请求 | 旧数据覆盖新记录 | merge | - |
| C-003 | async | 全局 QueryClient/多源错误 | 错误提示不一致 | park | 证据弱且与核心 EU 重叠 |
| C-004 | async | 长耗时查询/无取消 | 请求堆积/结果迟到 | merge | - |
| C-005 | async | 自动重试/连续失败 | 重试风暴/限流 | merge | - |
| C-006 | async | 空结果+错误码混用 | 误判成功或空数据 | merge | - |
| C-007 | list | 大列表/客户端排序 | 渲染卡顿 | merge | - |
| C-008 | list | 分页控件/缺 total | 分页错位/跳页异常 | merge | - |
| C-009 | list | 宽表/横向滚动 | 可读性差/操作困难 | merge | - |
| C-010 | list | 字段元数据编辑 | 大量渲染卡顿 | merge | - |
| C-011 | list | 虚拟化/多选 | 选择态丢失 | merge | - |
| C-012 | list | 无限滚动/重复 key | 列表抖动/重渲染 | merge | - |
| C-013 | form | 保存按钮连点 | 重复提交 | merge | - |
| C-014 | form | 提交中无 pending | 用户重复点击 | merge | - |
| C-015 | form | 远程唯一校验 | 校验风暴/卡顿 | merge | - |
| C-016 | form | 字段级异步校验 | 状态不可见 | merge | - |
| C-017 | form | mutationMode/乐观更新 | 失败难回滚 | merge | - |
| C-018 | form | 422 校验错误 | 其他字段未清理 | merge | - |
| C-019 | state | 乐观更新/缓存 | 旧数据停留 | merge | - |
| C-020 | state | invalidate 范围过宽 | 过度刷新 | merge | - |
| C-021 | state | 时间范围切换 | 旧请求覆盖新 | merge | - |
| C-022 | state | 插件状态/上下文 | 状态错位 | merge | - |
| C-023 | state | 多标签页共享缓存 | 跨页脏读 | park | 证据不足且超出 MVP |
| C-024 | state | SSR+局部缓存 | 首屏与客户端不一致 | park | 需要更强主样本证据 |
| C-025 | ux | 局部组件崩溃 | 整页空白 | merge | 证据需补强 |
| C-026 | ux | 错误边界过细 | 噪音提示/难定位 | merge | 证据需补强 |
| C-027 | ux | 无结果提示弱 | 无下一步指引 | merge | - |
| C-028 | ux | 空索引/首次使用 | 缺少引导 | merge | - |
| C-029 | ux | 403/权限失败 | 误解为空数据 | merge | 低置信需替换 |
| C-030 | ux | 可恢复错误 | 误用阻塞弹窗 | merge | 低置信需替换 |
| C-031 | responsive | 小屏侧栏 | 导航遮挡 | merge | - |
| C-032 | responsive | 路由+菜单响应 | 导航混乱 | merge | - |
| C-033 | responsive | 长字段名 | 布局撑破 | merge | - |
| C-034 | responsive | dashboard grid | 容器挤压/断裂 | merge | - |
| C-035 | responsive | 卡片独立加载 | 单卡失败拖累 | merge | - |
| C-036 | responsive | KPI 信息密度 | 关键指标被挤掉 | merge | - |

## GitLab frontend backup（2026-05-22，`B-gl-*`）

| 候选 | GitLab 证据 | 裁决 |
| --- | --- | --- |
| C-013/C-014 | `evidence/gitlab/gitlab-form-dup-guard-001/002` | merge→`form-duplicate-submit-guard`（EU 已增第三/四证） |
| C-025/C-026 | `evidence/gitlab/gitlab-ux-error-boundary-001/002` | merge→`ux-error-boundary-granularity`（换证补强） |
| C-030 | `evidence/gitlab/gitlab-ux-recoverable-errors-001/002` | merge→`ux-fallback-recoverable-errors`（replace refine） |
| C-008/C-012 | `evidence/gitlab/gitlab-list-pagination-001/002` | merge（仅备份，未改 EU 主路径） |
