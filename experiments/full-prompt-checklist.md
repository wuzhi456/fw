# Full Prompt checklist (control group)

Frozen concatenation of Plan-stage injections for all Experience Units.
Do not edit during a locked experiment batch; log deviations in `experiment-protocol.md` §12.

### async-explicit-states: 异步请求必须显式建模用户可感知状态
- Plan: 在计划中写明列表/详情请求的 loading、empty、error、retry 行为与文案。

### async-retry-recover: 可恢复错误应提供重试与降级路径
- Plan: 列出 4xx/5xx/超时各自的用户文案与重试策略。

### async-stale-cancel: 并发与导航场景下应取消或忽略过期请求
- Plan: 定义路由/筛选变化时的请求生命周期：取消、忽略或序列化。

### form-async-validation-feedback: 异步校验需要防抖、字段级状态与可达错误
- Plan: 列出需远程校验的字段与触发时机（blur vs change）。

### form-duplicate-submit-guard: 表单提交必须防重复点击与重复 mutation
- Plan: 写清幂等策略：前端防抖、后端 token 或自然键约束。

### form-submit-recovery: 提交失败应保留用户输入并支持安全重试
- Plan: 定义失败时哪些字段保留、哪些从服务器覆盖。

### list-incremental-prefetch: 列表与无限滚动需要受控的增量加载与背压
- Plan: 定义触底阈值、最大预取深度与错误重试。

### list-pagination-server: 大数据列表应默认走服务端分页与稳定排序
- Plan: 确定分页模型、默认 pageSize、排序字段与空页行为。

### list-virtualize-window: 超长列表需要窗口化或虚拟化渲染
- Plan: 评估数据规模阈值，决定虚拟化库与行高策略。

### responsive-dense-dashboard-layout: 数据密集仪表需自适应网格与最小宽度策略
- Plan: 定义小屏下卡片堆叠顺序与隐藏规则。

### responsive-long-text-overflow: 长文本与标识符需要截断、换行或详情展开
- Plan: 列出长文本字段的展示策略。

### responsive-mobile-navigation-density: 管理后台在窄屏应调整导航密度与可达性
- Plan: 定义断点与导航模式切换。

### state-cache-invalidation: 变更后缓存失效范围应精确且可预测
- Plan: 画出实体关系图与查询键命名规则。

### state-optimistic-rollback: 乐观更新必须可回滚且与权限一致
- Plan: 列出允许乐观的操作清单与回滚数据源。

### state-stale-response-guard: 筛选上下文变化时必须丢弃不匹配响应
- Plan: 为每次查询定义 query signature。

### ux-empty-state-actionable: 空数据状态应解释原因并给出下一步
- Plan: 为每类空状态准备文案与 CTA。

### ux-error-boundary-granularity: 错误边界粒度应平衡隔离与信息密度
- Plan: 划分边界层级与降级组件清单。

### ux-fallback-recoverable-errors: 可恢复错误应通过非阻塞反馈呈现
- Plan: 分级错误呈现策略表。
