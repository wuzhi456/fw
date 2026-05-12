# Evidence audit report (2026-05-12)

本文档记录对 `evidence/**/*.md` 共 **36** 条证据的 **evidence-audit** 结果：逐条补齐可打开的 **`artifact_url`**、人读 **`artifact_title`**、**`verification_status`** 与 **`claim_support`**，并按规则重写 **`confidence`**。Experience Unit（EU）的 **`confidence`** 与 `frontend-productization/experience-index.json` 中的 **`evidence_confidence`** 已与「证据链最弱一环」对齐。

## 1. 标准摘要

| 字段 | 含义 |
| --- | --- |
| `artifact_url` | 在浏览器中可直接打开的 canonical 链接（blob / issue / PR）。 |
| `artifact_title` | Issue/PR 标题、文档名或文件用途简述。 |
| `verification_status` | `verified`：Issue/PR 可打开且非 release-bot-only 噪声；`verified_path`：给定 `immutable_ref` 下路径可解析。 |
| `claim_support` | `strong` / `partial` / `weak`：工件对 `mapped_experience_claim` 的直接程度。 |
| `confidence`（证据行） | 审计后的可引用强度；**high** 要求 **`claim_support: strong`** 且 **`verified` 或 `verified_path`**，并能直接支撑对应 claim。 |

Refine 文档类证据与 `kibana-error-boundary-001` 的 `CONTRIBUTING.md` 已钉选 **commit SHA**（分别为 `d9889ee24c719d34b8feaca5da2b42e8608a636d` 与 `fb1270aacdc6b660c792319e5221a0fa9f2804c0`），与 `immutable_ref` 一致，便于论文/最终报告复现。

## 2. 主要替换与降级

- **404 / 旧路径**：多条原 `documentation/docs/guides-and-concepts/...` 等路径已改为当前仓库下的文档路径或 Issue/PR。
- **Kibana `kibana-state-002`**：原 **kibanamachine** 主导的 flaky CI 类 **`#97701`** 已替换为产品向 Issue **`#129020`**（Discover callout 内展示「无匹配索引」类错误），避免 **release bot / CI 噪声** 作为高置信主证。
- **泛化占位**：已清除 `#...` 类占位；`path_or_issue_pr` 均为具体路径或 **`#数字`**。
- **`kibana-error-boundary-001`**：`CONTRIBUTING.md` 与错误边界产品叙事仅 **弱相关**，记为 **`low` / `weak`**，拉低 `ux-error-boundary-granularity` EU 整体置信度。
- **`refine/authz-empty-002`**：Ant Design 集成介绍与「可恢复错误非阻塞反馈」claim 对齐度低，**降级为 `low`**。

## 3. Experience Unit 置信度（审计后）

规则：**EU `confidence` = 其引用证据 `confidence` 的最小值**（与 `experience-index.json` 的 `evidence_confidence` 一致）。

| EU `id` | evidence_confidence |
| --- | --- |
| async-explicit-states | medium |
| async-stale-cancel | medium |
| async-retry-recover | medium |
| list-pagination-server | medium |
| list-virtualize-window | medium |
| list-incremental-prefetch | medium |
| form-duplicate-submit-guard | medium |
| form-async-validation-feedback | high |
| form-submit-recovery | high |
| state-optimistic-rollback | medium |
| state-cache-invalidation | high |
| state-stale-response-guard | high |
| ux-error-boundary-granularity | low |
| ux-empty-state-actionable | high |
| ux-fallback-recoverable-errors | low |
| responsive-mobile-navigation-density | medium |
| responsive-long-text-overflow | medium |
| responsive-dense-dashboard-layout | medium |

## 4. 逐条证据（URL · 标题 · 状态）

| Evidence file | Artifact (linked) | verification_status | confidence | claim_support |
|---|---|---|---|---|
| `react-admin/async-explicit-states-001.md` | [Data fetching guide (react-admin docs)](https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/docs/DataFetchingGuide.md) | `verified_path` | medium | partial |
| `react-admin/async-explicit-states-002.md` | [useDataProvider hook (ra-core)](https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/packages/ra-core/src/dataProvider/useDataProvider.ts) | `verified_path` | high | strong |
| `react-admin/async-retry-001.md` | [useNotify not being called by dataprovider or from within React Query instance](https://github.com/marmelab/react-admin/issues/10180) | `verified` | medium | strong |
| `react-admin/async-retry-002.md` | [Admin component documentation](https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/docs/Admin.md) | `verified_path` | medium | partial |
| `react-admin/async-stale-cancel-001.md` | [Actions documentation](https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/docs/Actions.md) | `verified_path` | medium | partial |
| `react-admin/async-stale-cancel-002.md` | [useListController unit tests](https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/packages/ra-core/src/controller/list/useListController.spec.tsx) | `verified_path` | medium | partial |
| `react-admin/form-dup-guard-001.md` | [Forms documentation](https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/docs/Forms.md) | `verified_path` | medium | partial |
| `react-admin/form-dup-guard-002.md` | [SaveButton.tsx](https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/packages/ra-ui-materialui/src/button/SaveButton.tsx) | `verified_path` | high | strong |
| `react-admin/list-pagination-001.md` | [List component documentation](https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/docs/List.md) | `verified_path` | high | strong |
| `react-admin/list-pagination-002.md` | [Material UI List.tsx](https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/packages/ra-ui-materialui/src/list/List.tsx) | `verified_path` | medium | partial |
| `react-admin/list-window-001.md` | [Datagrid documentation](https://github.com/marmelab/react-admin/blob/fe80bf37758da3b1d0c35a456416a1c169399d99/docs/Datagrid.md) | `verified_path` | medium | partial |
| `react-admin/list-window-002.md` | [Datagrid is freezing the screen when receiving a "large" list](https://github.com/marmelab/react-admin/issues/8075) | `verified` | high | strong |
| `refine/mutation-invalidation-001.md` | [useInvalidate hook documentation](https://github.com/refinedev/refine/blob/d9889ee24c719d34b8feaca5da2b42e8608a636d/documentation/docs/data/hooks/use-invalidate/index.md) | `verified_path` | high | strong |
| `refine/mutation-invalidation-002.md` | [useForm (data hooks) documentation](https://github.com/refinedev/refine/blob/d9889ee24c719d34b8feaca5da2b42e8608a636d/documentation/docs/data/hooks/use-form/index.md) | `verified_path` | medium | partial |
| `refine/authz-empty-001.md` | [Auth provider documentation](https://github.com/refinedev/refine/blob/d9889ee24c719d34b8feaca5da2b42e8608a636d/documentation/docs/authentication/auth-provider/index.md) | `verified_path` | medium | partial |
| `refine/authz-empty-002.md` | [Ant Design UI integration introduction](https://github.com/refinedev/refine/blob/d9889ee24c719d34b8feaca5da2b42e8608a636d/documentation/docs/ui-integrations/ant-design/introduction/index.md) | `verified_path` | low | weak |
| `refine/dashboard-async-001.md` | [useList hook documentation](https://github.com/refinedev/refine/blob/d9889ee24c719d34b8feaca5da2b42e8608a636d/documentation/docs/data/hooks/use-list/index.md) | `verified_path` | high | strong |
| `refine/dashboard-async-002.md` | [refactor(core): fine-tuning in invalidations](https://github.com/refinedev/refine/pull/4896) | `verified` | medium | strong |
| `refine/form-async-validation-001.md` | [\[DOC\] Material UI Server Side validation example.](https://github.com/refinedev/refine/issues/2955) | `verified` | high | strong |
| `refine/form-async-validation-002.md` | [@refinedev/react-hook-form useForm documentation](https://github.com/refinedev/refine/blob/d9889ee24c719d34b8feaca5da2b42e8608a636d/documentation/docs/packages/react-hook-form/use-form/index.md) | `verified_path` | high | strong |
| `refine/form-submit-recover-001.md` | [useUpdate hook documentation](https://github.com/refinedev/refine/blob/d9889ee24c719d34b8feaca5da2b42e8608a636d/documentation/docs/data/hooks/use-update/index.md) | `verified_path` | high | strong |
| `refine/form-submit-recover-002.md` | [Fix optimistic updates of lists](https://github.com/refinedev/refine/pull/3657) | `verified` | high | strong |
| `refine/refine-responsive-001.md` | [\[BUG\] Menu Button and Heading Overlap in Mobile Preview.](https://github.com/refinedev/refine/issues/6323) | `verified` | medium | partial |
| `refine/refine-responsive-002.md` | [Router provider documentation](https://github.com/refinedev/refine/blob/d9889ee24c719d34b8feaca5da2b42e8608a636d/documentation/docs/routing/router-provider/index.md) | `verified_path` | medium | partial |
| `kibana/kibana-async-001.md` | [\[Discover\] Empty state's description can be completely blank](https://github.com/elastic/kibana/issues/126594) | `verified` | medium | partial |
| `kibana/kibana-async-002.md` | [Lens embeddable doesn't set proper attributes when no results found](https://github.com/elastic/kibana/issues/106085) | `verified` | high | strong |
| `kibana/kibana-empty-001.md` | [\[Discover\] Show a fallback empty message when no results are found](https://github.com/elastic/kibana/pull/128754) | `verified` | high | strong |
| `kibana/kibana-empty-002.md` | [\[Discover\] Extend DiscoverNoResults component to show different message on error](https://github.com/elastic/kibana/pull/79671) | `verified` | high | strong |
| `kibana/kibana-error-boundary-001.md` | [Kibana CONTRIBUTING.md](https://github.com/elastic/kibana/blob/fb1270aacdc6b660c792319e5221a0fa9f2804c0/CONTRIBUTING.md) | `verified_path` | low | weak |
| `kibana/kibana-error-boundary-002.md` | [\[Dashboard\] Add better debugging to error embeddable checks](https://github.com/elastic/kibana/pull/153457) | `verified` | high | strong |
| `kibana/kibana-list-perf-001.md` | [\[Lens\] Add render complete tags to empty states](https://github.com/elastic/kibana/pull/106163) | `verified` | medium | partial |
| `kibana/kibana-list-perf-002.md` | [\[Discover\] Inline data fetching errors](https://github.com/elastic/kibana/pull/152311) | `verified` | medium | partial |
| `kibana/kibana-overflow-001.md` | [(Accessible) High Data Volume Bar Chart](https://github.com/elastic/kibana/issues/36386) | `verified` | medium | partial |
| `kibana/kibana-overflow-002.md` | [\[Lens\] add better accessibility descriptions to elastic-charts](https://github.com/elastic/kibana/issues/221577) | `verified` | medium | partial |
| `kibana/kibana-state-001.md` | [\[Discover\] Inline toast error message in Discover main](https://github.com/elastic/kibana/issues/149488) | `verified` | high | strong |
| `kibana/kibana-state-002.md` | [\[Discover\] Show "no matching indices found" error inside the callout](https://github.com/elastic/kibana/issues/129020) | `verified` | high | strong |

## 5. 机器可读摘要

- `docs/evidence-audit-summary.json`：由 `scripts/apply_evidence_audit.py` 每次运行覆盖，含 `confidence_map`。
- `docs/evidence-audit-result.json`：**同上脚本每次覆盖**；`schema_version: 2`，与 `ROWS` / `evidence/**/*.md` 同源，**非**历史 GitHub API 探测产物（不含 `path_not_found_at_ref` / `bot_flaky_test_noise` 等过期枚举）。
- 证据正文与 `verification_notes`：以仓库内 `evidence/**/*.md` 为准。

## 6. 维护

再次批量更新证据时，应编辑 **`scripts/apply_evidence_audit.py`** 中 `ROWS`，运行 `python3 scripts/apply_evidence_audit.py`（会同步 `evidence-audit-summary.json` 与 **`evidence-audit-result.json`**），并视需要更新本报告与 `evidence-schema.md`。
