# Semantic vs Deterministic Report (task-ecommerce-checkout)

## 任务背景
- 任务：task-ecommerce-checkout（未在 cue 词典中显式出现 form/list 关键词）
- 阶段：plan

## 结果对比

### Deterministic
- 结果文件：experiments/routing/router-output-task-ecommerce-checkout.json
- 选中 EU：无
- 原因：任务文本无可触发的词面 cue，导致候选为空。

### Semantic (Dense + BM25)
- 结果文件：experiments/routing/router-output-task-ecommerce-checkout-semantic.json
- 选中 EU：
  - form-submit-recovery
  - ux-fallback-recoverable-errors
- 解释：密集向量把“checkout / submit / payment”的语义聚合到“提交失败恢复”和“可恢复错误反馈”附近，即使词面 cue 不出现，也能召回关键经验。
- 阈值设置：dense_min_score=0.25（甜点阈值，减少过度选择，保留盲盒召回）。

## 结论
Semantic 路由在“词汇鸿沟”场景下能召回关键经验，而 deterministic 路由直接失配。这是本次实验中语义路由优于纯词面路由的直接证据。
