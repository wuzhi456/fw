# Experience Unit 样例

本文件从当前 `frontend-productization/experiences/` 中筛选了 6 条质量较高、适合展示给导师的 Experience Unit。

筛选标准：

1. 优先选择 `confidence: high` 或证据链较强的条目。
2. 覆盖课题核心场景：异步状态、表单鲁棒性、状态一致性、列表性能、空状态体验。
3. 每条都能说明本课题不是复用代码片段，而是从成熟项目中抽象“产品化经验”。
4. 暂不展示当前 evidence audit 中置信度较低的 `ux-error-boundary-granularity` 和 `ux-fallback-recoverable-errors`。

推荐阅读顺序：

1. `state-stale-response-guard`
2. `form-submit-recovery`
3. `form-async-validation-feedback`
4. `state-cache-invalidation`
5. `ux-empty-state-actionable`
6. `list-pagination-server`

---

## 1. 筛选上下文变化时必须丢弃不匹配响应

```yaml
id: state-stale-response-guard
title: "筛选上下文变化时必须丢弃不匹配响应"
category: frontend-productization
tags:
  - "state"
  - "stale"
  - "race"
risk_severity: high
triggers:
  - "搜索框、时间范围、租户切换会改变查询上下文"
risks:
  - "显示与当前筛选不符的数据"
  - "用户基于错误数据决策"
mature_practices:
  - "比较 request token 或查询签名"
  - "在 reducer 层拒绝过期 action"
anti_patterns:
  - "仅依赖最新一次 setState 竞态侥幸"
  - "无上下文签名"
injection:
  plan: "为每次查询定义 query signature。"
  coding: "在数据 hook 返回前比对 signature。"
  review: "检查快速输入与默认值变化。"
  test: "旧响应后到时被忽略。"
verification:
  - "任意时刻 UI 与当前筛选器展示的数据一致"
evidence:
  - "../../evidence/kibana/kibana-state-001.md"
  - "../../evidence/kibana/kibana-state-002.md"
confidence: high
```

### 经验解释

该条目针对“筛选上下文变化时必须丢弃不匹配响应”背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

### 适用边界

适用于以下触发场景：搜索框、时间范围、租户切换会改变查询上下文。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

### 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

### 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由。

---

## 2. 提交失败应保留用户输入并支持安全重试

```yaml
id: form-submit-recovery
title: "提交失败应保留用户输入并支持安全重试"
category: frontend-productization
tags:
  - "form"
  - "error"
  - "recovery"
risk_severity: high
triggers:
  - "多步表单或长表单"
risks:
  - "失败清空用户输入"
  - "用户不敢再次提交"
mature_practices:
  - "保留 draft 与服务器返回字段错误"
  - "区分网络错误与业务错误"
anti_patterns:
  - "失败后 reset 整个表单"
  - "无区分可恢复/不可恢复"
injection:
  plan: "定义失败时哪些字段保留、哪些从服务器覆盖。"
  coding: "错误对象映射到字段；全局 toast 仅作补充。"
  review: "检查部分成功（多资源）场景。"
  test: "模拟 422 字段错误与 500 网络错误。"
verification:
  - "422 时字段级错误保留其他已填内容"
  - "500 时提供重试且不丢草稿"
evidence:
  - "../../evidence/refine/form-submit-recover-001.md"
  - "../../evidence/refine/form-submit-recover-002.md"
confidence: high
```

### 经验解释

该条目针对“提交失败应保留用户输入并支持安全重试”背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

### 适用边界

适用于以下触发场景：多步表单或长表单。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

### 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

### 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由。

---

## 3. 异步校验需要防抖、字段级状态与可达错误

```yaml
id: form-async-validation-feedback
title: "异步校验需要防抖、字段级状态与可达错误"
category: frontend-productization
tags:
  - "form"
  - "validation"
  - "async"
risk_severity: medium
triggers:
  - "邮箱/用户名唯一性等远程校验"
risks:
  - "校验风暴压垮 API"
  - "错误信息不可关联字段"
mature_practices:
  - "防抖与取消上一次校验"
  - "字段旁 inline error"
anti_patterns:
  - "全局 alert 代替字段错误"
  - "无 pending 提示导致用户困惑"
injection:
  plan: "列出需远程校验的字段与触发时机（blur vs change）。"
  coding: "校验请求与字段 key 绑定，卸载时取消。"
  review: "检查 tab 顺序与屏幕阅读器可读性。"
  test: "快速输入序列：仅最后一次结果生效。"
verification:
  - "远程校验进行中字段有轻微 pending 提示"
  - "错误出现在正确字段旁"
evidence:
  - "../../evidence/refine/form-async-validation-001.md"
  - "../../evidence/refine/form-async-validation-002.md"
confidence: high
```

### 经验解释

该条目针对“异步校验需要防抖、字段级状态与可达错误”背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

### 适用边界

适用于以下触发场景：邮箱/用户名唯一性等远程校验。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

### 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

### 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由。

---

## 4. 变更后缓存失效范围应精确且可预测

```yaml
id: state-cache-invalidation
title: "变更后缓存失效范围应精确且可预测"
category: frontend-productization
tags:
  - "state"
  - "cache"
  - "invalidation"
risk_severity: medium
triggers:
  - "仪表板多卡片共享底层查询"
risks:
  - "过宽失效导致全局 refetch"
  - "过窄失效导致脏读"
mature_practices:
  - "按实体与查询键维度失效"
  - "批量变更用事务式 invalidation"
anti_patterns:
  - "任何 mutation 都 invalidate all"
  - "忘记失效导致旧 KPI"
injection:
  plan: "画出实体关系图与查询键命名规则。"
  coding: "封装 invalidate helpers，禁止魔法字符串散落。"
  review: "检查级联删除、多标签页场景。"
  test: "变更后相关卡片更新、无关卡片不抖动。"
verification:
  - "更新后相关列表/统计在单次刷新内一致"
  - "无关组件请求量不明显上升"
evidence:
  - "../../evidence/refine/mutation-invalidation-001.md"
  - "../../evidence/kibana/kibana-state-001.md"
confidence: high
```

### 经验解释

该条目针对“变更后缓存失效范围应精确且可预测”背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

### 适用边界

适用于以下触发场景：仪表板多卡片共享底层查询。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

### 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

### 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由。

---

## 5. 空数据状态应解释原因并给出下一步

```yaml
id: ux-empty-state-actionable
title: "空数据状态应解释原因并给出下一步"
category: frontend-productization
tags:
  - "empty-state"
  - "ux"
risk_severity: medium
triggers:
  - "列表、搜索结果、筛选结果可能为空"
risks:
  - "用户认为系统坏掉"
  - "无路径添加数据或调整筛选"
mature_practices:
  - "区分无数据 vs 无匹配"
  - "提供 CTA 或清除筛选"
anti_patterns:
  - "显示空白表格"
  - "只显示 0 条"
injection:
  plan: "为每类空状态准备文案与 CTA。"
  coding: "空状态组件接收 context: no-data vs no-match。"
  review: "检查权限导致的空与真无数据。"
  test: "空数据与筛选无结果截图/断言。"
verification:
  - "空状态有标题、说明与主按钮或链接"
  - "与加载态明显区分"
evidence:
  - "../../evidence/kibana/kibana-empty-001.md"
  - "../../evidence/kibana/kibana-empty-002.md"
confidence: high
```

### 经验解释

该条目针对“空数据状态应解释原因并给出下一步”背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

### 适用边界

适用于以下触发场景：列表、搜索结果、筛选结果可能为空。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

### 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

### 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由。

---

## 6. 大数据列表应默认走服务端分页与稳定排序

```yaml
id: list-pagination-server
title: "大数据列表应默认走服务端分页与稳定排序"
category: frontend-productization
tags:
  - "list"
  - "pagination"
  - "performance"
risk_severity: high
triggers:
  - "列表可能超过单页合理渲染量"
risks:
  - "一次拉全量导致卡顿或内存飙升"
  - "排序在客户端与服务器不一致"
mature_practices:
  - "使用 limit/offset 或 cursor"
  - "排序字段与索引策略在 API 层明确"
anti_patterns:
  - "useEffect 拉取全部记录再 slice"
  - "无总数字段导致分页控件不可用"
injection:
  plan: "确定分页模型、默认 pageSize、排序字段与空页行为。"
  coding: "列表查询参数与 URL 或状态管理同步，支持深链接。"
  review: "检查边界：第一页、最后一页、变更筛选后页码重置。"
  test: "大页码与空页请求的行为。"
verification:
  - "仅请求当前页数据"
  - "切换排序后数据与表头一致"
evidence:
  - "../../evidence/react-admin/list-pagination-001.md"
  - "../../evidence/react-admin/list-pagination-002.md"
confidence: medium
```

### 经验解释

该条目针对“大数据列表应默认走服务端分页与稳定排序”背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

### 适用边界

适用于以下触发场景：列表可能超过单页合理渲染量。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

### 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

### 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由。
