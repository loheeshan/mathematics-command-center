# Mathematics Command Center (MCC)

A learning platform that takes a learner from the number line to university calculus, linear algebra, statistics and AI mathematics — with visual explanations, working simulations, hand calculation, seeded practice and transparent mastery tracking.

It has two connected paths:

- **Master Core** (Levels 0–10, 141 topics) — the complete roadmap, independent of any university.
- **Academy Path** — the 33 IIT "AI & DS Mathematics" lecture PDFs in their original order (FY S1: 14, FY S2: 10, SY S1: 9), each mapped page-by-page to Master Core skills, with *I need the basics* bridges that return you to the chapter.

> **Status, plainly:** this is a working foundation, not the finished product the master spec describes. See [What is built](#what-is-built) and [Backlog](#backlog). The live coverage report is at `/coverage` and in `content/curriculum/coverage-report.md`.

## Quick start

Requirements: Node 20+ (tested on 22), pnpm 10 (`corepack enable`), Python 3 + poppler-utils only if you re-run the PDF audit.

```bash
pnpm install
pnpm dev                 # http://localhost:3000
```

Production build:

```bash
pnpm build && pnpm start # http://localhost:3000
```

No environment variables, database or API keys are needed: the app runs in guest mode and stores progress in the browser (localStorage).

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js app in `apps/web` |
| `pnpm test` | Vitest unit tests (math engine + every question template × 300 seeds) |
| `pnpm typecheck` | Strict TypeScript for all packages and the app |
| `pnpm validate:curriculum` | DAG, 33/33 PDF mapping, cross-references, lesson answer checks; regenerates `content/curriculum/coverage-report.md` |
| `pnpm validate:math` | Cross-method checks (symbolic vs numeric, exact vs quadrature, Newton vs bisection, regression vs normal equations) |
| `pnpm test:e2e` | Playwright E2E + axe accessibility scans (needs `pnpm build` first; set `CHROME_PATH` to use a local Chrome) |
| `pnpm check` | typecheck + unit + validators + build |
| `pnpm audit:zip <zip> content/curriculum` | Re-audit the lecture ZIP and rewrite `source-manifest.json` |

### Test results at time of delivery (5 Nov 2026)

```
pnpm test                 216 passed (47 math-engine, 169 question-engine)
pnpm typecheck            0 errors
pnpm validate:curriculum  141 topics, 221 DAG edges (acyclic), 33 chapters ↔ 33 PDFs, 27 sims, 53 templates, 11 lessons (11 with all 12 stages)
pnpm validate:math        2818 cross-method checks passed
pnpm build                Next.js 16 production build, 270 static pages
pnpm test:e2e             20 passed (incl. axe WCAG 2.2 AA scans on 8 pages, 360 px layout, keyboard dragging)
```

## What is built

| Area | Built | Notes |
|---|---|---|
| Source audit | 33/33 PDFs hashed, page-counted, extraction-graded; image-only pages rendered and read | `content/curriculum/*`; 08B Determinants is fully handwritten — its worked example (|B| = −80, X = (3/5, 1/5, 1/10)) is verified |
| Academy map | 33 chapters, 154 page-ranged topics, objectives (stated vs derived labelled), foundations | Status per topic: 55 implemented, 53 partial, 46 missing |
| Full 12-stage lessons | **11** | Negative numbers, order of operations, fractions (spec reference slice), decimals & percentages, ratio, linear equations, slope; limits, derivative, determinants, Newton–Raphson |
| Interactive labs | **27** | Number line → gradient descent; each has presets, reset, live readouts, text/data alternative, deep link and 3-question practice |
| Question templates | **53** across 43 skills | Seeded, deterministic; exact rationals, tolerance numerics, expression equivalence, tuples, truth tables; 3 hints; misconception detectors |
| Practice, exams, mastery | Working | Daily review, mixed sets, timed/untimed mocks with fresh seeds, transparent mastery rule + spaced review |
| Other screens | Working | Dashboard, Master Core map, topic pages, knowledge graph, notebook (safe math cells, graphs, export), library search, settings (theme, contrast, text size, motion, export/import/delete) |

Master Core coverage by level (taught = lesson or lab/practice): L0 33%, L1 63%, L2 47%, L3 46%, L4 38%, L5 58%, L6 64%, L7 65%, L8 63%, L9 22%, L10 0% — 48% of topics overall, 23 of 141 topics taught by a full lesson.

## Backlog

Prioritised; none of these are implemented, and the app says so where relevant.

1. **More full lessons** — 118 Master Core topics have no lesson. Highest value next: sets & logic (FY S1 02–03), functions (04), trigonometry (06A), probability & distributions (FY S2 02–06), partial derivatives & integration techniques (SY S1 02–03).
2. **Lecture-matched question sets** per Academy chapter (with page references). Currently every chapter's practice uses MCC templates for its skills.
3. **Accounts and server sync** — Postgres + Prisma models from spec §13, auth, guest-to-account merge. Today progress lives only in one browser (export/import JSON is provided).
4. **Python/R execution** in a sandboxed Pyodide worker; code blocks are shown with MCC-computed results only.
5. **AI tutor** with deterministic verification and a non-AI fallback (spec §10.1). Not present.
6. **Study planner** (spec §10.3), teacher/admin authoring UI (spec §11 #14), bilingual Tamil/Sinhala glossary with human-reviewed terms, offline caching.
7. Labs listed in the spec but not built: Algebra Tiles, Coordinate Geometry, Linear Systems, Eigenvector Explorer (eigenvectors are shown inside the Matrix lab), 3-D Surface & Gradient, Chain Rule Layers, Optimisation Landscape, Hypothesis Testing, Neural-Network Backprop.

## Repository layout

```
apps/web/                 Next.js 16 App Router UI (all routes in app/)
packages/math-engine/     exact rationals, numerics, stats, linear algebra, discrete maths, safe expressions
packages/question-engine/ seeded templates, answer checking, misconceptions, mastery model
packages/curriculum/      typed curriculum, lessons, simulation registry, coverage computation
packages/visualizers/     SVG plot kit + 27 lab components
content/core/             master-core.json
content/curriculum/       source manifest, academy map, prerequisites DAG, reports
scripts/                  audit-university-zip, validate-curriculum, validate-math
tests/e2e/                Playwright + axe
docs/                     architecture, authoring, simulation specs, coverage, deployment
```

## Copyright and privacy

The lecture PDFs are **not** in this repository (`*.pdf` and `*.zip` are git-ignored). MCC stores file names, hashes and page numbers, and all explanations are original. No third-party simulation code or assets are embedded. No data leaves the browser.

See `docs/` for architecture, content authoring, simulation specs and Vercel deployment.
