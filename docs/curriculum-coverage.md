# Curriculum coverage

The authoritative, regenerated report is [`content/curriculum/coverage-report.md`](../content/curriculum/coverage-report.md) (run `pnpm validate:curriculum`). The same data is shown in the app at `/coverage`.

Supporting files:

- [`source-manifest.json`](../content/curriculum/source-manifest.json) — 33 PDFs: path, semester, chapter, SHA-256, page count, pages without a text layer, extraction quality.
- [`academy-map.json`](../content/curriculum/academy-map.json) — chapter → page-ranged topics → Master Core skills; objectives marked stated/derived.
- [`prerequisites.json`](../content/curriculum/prerequisites.json) — 221-edge acyclic prerequisite graph + remediation shortcuts.
- [`foundation-gap-report.md`](../content/curriculum/foundation-gap-report.md) — what each chapter assumes but doesn't teach, with bridge topic ids.
- [`validation-log.md`](../content/curriculum/validation-log.md) — handwritten/image-only pages, symbol extraction problems, recomputed reference values.

"Indexed" (every PDF mapped with page ranges): 33/33. "Taught" (lesson, or lab + practice, for every skill of a lecture topic): 55 of 154 Academy topics; 53 partial; 46 missing. Lecture-matched question sets: 0 chapters (backlog).
