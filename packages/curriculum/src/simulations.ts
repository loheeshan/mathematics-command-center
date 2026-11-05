import type { SimulationMeta } from "./types";

/**
 * Registry of interactive labs. Every entry here has a working component in
 * packages/visualizers (enforced by scripts/validate-curriculum).
 */
export const SIMULATIONS: SimulationMeta[] = [
  // ---- foundations ----
  { slug: "number-line", title: "Number Line Explorer", level: 0, domain: "number", skills: ["number-line", "negative-numbers"], practice: ["signed-add", "signed-subtract", "signed-multiply"], presets: ["add-negative", "subtract-negative", "fractions"],
    summary: "Drag along a number line to add and subtract signed numbers and see distance from zero." },
  { slug: "fraction-kitchen", title: "Fraction Kitchen", level: 1, domain: "number", skills: ["fractions-meaning", "equivalent-fractions", "fraction-add-sub", "mixed-numbers"], practice: ["fraction-add-unlike", "equivalent-fraction-missing", "fraction-subtract"], presets: ["half-plus-third", "three-quarters-plus-half", "equivalent"],
    summary: "Split equal-width bars into equal parts, re-cut them to a common denominator, and add exactly — including totals above one whole." },
  { slug: "percent-grid", title: "Decimal & Percentage Studio", level: 1, domain: "number", skills: ["decimals", "percentages"], practice: ["percent-of-quantity", "percent-change", "decimal-to-fraction"], presets: ["discount", "increase", "quarter"],
    summary: "A 100-square grid links percentages, decimals and fractions; apply discounts and increases to real prices." },
  { slug: "ratio-mixer", title: "Ratio Mixer", level: 1, domain: "number", skills: ["ratio-proportion", "rates-unit-rates"], practice: ["ratio-share", "unit-rate", "ratio-share"], presets: ["buffer", "recipe"],
    summary: "Mix two solutions in a fixed ratio; scale the batch and watch the shares stay proportional." },
  { slug: "balance-equation", title: "Balance-the-Equation Lab", level: 2, domain: "algebra", skills: ["linear-equations"], practice: ["linear-one-side", "linear-both-sides", "linear-one-side"], presets: ["two-step", "negative", "both-sides"],
    summary: "Solve ax + b = cx + d by doing the same operation to both sides of a balance; every step is checked." },
  { slug: "slope-lab", title: "Slope Lab", level: 2, domain: "algebra", skills: ["coordinate-plane", "slope-intercept"], practice: ["slope-two-points", "line-equation", "coordinate-quadrant"], presets: ["positive", "negative", "vertical"],
    summary: "Drag two points and watch rise, run, slope and the line equation update live." },
  { slug: "quadratic-playground", title: "Quadratic Playground", level: 2, domain: "algebra", skills: ["quadratics"], practice: ["quadratic-roots", "quadratic-roots", "substitute-quadratic"], presets: ["two-roots", "double-root", "no-real-roots"],
    summary: "Change a, b, c and see the parabola, vertex, discriminant and roots — exact where possible." },
  { slug: "graphing-studio", title: "Graphing Studio", level: 3, domain: "algebra", skills: ["functions-notation", "function-families", "piecewise-asymptotes"], practice: ["substitute-quadratic", "line-equation", "limit-removable"], presets: ["exp-log", "rational", "trig"],
    summary: "Type up to three functions, zoom and pan, read values, find intersections and see domain gaps." },
  // ---- discrete / trig ----
  { slug: "unit-circle", title: "Unit Circle & Trigonometry Lab", level: 3, domain: "geometry-trig", skills: ["radians", "trig-ratios", "trig-graphs"], practice: ["degrees-to-radians", "exact-trig-values", "exact-trig-values"], presets: ["30", "135", "240"],
    summary: "Rotate a point around the unit circle; see sine and cosine as projections and as waves, in degrees and radians." },
  { slug: "venn-studio", title: "Sets & Venn Studio", level: 4, domain: "discrete", skills: ["sets", "probability-basics"], practice: ["set-cardinality", "set-cardinality", "set-cardinality"], presets: ["lecture", "disjoint", "subset"],
    summary: "Toggle elements between regions of a Venn diagram and compute union, intersection, difference and complement." },
  { slug: "truth-table", title: "Logic Table Builder", level: 4, domain: "discrete", skills: ["propositional-logic"], practice: ["truth-table-column", "contrapositive", "truth-table-column"], presets: ["implication", "contrapositive", "de-morgan"],
    summary: "Type propositional formulas; get truth tables, tautology/contradiction checks and equivalence tests." },
  { slug: "modular-clock", title: "Modular Clock", level: 4, domain: "discrete", skills: ["modular-arithmetic"], practice: ["mod-remainder", "linear-congruence", "mod-remainder"], presets: ["clock-12", "mod-4", "mod-17"],
    summary: "Step around a clock of size m; see congruence classes and solve ax ≡ b (mod m)." },
  { slug: "counting-lab", title: "Counting Tree", level: 4, domain: "discrete", skills: ["factorial-permutations", "combinations"], practice: ["permutations-combinations", "permutations-combinations", "two-dice-probability"], presets: ["abcd", "committee"],
    summary: "List every arrangement or selection of a small set to see why nPr = n!/(n−r)! and nCr divides by r!." },
  // ---- calculus ----
  { slug: "limit-explorer", title: "Limit Explorer", level: 5, domain: "calculus", skills: ["limits", "continuity"], practice: ["limit-removable", "limit-removable", "limit-removable"], presets: ["hole", "jump", "asymptote", "sinx-over-x"],
    summary: "Approach a point from the left and right with a table of values; holes, jumps and asymptotes behave differently." },
  { slug: "tangent-lab", title: "Tangent & Derivative Lab", level: 5, domain: "calculus", skills: ["derivative-definition", "differentiation-rules"], practice: ["derivative-at-point", "derivative-polynomial", "chain-rule-power"], presets: ["cubic", "sine", "exp"],
    summary: "Shrink h and watch the secant become the tangent; compare the difference quotient with the exact derivative." },
  { slug: "riemann-lab", title: "Integral Area Explorer", level: 5, domain: "calculus", skills: ["definite-integrals", "antiderivatives", "numerical-calculus"], practice: ["definite-integral-poly", "definite-integral-poly", "definite-integral-poly"], presets: ["x-squared", "sine", "negative-area"],
    summary: "Approximate signed area with left, right, midpoint and trapezoid sums; watch the error shrink as n grows." },
  { slug: "series-lab", title: "Sequence & Series Lab", level: 5, domain: "calculus", skills: ["sequences", "series-convergence", "taylor-series"], practice: ["geometric-series-sum", "geometric-series-sum", "geometric-series-sum"], presets: ["geometric", "harmonic", "alternating", "p-series"],
    summary: "Plot terms and partial sums of standard series to see convergence and divergence." },
  // ---- linear algebra ----
  { slug: "matrix-transform", title: "Matrix Transformation Studio", level: 6, domain: "linear-algebra", skills: ["matrix-transformations", "determinants", "eigen"], practice: ["det-2x2", "matrix-product-2x2", "det-3x3"], presets: ["rotation", "shear", "reflection", "singular"],
    summary: "Apply a 2×2 matrix to the grid; the determinant is the area scale factor (negative = flipped), and eigenvectors stay on their line." },
  { slug: "vector-lab", title: "Vector Playground", level: 6, domain: "linear-algebra", skills: ["vectors", "dot-cross-product"], practice: ["dot-product-angle", "dot-product-angle", "dot-product-angle"], presets: ["perpendicular", "parallel", "obtuse"],
    summary: "Drag two vectors; see the sum, difference, dot product, angle and projection update." },
  // ---- probability & statistics ----
  { slug: "probability-lab", title: "Probability Lab", level: 7, domain: "probability-stats", skills: ["probability-basics", "sampling-clt"], practice: ["two-dice-probability", "two-dice-probability", "expectation-discrete"], presets: ["two-dice", "coin"],
    summary: "Roll dice or flip coins thousands of times with a seed; compare experimental frequencies with exact probabilities." },
  { slug: "distribution-builder", title: "Distribution Builder", level: 7, domain: "probability-stats", skills: ["random-variables", "discrete-distributions", "continuous-distributions"], practice: ["binomial-probability", "normal-probability", "expectation-discrete"], presets: ["binomial", "poisson", "normal", "exponential"],
    summary: "Binomial, Poisson, normal and exponential: change parameters and shade P(a ≤ X ≤ b) as bars or area." },
  { slug: "clt-lab", title: "Sampling & CLT Lab", level: 7, domain: "probability-stats", skills: ["sampling-clt", "confidence-intervals"], practice: ["normal-probability", "normal-probability", "mean-median"], presets: ["uniform", "exponential", "dice"],
    summary: "Draw many samples from a skewed population; the histogram of sample means becomes normal with SD σ/√n." },
  { slug: "regression-studio", title: "Regression Studio", level: 7, domain: "probability-stats", skills: ["linear-regression", "correlation"], practice: ["regression-slope", "regression-slope", "mean-median"], presets: ["cars", "outlier", "no-correlation"],
    summary: "Add and drag points; see the least-squares line, residuals, r and R² — including R's built-in cars data." },
  // ---- numerical / AI ----
  { slug: "newton-raphson", title: "Newton–Raphson Visualizer", level: 8, domain: "numerical", skills: ["root-finding"], practice: ["newton-step", "newton-step", "newton-step"], presets: ["sqrt2", "lecture-cubic", "cycle", "flat"],
    summary: "Follow tangent lines to a root; try starting points that converge, cycle or hit a flat tangent." },
  { slug: "ode-lab", title: "Differential Equation Lab", level: 8, domain: "numerical", skills: ["ode-intro", "numerical-ode"], practice: ["euler-step", "euler-step", "euler-step"], presets: ["growth", "decay", "logistic"],
    summary: "Direction field, Euler and RK4 solutions against the exact solution; change the step size and watch the error." },
  { slug: "fourier-synth", title: "Fourier Wave Synthesizer", level: 8, domain: "numerical", skills: ["fourier-series", "trig-graphs"], practice: ["exact-trig-values", "degrees-to-radians", "exact-trig-values"], presets: ["square", "sawtooth", "triangle", "custom"],
    summary: "Build square, sawtooth and triangle waves from sines; see the partial sums, the Gibbs overshoot and the spectrum." },
  { slug: "gradient-descent", title: "Gradient Descent Lab", level: 9, domain: "ai-ml", skills: ["gradient-descent", "optimisation-numeric", "convexity-regularisation"], practice: ["gradient-descent-step", "gradient-descent-step", "partial-derivative"], presets: ["good-rate", "oscillate", "diverge", "valley"],
    summary: "Run gradient descent on 1-D and 2-D losses; small learning rates crawl, large ones oscillate or diverge." },
];

export const simulationBySlug = (slug: string) => SIMULATIONS.find((s) => s.slug === slug);
export const simulationsForSkill = (skill: string) => SIMULATIONS.filter((s) => s.skills.includes(skill));
