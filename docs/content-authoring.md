# Content authoring

Everything is typed and validated; `pnpm validate:curriculum` fails on any broken reference.

## Add a Master Core topic

1. Add `{ "id": "kebab-id", "title": "…" }` to a unit in `content/core/master-core.json`.
2. Add prerequisite edges `["prereq-id", "kebab-id"]` to `content/curriculum/prerequisites.json` (the validator rejects cycles and unknown ids).

## Add a question template

Create a template in `packages/question-engine/src/templates/*.ts` and append it to the exported array:

```ts
{
  id: "unique-id", skill: "master-core-topic-id", title: "…", difficulty: 1 | 2 | 3,
  representation: "symbolic" | "word-problem" | "visual" | "conceptual",
  generate(rng) {
    // use rng.int / rng.pick only — never Math.random — so seeds reproduce questions
    return {
      prompt: "Markdown-lite with $TeX$",
      answer: { kind: "rational", value: "5/6" },          // or numeric/integer/expression/choice/tuple/boolean-list
      hints: ["concept", "set-up", "next operation"],
      solution: [{ text: "…", tex: "…" }],
      answerDisplay: "$\\frac56$",
      misconceptions: [{ id: "add-tops-and-bottoms", detect: (s) => ratEq(s, wrong), feedback: "…" }],
      exactness: "exact",
    };
  },
}
```

`pnpm test` automatically generates it for 300 seeds and checks that the canonical answer is accepted, prompts contain no `NaN`/`undefined`, there are 3 hints, output is deterministic and varies across seeds. Add an independent cross-check to `scripts/validate-math/validate.ts` when the answer can be re-derived another way.

## Add a lesson

Create `packages/curriculum/src/lessons/<name>.ts` exporting a `Lesson`, and add it to `lessons/index.ts`. Every one of the 12 stages (`why … next`) must have at least one block. Block types: `text` (optionally `mode: simple | formal | university`), `math`, `callout`, `sim` (with optional preset), `steps` (revealed one at a time), `try` (a hand-checked question with hints and misconception values), `symbols`, `code` (display only; put MCC-computed results in `computed`), `practice`, `mastery` (exactly 3 templates = 3 representations), `links`, `table`.

Rules: explain every symbol before using it; mark exact vs approximate; reference lecture pages only when you have checked them; never copy lecture text — write original explanations.

## Add a simulation

1. Write a component `(props: { preset?: string }) => JSX` in `packages/visualizers/src/sims/`, using `Plot`, `DragPoint`, `Slider`, `Readouts`, `TextAlternative`. Compute numbers with `@mcc/math-engine`, not in the component.
2. Register it in `SIM_COMPONENTS` (`packages/visualizers/src/index.tsx`) and add metadata (skills, 3 practice templates, presets) to `packages/curriculum/src/simulations.ts`.
3. E2E automatically opens every simulation and clicks every preset, failing on runtime or hydration errors.

## Add or re-audit university material

`pnpm audit:zip path/to.zip content/curriculum` rewrites `source-manifest.json` (hash, pages, per-page text density, quality). Then edit `academy-map.json`: one chapter per PDF with page-ranged topics mapped to skill ids. Mark objectives `"stated"` (with `objectivesPage`) only when the PDF lists them; otherwise `"derived"`. Record any uncertain extraction in `validation-log.md`.
