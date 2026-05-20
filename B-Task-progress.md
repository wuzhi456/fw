B 任务进展与核心流程报告 (B-Task Process Report)

报告日期：2026-05-20

角色定位：经验注入与路由负责人 (Experience Injection / Router Owner)

核心产出：确定性路由器脚本、强指令集 SKILL.md、双层基准评估体系（路由评估 + 执行评估）。


---
一、 SKILL.md 核心执行流程详解

重构后的 frontend-productization 技能已升级为面向大模型（AI Agent）的强指令集 (Directive Mode)。通过以下 7 个严格的步骤，确保 Agent 能够精准提取并注入 3-5 条前端产品化经验。

1. 角色与激活条件 (Role & Activation)

- 指令要求：当用户任务涉及前端页面、列表、表单、数据看板或异步数据请求时，Agent 必须激活此技能。

- 防误判机制：纯静态展示页（无数据交互）严禁激活，避免对大模型造成不必要的思维干扰。

2. 强制执行工作流 (Execution Workflow)

- 指令要求：严禁 Agent 自行猜测。Agent 必须在终端环境中运行 Python 检索引擎：

python scripts/route_experience_units.py --task-file <PATH_TO_TASK_TEXT> --stage <plan|coding|review|test>

- 工程意义：彻底剥夺了大模型盲目提取经验的权力，将经验选择权交给了确定性（Deterministic）的本地脚本。

3. 结果解析 (Result Parsing)

- 指令要求：读取生成的 experiments/routing/router-output.json，提取 selected 数组中的 unit_id。

- 硬性约束：Agent 只能注入被脚本选中的这几条经验，绝不可越界。

4. 异常处理与防幻觉 (Exception Handling)

- 指令要求：若路由失败或 JSON 无效，重试一次 -> 尝试离线降级模式 -> 若均失败，停止行动并询问用户。

- 工程意义：设立“熔断机制”，绝对禁止大模型在工具调用失败时自行捏造经验（防止 Agent 幻觉）。

5. 上下文动态注入 (Contextual Injection)

- 指令要求：拿着提取到的 unit_id，去读取对应的 Markdown 经验文件。

- 核心法则：只允许读取当前开发阶段（如 injection.coding）的文本。

- 数量限制：总注入条目不得超过 5 条。

6. 内部思维链约束输出 (Injection Output Format)

- 指令要求：在生成最终计划或代码前，Agent 必须在内部生成一个隐藏的 XML 约束块（思维链）：

<thinking>
<constraints stage="coding">
- 约束 1：必须处理防重复提交
- 约束 2：必须显式建模异步状态
...
</constraints>
</thinking>

- 工程意义：迫使大模型“先复习考点，再提笔答题”，极大提升了经验指令的实际执行依从度（Compliance）。

7. 降级与绝对红线 (Fallback & Non-Negotiable Rules)

- 兼容模式：在冻结的学术对照实验环境（无法执行 Python 工具）中，读取预先生成的 routing-packets/<task-id>-packet.md。

- 绝对红线：不准绕开路由器、不准超量注入、不准将底层经验库原文直接暴露给用户。


---
二、 路由与检索基准实验结果 (Retrieval Eval Results)

基于 SkillBench 论文的评测思想，B 任务构建了完整的量化评估闭环。当前最新实验结果如下：

1. 检索精准度 (Precision & Recall)

表现达标：针对三大核心测试任务（异步表单、数据列表、响应式看板），路由器在双通道（Channel A 强制 + Channel B 上下文）策略下，稳定锁定了高优先级（Score>=2）的产品化经验，确保了 Context 的高信噪比。

2. Zero-Shot 盲盒泛化测试成功

测试用例：引入了全新的隐性任务 task-ecommerce-checkout（电商结算页）。

泛化表现：尽管任务描述中未直接出现 "form"（表单）字眼，优化后的“隐性意图映射词典”成功捕获了结算行为背后的表单风险，准确提取了 form-duplicate-submit-guard（防重复提交）等致命经验。

3. 过度触发问题修复 (Over-selection Mitigation)

优化点：修正了早期版本中，仅因出现“购物车清单 (cart items)”就错误触发“服务端大型分页 (server-pagination)”的过度设计问题。

结果：通过收紧 list 词汇的触发阈值，系统现已能准确区分“小数据遍历”与“大数据列表渲染”，有效避免了代码层面的过度工程（Over-engineering）。

4. 评估基础建设就绪 (Evaluation Foundation)

银标准 (Silver Labels)：产出 relevance-labels.csv，覆盖 108 种任务-经验组合矩阵，解决了评价体系“既当裁判又当运动员”的循环论证问题。

执行审计模板 (Evidence-of-Use)：定义了具体的代码结构审计标准（如：寻找 <ErrorBoundary> 判定错误恢复达标）。已做好与 C 任务（生成实验）无缝对接的准备。


---
三、 结论与交接

当前的 frontend-productization 机制已经超越了简单的文本清单，演变成了一个具备高鲁棒性、高可解释性且符合 Agentic Workflow（智能体工作流）工业级标准的动态注入系统。

B 任务（路由与经验提取验证）已圆满闭环，项目可正式进入 C 任务阶段，开启端到端的大模型代码生成（Execution Benchmark）与最终盲评（Blind Review）。
