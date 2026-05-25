---
id: list-virtualize-window
title: 超长列表需要窗口化或虚拟化渲染
category: frontend-productization
tags:
  - list
  - virtualization
  - performance
  - datagrid
risk_severity: high
triggers:
  - 单页行数可能达到数百至数千
  - 表格列数较多或单元格渲染成本高
  - 用户报告滚动/交互时界面冻结
risks:
  - 全量 DOM 行导致主线程长时间阻塞
  - 滚动掉帧使用户误以为数据未加载
  - 内存占用随行数线性增长引发 tab 崩溃
mature_practices:
  - 超过阈值启用虚拟列表/虚拟表格，仅渲染视口窗口
  - 与服务端分页组合：每页行数可控 + 页内虚拟化
  - 固定或预估行高，避免 scroll 测量抖动
anti_patterns:
  - 默认 Datagrid/Table 渲染全量 rows
  - 仅加 CSS overflow 而不减少 DOM 节点
  - 虚拟化后忽略 row key 稳定导致滚动闪烁
injection:
  plan: 评估数据规模阈值，决定虚拟化库、行高策略与服务端分页是否并用。
  coding: 引入 windowing（react-window/react-virtualized 等）或框架 optimized 模式；稳定 rowKey。
  review: 检查千级 rows 场景下 DOM 节点数是否仍与总行数成正比。
  test: 1000+ 行夹具下滚动 FPS、选中/展开交互与首屏可交互时间。
verification:
  - 千级行列表滚动时主线程无明显 long task 尖峰
  - 视口外 rows 不在 DOM 中全量挂载（或等价 optimized）
  - 快速滚动无大面积空白块或行内容错位
evidence:
  - ../../evidence/react-admin/list-window-001.md
  - ../../evidence/react-admin/list-window-002.md
confidence: medium
---

## 经验解释

列表产品化失败常表现为「能出数据但界面冻住」。react-admin #8075 报告数千行 Datagrid 导致屏幕冻结，维护者指向虚拟化表格——说明问题根因是**渲染架构**（O(n) DOM），而非单纯网络慢。Datagrid 文档的性能提示与 issue 的用户可见 freeze 构成文档+issue 证据对。

## 适用边界

适用于长列表/宽表在同一视口内滚动浏览的场景。已严格服务端分页且每页 ≤50 行、列数少时可不虚拟化。与 `list-pagination-server` 可并用：分页控规模，虚拟化控页内 DOM。

## 成熟实践归纳

成熟项目在大数据列表上默认 windowing：只 mount 可见行 + overscan buffer；必要时配合 optimized row renderer。Issue 侧 failure mode 为 freeze；文档侧给出列约束与性能选项作为预防性实践。

## 验收提示

Performance 面板录制 2000 行夹具滚动：DOM 节点数不应≈2000×列数；长 task >200ms 应显著少于全量渲染基线。快速 flick scroll 不应出现 persistent 空白块（若出现，检查 virtualizer 与 scroll container 高度契约）。
