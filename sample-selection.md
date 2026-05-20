# Sample Selection

Status: frozen for P0  
Last updated: 2026-05-12  
Retrieval time: 2026-05-12T03:30:00Z

## 1. Selection Criteria

Candidate projects are scored from 0 to 3 on five dimensions, for a total of 15 points.

| Dimension | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| Maintenance activity | Mostly inactive | Occasional maintenance | Continued maintenance | Long-term active with clear version evolution |
| Frontend product complexity | Example-level | Medium pages | Real multi-page product | Large real frontend system |
| Six-risk-class fit | Covers 0-1 class | Covers 2 classes | Covers 3-4 classes | Covers 5-6 classes |
| Evidence availability | Hard to obtain | Code only | Code and docs | Code, docs, issues/PRs |
| Extraction cost control | Too expensive | High cost | Controllable | Low cost and concentrated materials |

Inclusion rules:

1. Total score must be `>= 11/15`.
2. Evidence availability must be `>= 2`.
3. Select at most three main samples.
4. Main samples must cover at least two of these profiles: admin CRUD, dashboard/data, large-scale frontend.
5. Every candidate keeps an inclusion or exclusion record.

## 2. Candidate Scoring

| Candidate | Repository / evidence entry | Activity | Complexity | Risk fit | Evidence | Cost | Total | Decision |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| react-admin | https://github.com/marmelab/react-admin | 3 | 2 | 3 | 3 | 3 | 14 | Include |
| refine | https://github.com/refinedev/refine | 3 | 2 | 3 | 3 | 2 | 13 | Include |
| Kibana | https://github.com/elastic/kibana | 3 | 3 | 3 | 3 | 1 | 13 | Include as large-system sample |
| GitLab frontend | https://github.com/gitlabhq/gitlabhq and https://gitlab.com/gitlab-org/gitlab | 3 | 3 | 3 | 2 | 1 | 12 | Exclude from MVP main samples; keep as backup |

## 3. Current Metadata Notes

The P0 scoring used current public repository metadata available on 2026-05-12:

| Candidate | Observed metadata |
| --- | --- |
| react-admin | TypeScript frontend framework for REST/GraphQL single-page apps; GitHub repo recently pushed on 2026-05-09; issues and PRs are available. |
| refine | TypeScript React framework for internal tools, admin panels, dashboards, and B2B apps; GitHub repo recently pushed on 2026-05-07; issues, discussions, docs, and PRs are available. |
| Kibana | Large TypeScript data exploration and dashboard system; GitHub repo recently pushed on 2026-05-12; extensive issues, PRs, docs, and tests are available. |
| GitLab frontend | Large GitLab product frontend inside the GitLab monorepo; GitHub mirror recently pushed on 2026-05-12, but primary issue/MR evidence is on GitLab, increasing extraction cost. |

## 4. Inclusion Records

### 4.1 react-admin

Decision: included as the admin CRUD and data-request sample.

Rationale:

- Strong fit for CRUD screens, data providers, forms, lists, auth, permissions, optimistic updates, and request states.
- Evidence is concentrated in a smaller framework repository compared with Kibana or GitLab.
- Documentation and examples make it practical to trace productization patterns without copying code.

Expected contribution:

- Async request states.
- List rendering and pagination decisions.
- Form validation and mutation handling.
- Empty/error state conventions in admin workflows.

Known limitation:

- It is a framework and example ecosystem rather than a single deployed product, so some findings may reflect reusable abstraction design more than application-specific product tradeoffs.

### 4.2 refine

Decision: included as the internal tools and dashboard framework sample.

Rationale:

- Strong fit for internal tools, dashboards, data-intensive B2B pages, mutations, cache behavior, and form integrations.
- Offers a useful contrast to react-admin because it is more headless and integration-oriented.
- Evidence availability is high, but the repository is large and docs/examples are broad, so extraction cost is slightly higher.

Expected contribution:

- Mutation and invalidation patterns.
- Dashboard/internal-tool task framing.
- Form and data-provider abstraction tradeoffs.
- Multi-library UI integration risks.

Known limitation:

- Some patterns may be adapter-specific; P1 must discard experiences that only apply to one UI integration package.

### 4.3 Kibana

Decision: included as the large-scale frontend system sample.

Rationale:

- Covers dashboards, visualization, complex async states, long-running UI workflows, error handling, permissions, responsive/data-dense layout, and performance concerns.
- Public issues and PRs provide rich evidence for real-world productization failures and fixes.
- Recent activity and large frontend surface make it useful for extracting mature practices.

Expected contribution:

- Large-system error and fallback boundaries.
- Layout overflow and responsive data-display handling.
- Performance and state consistency in data-heavy experiences.
- Review/test practices for UI regressions.

Known limitation:

- Extraction cost is high because the repository is large and domain-specific. P1 must cap evidence searches to the six frozen risk classes.

### 4.4 GitLab frontend

Decision: excluded from MVP main samples; keep as backup or later extension.

Rationale:

- It satisfies activity, complexity, and product-surface requirements.
- It is valuable for large-scale frontend evidence, but overlaps with Kibana as a large-system sample.
- Primary issue/MR context lives on GitLab rather than the GitHub mirror, increasing extraction and traceability overhead for this MVP.

Expected contribution if later included:

- Mature product workflows around permissions, forms, list-heavy pages, error states, and responsive layout.
- Long-lived frontend governance practices in a large application.

Reason for exclusion:

- MVP already has three included samples covering admin CRUD, internal tools/dashboard, and large-scale frontend. Adding GitLab would raise extraction cost without improving profile coverage enough for P0.

## 5. Final Main Samples

The frozen MVP main samples are:

1. react-admin
2. refine
3. Kibana

Coverage check:

| Required profile | Covered by |
| --- | --- |
| admin CRUD | react-admin, refine |
| dashboard/data | refine, Kibana |
| large-scale frontend | Kibana |

All selected samples meet `>= 11/15` total score and evidence availability `>= 2`.

## 6. Evidence Collection Boundaries For P1

P1 must collect evidence only within the six frozen frontend productization risk classes. It must avoid broad architecture mining and must not copy long code or documentation excerpts.

Priority evidence sources:

1. Documentation pages that define intended behavior.
2. Tests that encode productization edge cases.
3. PRs or issues that show real defects, review concerns, or fixes.
4. Code paths only when they directly support a transferable experience claim.
