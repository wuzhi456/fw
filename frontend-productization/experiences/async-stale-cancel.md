---
id: async-stale-cancel
title: 并发与导航场景下应取消或忽略过期请求
category: frontend-productization
tags:
  - async
  - race
  - cancellation
  - stale
risk_severity: high
triggers:
  - 筛选、分页或路由切换会触发多次请求
  - 详情 id 快速切换或连点翻页
risks:
  - 旧请求晚到覆盖新结果
  - 用户看到闪烁或错误数据
mature_practices:
  - 在上下文变化时中止 fetch 或忽略过期 promise 结果
  - 为每次请求绑定 request id 或 query key 序列
  - 在控制器层修复竞态，而非禁用交互
anti_patterns:
  - 无差别 setState 最后一次响应
  - 路由已离开仍更新页面状态
  - 用禁用分页按钮代替竞态处理
injection:
  plan: 定义路由/筛选变化时的请求生命周期：取消、忽略或序列化；写明乱序响应验收场景。
  coding: 使用 AbortController、React Query queryKey 或等价机制；在 effect cleanup 中 abort；比较 response token 再 commit。
  review: 检查竞态窗口：快速连点筛选、分页回退、详情 id 连切。
  test: 模拟乱序响应：旧响应后返回，断言 UI 仍匹配最新查询参数。
verification:
  - 快速切换筛选后 UI 与最后一次查询一致
  - 连点分页不会回跳到非预期页码
  - 无不可解释的短暂回跳或旧记录闪现
evidence:
  - ../../evidence/react-admin/async-stale-cancel-001.md
  - ../../evidence/react-admin/async-stale-cancel-002.md
confidence: high
---

## 经验解释

与「首屏 loading/error/empty 不可见」不同，竞态问题发生在**同一视图内参数连续变化**：用户已切换到 page 3，但 page 1 的慢响应最后到达并把列表写回。react-admin #4658 与修复 PR #4718 表明这是框架级产品化缺陷，而非个别 API 慢就能接受。

## 适用边界

适用于筛选、分页、排序、路由参数变化会重新 fetch 的列表/详情页。一次性加载、无参数变化的静态资源不适用。若已用 React Query 且 queryKey 随参数变化，仍需确认未手动绕过缓存写入旧 data。

## 成熟实践归纳

Issue 提供用户可见 failure mode；修复 PR 表明成熟做法是在 List 控制器层序列化或丢弃乱序 getList 结果，而不是让用户等待或禁用 next 按钮。

## 验收提示

在 devtools 节流网络下快速连点分页/切换筛选，记录最后一次 query 参数；全部请求完成后 UI 必须与该参数一致，且中间态不得长时间展示已被 supersede 的数据。
