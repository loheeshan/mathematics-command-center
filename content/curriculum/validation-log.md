# Extraction & Mathematical Validation Log

Audit run: 5 Nov 2026 against `AI & DS Mathematics-20261105T031840Z-1-001.zip` (33 PDFs; SHA-256 per file in `source-manifest.json`).

Method: `pdftotext -layout` per page → per-page heading summary → every page with < 40 characters of text was rendered with `pdftoppm` and read visually. Worked examples that MCC reuses as reference values were recomputed independently (Python, double precision) before being used anywhere in the app.

## Files needing visual inspection

| File | Issue | Resolution |
|---|---|---|
| FY S1 · 08B Determinants (11 pp) | **No text layer at all** — the whole chapter is handwritten notes. | All 11 pages rendered and read. Content: 1×1 and 2×2 determinants (p1, example `[[-1,2],[4,1]]` → −9); 3×3 cofactor expansion with `B = [[1,3,-2],[4,-5,6],[3,5,2]]`, `|B| = −80` (p2); minors (p3–4); cofactors and `cof(B)` (p5–6); inverse definition `AB = BA = I`, condition `|A| ≠ 0`, 2×2 inverse formula, `A⁻¹ = adj(A)/|A|` (p7–9); solving `x+3y−2z=1, 4x−5y+6z=2, 3x+5y+2z=3` by `X = A⁻¹b` (p10–11). The chapter is **not empty**. |
| FY S1 · 04 Relations Part 01 | 7 of 21 pages image-only (pp 10, 14, 16–18, 20–21). | Rendered. Handwritten worked examples on composition of relations (σ∘ρ ≠ ρ∘σ, p14) and reflexive/symmetric/transitive checks on {a, b, c} (pp 16–18). Mapped to topic `types`. |
| FY S1 · 06B Modular Arithmetic | 7 of 23 pages image-only (pp 1, 7–8, 15–17, 23). | Rendered. Handwritten proofs of Theorem 6.1 (addition/subtraction via `(a−b)/m = k₁`) and remainder working (13+9+27+31+18 ≡ 2 mod 4). |
| FY S1 · 08A Matrices | pp 21–25, 31–32 low text. | Diagram slides (transposition process, multiplication illustration). Headings on adjacent pages identify them; mapped to `transpose` and `multiplication`. |
| FY S1 · 02 Set Theory | pp 7, 8, 10 low text. | Handwritten annotations between slides; not used as reference values. |
| SY S1 · 04A / 04B Differential Equations | 04A pp 5–6 and 04B p 2 low text. | Exercise pages with handwritten/blank content. 04B is only 2 pages: one typed PDE example (`∂²z/∂x∂y = x²y` with boundary conditions) plus an exercise page. |

## Symbols mangled by text extraction

Several PDFs use symbol fonts that `pdftotext` maps to private-use or missing glyphs (e.g. ∈, ⊆, ∪, ∩, ∅ in Set Theory appear as blanks; Greek letters in Relations appear as `` or are dropped). MCC never copies equations from the text layer; topic titles in `academy-map.json` were written from the rendered meaning, and all formulas in MCC lessons are authored and typeset independently.

## Reference values recomputed

| Source | Claim | Independent check | Status |
|---|---|---|---|
| 08B p1 | det `[[-1,2],[4,1]]` = −9 | (−1)(1) − (2)(4) = −9 | ✔ |
| 08B p2 | `|B| = −80` | cofactor expansion in Python → −80 | ✔ |
| 08B p4 | minors M11…M33 = −40, −10, 35, 16, 8, −4, 8, 14, −17 | recomputed each 2×2 | ✔ |
| 08B p9 | `B⁻¹ = (1/80)[[40,16,−8],[−10,−8,14],[−35,−4,17]]` | adj(B)/(−80) | ✔ |
| 08B p11 | x = 3/5, y = 1/5, z = 1/10 | substituted into all three equations → (1, 2, 3) | ✔ |
| FY S2 06 p7 | `1 − pnorm(1.5, 1.15, 0.2) = 0.04005916` | 1 − Φ(1.75) via erf = 0.0400592 | ✔ |
| FY S2 08 p7 | R² ≈ 0.6511 for `lm(dist ~ speed, cars)` | known value for R's built-in `cars` dataset | ✔ (not re-run in R here) |

## Uncertain cases left open

- FY S2 06 pp 10–11 quote 0.1631 (with continuity correction) vs 0.1376 (without) for a normal approximation; the full problem parameters are split across pages with extraction gaps, so MCC does **not** reuse these numbers.
- Some handwritten exercise answers (04A pp 5–6) are partially legible; not reused.
