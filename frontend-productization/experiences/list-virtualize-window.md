---





id: list-virtualize-window
title: "超长列表需要窗口化或虚拟化渲染"
category: frontend-productization
tags:
  - "list"
  - "virtual"
  - "performance"
risk_severity: medium
triggers:
  - "单屏需展示上千行或上千节点"
risks:
  - "滚动掉帧"
  - "初次 mount 过慢"
mature_practices:
  - "虚拟列表或分块渲染"
  - "行高估算与动态高度策略"
anti_patterns:
  - "map 全量渲染"
  - "每次筛选重建全部 DOM"
injection:
  plan: "评估数据规模阈值，决定虚拟化库与行高策略。"
  coding: "分离行组件，避免在滚动热路径上创建大对象。"
  review: "检查滚动条跳动与选中态在窗口化下是否正确。"
  test: "性能冒烟：滚动到末尾时间与内存曲线。"
verification:
  - "在万级行数下仍可交互滚动"
  - "选中/展开状态在滚动后保持正确"
evidence:
  - "../../evidence/react-admin/list-window-001.md"
  - "../../evidence/react-admin/list-window-002.md"
confidence: medium
---

## 经验解释

该条目针对「超长列表需要窗口化或虚拟化渲染」背后的隐性产品化风险：用户在面对真实网络、数据规模与交互节奏时，会暴露成功路径开发无法覆盖的失败与空白体验。

## 适用边界

适用于以下触发场景：单屏需展示上千行或上千节点。纯静态展示、无外部数据或已强约束的小工具可弱化，但仍建议保留最基本的错误兜底。

## 成熟实践归纳

成熟开源产品倾向把状态与反馈外显化，并把恢复路径设计为一等公民，而不是事后补文案。证据见 `evidence/` 下两条记录的路径与摘要。

## 验收提示

评审或自检时，逐条对照 YAML `verification` 列表；若任务场景不适用，必须在评审记录中写明 `N/A` 理由（与 `rubric.md` 一致）。
