# Architecture

## Stack and deviations from the spec's default

| Spec default | Used | Reason |
|---|---|---|
| pnpm workspaces + Turborepo | pnpm workspaces, plain scripts | Four packages with no build step (they export TypeScript source, compiled by Next via `transpilePackages`), so Turborepo's caching adds little. Easy to add later. |
| Next.js App Router, React, TS strict, Tailwind | Next 16, React 19, TS 5 strict, Tailwind 4 | As specified. |
| shadcn/Radix | Small in-house components | Kept the bundle small; all widgets are native elements with ARIA roles. |
| KaTeX | KaTeX (`output: htmlAndMathml`, `trust: false`) | MathML gives screen readers real maths semantics. |
| mathjs | mathjs, behind a node-by-node whitelist | See *Security*. |
| SVG/D3, Three.js | Hand-written SVG | All current labs are 2-D. No 3-D lab is built yet. |
| PostgreSQL + Prisma, auth | **Not built** — local-first guest store | Documented in the backlog. |
| Pyodide | **Not built** | Code is displayed with MCC-computed results. |

## Packages

- **`@mcc/math-engine`** — pure TypeScript, no DOM. `Rational` (exact, refuses unsafe integers instead of rounding), seeded RNG (mulberry32 + FNV-1a seeds), calculus numerics (difference quotients, Riemann sums, Simpson, bisection, Newton–Raphson with explicit failure outcomes, Euler, RK4), statistics (R-compatible type-7 quantiles, Hart/West Φ, Acklam Φ⁻¹ with Halley refinement, binomial/Poisson/normal/exponential, z interval/test, regression), linear algebra (cofactor determinant, minors/cofactors/adjugate, Gauss–Jordan inverse, 2×2 eigen), discrete maths (mod, congruences, sets, relations, propositional parser/truth tables), signals (Fourier series, DFT), gradient descent, and the safe expression layer.
- **`@mcc/question-engine`** — `QuestionTemplate.generate(rng)` returns a question with prompt, typed answer spec, 3 hints, worked solution and misconception detectors. `checkAnswer` never compares strings for maths: rationals are parsed and compared exactly, numerics use a stated tolerance, expressions are compared by evaluation at 40 seeded points. `computeMastery` implements the rule shown to learners on `/progress`.
- **`@mcc/curriculum`** — zod-validated JSON (`content/`), typed lessons (blocks per stage), simulation registry, and `coverageSummary()` — the single source for `/coverage` and the generated report.
- **`@mcc/visualizers`** — `Plot` (axes, grid, zoom/pan by buttons, drag and keyboard), `FnPath` (breaks at discontinuities), `DragPoint` (pointer + arrow keys, `role="slider"`), readouts, text/data alternatives, and the 27 lab components. Labs only call the math engine for numbers; rendering is separate.

## Data flow

```
content/*.json ──zod──► @mcc/curriculum ─┐
@mcc/math-engine ◄── @mcc/question-engine ├──► apps/web (server components render static pages)
@mcc/visualizers (client components) ─────┘        └─ client islands: LessonPlayer, QuestionView, labs
                                                       └─ lib/store.ts (localStorage, zod-validated)
```

All curriculum pages are statically generated (260 pages). Learner state is client-only; `useSyncExternalStore` with a server snapshot avoids hydration mismatches.

## Persistence

`apps/web/lib/store.ts` keeps one versioned object under `mcc:v1`: settings, lesson positions/completed stages, every answer attempt (capped at 5,000), bookmarks, notes, notebook cells, exams, return-to target for bridges. It is validated on load; corrupt data is backed up under a new key and a fresh profile starts with a visible notice. Export/import/delete are in Settings. Tabs stay in sync via the `storage` event.

## Security

- **Expressions:** `parseExpression` parses with mathjs, then walks every node and rejects anything outside: finite number constants, approved variables, `pi`, `e`, `+ − × ÷ ^` and unary ±, parentheses, and 21 named functions. Assignment, property access, matrices, strings, ranges, conditionals, function definitions and imports are rejected; input length and node count are capped. The notebook's `name = expr` is split by a regex before parsing — mathjs never sees `=`.
- **Rendering:** markdown-lite is converted to React elements (no `innerHTML`), except KaTeX output, which is generated with `trust: false` from MCC-authored or whitelisted strings.
- **Headers:** CSP (`default-src 'self'`, no third-party origins, `frame-ancestors 'none'`), `nosniff`, referrer and permissions policies (`apps/web/next.config.ts`).
- **No server endpoints** and no secrets in this build.

## Accessibility

Keyboard: skip link, focus rings, all controls are native inputs/buttons, draggable points work with arrow keys, zoomable plots with `+`/`−`/Shift+arrows. Every lab has a "Text and data alternative". Status is never colour-only (icons/labels). Reduced motion follows the OS and a setting. Light/dark/high-contrast themes and 100/115/130% text. Automated axe scans (WCAG 2.2 A/AA tags) run in E2E on 8 key pages with zero serious/critical violations.
