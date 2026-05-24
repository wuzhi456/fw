# Extraction notes (P1)

## Batch policy

- Each batch: one risk class × one main sample maximum scope; cap Issue/PR screen to 10 candidates per class before human distill (per plan §5 P1).
- Evidence files store short summaries only; immutable ref pins repository `HEAD` at `2026-05-12T12:00:00Z` via `git ls-remote` SHAs (drift possible; re-pin before publication if required).

## Batch log

| batch_id | query / lens | scope | cap | selected | include_reason | exclude_reason |
| --- | --- | --- | --- | --- | --- | --- |
| B-ra-async-1 | async state admin list | react-admin docs+core | 10 | async-explicit-states-001/002 | 覆盖 loading/error/empty 核心模式，文档+代码可追溯 | 同类条目重复或仅描述 API |
| B-ra-async-2 | race cancel stale | react-admin actions+tests | 10 | async-stale-cancel-001/002 | 文档+单测提及刷新与非成功路径 | 缺少明确竞态/取消语义 |
| B-ra-async-3 | retry + notifications | react-admin docs+issues | 10 | async-retry-001/002 | Issue 直指通知/重试问题 | 仅日志或非用户可见错误 |
| B-ra-list-1 | pagination | react-admin list docs+ui | 10 | list-pagination-001/002 | 明确服务端分页语义 | 仅 API 示例或缺 total |
| B-ra-list-2 | virtualization perf | react-admin datagrid+PR class | 10 | list-window-001/002 | 文档+Issue 覆盖大列表性能 | 与列表渲染风险弱相关 |
| B-rf-form-1 | remote validation | refine docs+hooks | 10 | form-async-validation-001/002 | 异步校验与错误展示直连 | 仅同步校验或非表单 |
| B-rf-form-2 | mutation modes | refine docs+PR class | 10 | form-submit-recover-001/002 | mutation 模式与回滚修复 | 仅 API 变更说明 |
| B-rf-state-1 | invalidate hooks | refine documentation | 10 | mutation-invalidation-001/002 | invalidate 策略与缓存失效明确 | 仅缓存介绍无失效策略 |
| B-rf-dash-1 | dashboard hooks | refine docs+tests | 10 | dashboard-async-001/002 | dashboard 异步 hooks + 失效 PR | 仅 UI 组件样式 |
| B-rf-ux-1 | Result/empty patterns | refine UI docs | 10 | authz-empty-001/002 | 空状态/可恢复错误语义 | 纯 UI 介绍无风险说明 |
| B-rf-resp-1 | responsive admin | refine issues+router docs | 10 | refine-responsive-001/002 | issue+路由策略覆盖移动适配 | 仅主题配置或样式 |
| B-kb-async-1 | long discover queries | kibana docs+issues | 10 | kibana-async-001/002 | Discover 查询与空态异常 | 仅索引配置 |
| B-kb-list-1 | field list perf | kibana code+PR class | 10 | kibana-list-perf-001/002 | PR 体现列表性能/内联错误 | 仅可视化文案 |
| B-kb-err-1 | error boundaries | kibana docs+issues | 10 | kibana-error-boundary-001/002/003 | Issue+PR 覆盖边界拆分与调试 | 仅 dev 指南或弱相关 |
| B-kb-empty-1 | empty states | kibana discover tests/docs | 10 | kibana-empty-001/002 | PR 明确空结果/错误提示 | 仅测试或无 UI 反馈 |
| B-kb-overflow-1 | layout overflow | kibana issues+PR class | 10 | kibana-overflow-001/002 | issues 讨论溢出与可读性 | 仅功能需求 |
| B-kb-state-1 | stale async context | kibana docs+issues | 10 | kibana-state-001/002 | issues 描述上下文与错误提示 | 仅运维/配置讨论 |
| B-gl-ux-1 | error alerts + ErrorBoundary epic | gitlab issues+epic | 10 | gitlab-ux-recoverable-errors-001/002, gitlab-ux-error-boundary-001/002 | #381151 与 epic/6359 可核验；RFC#94 作 partial 补证 | 纯后端 500、与前端反馈无关的 issue |
| B-gl-form-1 | MR submit loading / dup click | gitlab MR+code | 10 | gitlab-form-dup-guard-001/002 | !232653 merged + issuable_form.js 钉选 SHA | 服务端重复 merge（#276919）无前端 pending 语义 |
| B-gl-list-1 | GLQL load more / infinite scroll | gitlab issue+MR | 10 | gitlab-list-pagination-001/002 | 用户可见分页/滚载失败 | GitHub import 后端分页（#548950） |

## Extraction limitations

- Verifier 已于 2026-05-12 将 P1 evidence 中占位 Issue/PR 号替换为 GitHub 可打开的真实编号（见 `docs/verification-spotcheck-2026-05-12.md` 附录）；后续若 claim 与编号语义漂移，应更新摘要而非改回占位符。
- GitLab frontend 在 MVP 主样本中仍为备份（`sample-selection.md`）；2026-05-22 批次 `B-gl-*` 为 Week 1 watchlist 换证与 list 备份证据，immutable_ref 钉选 `4893c18f7ac74048afa35976b65261cd8c8e46b0`（`git ls-remote`）。

## Handoff to P2

- Candidates consolidated into **18** Experience Units (six risk classes × three units each).
- Parked candidates (`C-023`, `C-024`, `C-003`) remain in `experience-candidates.md` without dedicated EU files.
