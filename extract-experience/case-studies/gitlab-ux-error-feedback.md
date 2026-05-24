# Case study: gitlab-ux-error-feedback

## 链路概览

GitLab issue/RFC evidence -> candidate claim -> existing Experience Unit retrofit -> audit decision

## Evidence

- `evidence/gitlab/gitlab-ux-recoverable-errors-001.md`: GitLab issue `#381151` 描述多个 UI 组件加载失败时重复展示大量告警，直接支撑“可恢复或局部失败应合并/去重非阻塞反馈”。
- `evidence/gitlab/gitlab-ux-recoverable-errors-002.md`: GitLab frontend RFC `#94` 说明将用户可见反馈与错误记录分层，作为统一错误处理策略的补充证据。

## Candidate claim

可恢复或局部前端失败不应在页面上堆叠重复 alert/modal；应通过统一 helper 做错误序列化、去重、记录，并按严重度选择非阻塞反馈或更强打断。

## Experience Unit retrofit

- EU: `frontend-productization/experiences/ux-fallback-recoverable-errors.md`
- 触发: 后台保存、自动同步、局部组件加载失败、多个请求并发失败。
- 风险: toast/alert 噪音、用户忽略关键失败、modal 打断主流程。
- 成熟实践: 非阻塞反馈去重、关键失败升级呈现、错误记录与用户提示分层。

## Gate B/E result

- Gate B: 通过。`#381151` 可打开且为 verified；RFC 页面可打开但为 archived-readonly，因此作为 partial 补证。
- Gate E: 通过。EU 有两条 GitLab evidence，其中 `gitlab-ux-recoverable-errors-001` 为 strong/high，满足至少一条强证据要求。

## Audit decision

- evidence strength: **strong + partial**。
- decision: **replaced**。移除原 refine 低置信证据，改用 GitLab issue/RFC 支撑，EU 置信度从 low 提升为 medium。
- caveat: 若未来要把该 EU 提升为 high，应再补一条 merged MR 或代码路径，证明统一 helper 在真实提交中落地。
