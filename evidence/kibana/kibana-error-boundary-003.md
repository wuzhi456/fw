---
source_project: kibana
repo_url: https://github.com/elastic/kibana
immutable_ref: fb1270aacdc6b660c792319e5221a0fa9f2804c0
artifact_type: issue
path_or_issue_pr: "#139710"
artifact_url: "https://github.com/elastic/kibana/issues/139710"
artifact_title: "Defining proper error boundaries and try/catch for alert and rule pages"
verification_status: verified
claim_support: strong
excerpt_or_summary: "告警/规则页面出现空白页，提出拆分页面并围绕局部内容设置错误边界以保留导航与顶部菜单。"
mapped_experience_claim: "关键页面应拆分错误边界，避免局部异常导致整页空白并保留核心导航。"
retrieval_time: 2026-05-17T09:30:34Z
confidence: medium
verification_notes: "新增候选证据，尚未纳入 2026-05-12 evidence-audit 批次。"
---
## Note

该 Issue 明确讨论将页面拆分为更细粒度的错误边界，避免单点异常造成整页空白。该证据为新增候选，待后续审计批次统一校验与置信度复核。
