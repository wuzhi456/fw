---
id: responsive-long-text-overflow
title: 长文本与标识符需要截断、换行或详情展开
category: frontend-productization
tags:
  - responsive
  - overflow
  - typography
  - table
  - chart
risk_severity: medium
triggers:
  - 表格、图表或卡片展示用户生成的长 ID、URL、字段名
  - 密集仪表含维度标签或高基数分类文本
risks:
  - 长字符串撑破列宽导致横向滚动失控
  - 图表轴标签重叠不可读
  - 无障碍场景下纯视觉信息无法消费
mature_practices:
  - 为长文本字段选定 truncate、ellipsis+tooltip 或换行策略之一并统一
  - 图表/仪表在需求阶段规定维度文本最大宽度与截断规则
  - 提供展开详情或复制完整标识符的次级入口
anti_patterns:
  - 无 max-width 让单元格无限撑开
  - 仅依赖 hover 展示全文且无键盘可达替代
  - 密集图表省略全部文本导致无法理解系列含义
injection:
  plan: 列出可能出现长文本的字段及展示策略（截断/换行/展开）。
  coding: 在表格列与图表标签应用 ellipsis、line-clamp 或 title 属性，并保留复制/详情操作。
  review: 用超长 UUID、长域名与长字段名夹具检查是否撑破布局。
  test: 验证截断后 tooltip/展开可读，且窄屏无意外横向溢出。
verification:
  - 超长标识符不撑破父容器或导致整页横向滚动
  - 截断处可通过 tooltip、展开或详情页获取全文
  - 图表密集场景下轴/图例仍可读或有文本替代
evidence:
  - ../../evidence/kibana/kibana-overflow-001.md
  - ../../evidence/kibana/kibana-overflow-002.md
confidence: medium
---

## 经验解释

管理端与可观测性产品常展示索引名、UUID、URL 等高熵长字符串。若单元格或图表标签不做溢出策略，会挤占邻列、破坏网格对齐，并在高数据量可视化中造成重叠。Kibana 相关 issue 从无障碍与 Lens 图表文本模型两侧说明：密集信息场景必须提前规划长文本承载，而非事后加 CSS。

## 适用边界

适用于含表格列、卡片副标题、图表轴/图例的界面。短固定文案、已保证最大宽度的设计系统组件可简化。不替代服务端分页（见 `list-pagination-server`）或虚拟化（见 `list-virtualize-window`）。

## 成熟实践归纳

计划阶段枚举长文本字段与策略；实现层对列与标签统一截断规则并保留获取全文的次级路径；图表需求中要求维度/字段的可读文本模型，满足高密度下的可消费性与 a11y。

## 验收提示

注入超长夹具：表格列宽稳定、无整页横向滚动；hover/点击可查看全文；图表缩窄视口时轴标签不重叠或具备替代文本。与空态/错误态区分，避免把截断误判为无数据。
