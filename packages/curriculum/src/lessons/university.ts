import type { Lesson } from "../types";

export const limits: Lesson = {
  slug: "limits-intuition",
  title: "Limits: what a function approaches",
  topic: "limits",
  alsoCovers: ["continuity"],
  level: 5,
  summary: "Approach a point from both sides with tables and graphs; holes, jumps and asymptotes; why 0/0 is a question, not an answer. Matches FY S1 Ch 07A.",
  bridgesFor: ["fy-s1-07a", "fy-s1-07b", "sy-s1-05"],
  stages: [
    { id: "why", blocks: [
      { t: "text", md: "Speed at an *instant*, the slope of a curve at a *point*, the area under a curve, the sum of infinitely many terms — every one of these is defined by a **limit**. FY S1 Chapter 07A introduces them before differentiation for exactly this reason." },
    ]},
    { id: "intuition", blocks: [
      { t: "text", mode: "simple", md: "Walk towards a door from the left and from the right. The **limit** is where you are heading, even if the doorway itself is blocked. For a function, $\\lim_{x \\to a} f(x) = L$ means: as $x$ gets closer and closer to $a$ (but not equal to it), $f(x)$ gets closer and closer to $L$." },
      { t: "text", mode: "simple", md: "So the limit cares about the **neighbourhood** of $a$, not the value at $a$. The function $\\frac{x^2 - 1}{x - 1}$ is undefined at $x = 1$ (it gives 0/0), yet near 1 it behaves exactly like $x + 1$, so it heads to **2**." },
      { t: "text", mode: "formal", md: "$\\lim_{x\\to a} f(x) = L$ if for every $\\varepsilon > 0$ there is $\\delta > 0$ such that $0 < |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon$. The two-sided limit exists iff both one-sided limits exist and are equal. $f$ is continuous at $a$ iff $\\lim_{x\\to a} f(x) = f(a)$." },
      { t: "text", mode: "university", md: "Lecture 07A (pp. 3–5) defines the limit and one-sided limits, then gives the limit laws (pp. 6–7). Infinite limits ‘$= \\infty$’ (pp. 12–13) are a description of unbounded growth: the limit does not exist as a real number. Indeterminate forms (pp. 14–15) like $\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$ require algebra (factorising, dividing by the highest power) or, later, L'Hôpital's rule (SY S1 Ch 01)." },
      { t: "callout", kind: "warning", md: "**0/0 is not 0, not 1, and not ‘undefined’ as a final answer.** It means substitution failed to tell you anything. Simplify first." },
    ]},
    { id: "visualize", blocks: [{ t: "sim", slug: "limit-explorer", preset: "hole", caption: "A removable hole at x = 1" }] },
    { id: "explore", blocks: [
      { t: "text", md: "Switch between the four functions. For each, read the left and right columns of the table as h shrinks. When do they agree? Which function is *continuous* at $a$?" },
      { t: "sim", slug: "limit-explorer", preset: "jump" },
    ]},
    { id: "meaning", blocks: [
      { t: "symbols", items: [
        { symbol: "\\lim_{x\\to a} f(x)", name: "limit of f as x approaches a", meaning: "the value f(x) heads towards", values: "a real number, or ±∞ to describe unbounded growth" },
        { symbol: "x \\to a^-", name: "from the left", meaning: "only x < a", values: "" },
        { symbol: "x \\to a^+", name: "from the right", meaning: "only x > a", values: "" },
        { symbol: "\\varepsilon,\\ \\delta", name: "epsilon, delta", meaning: "tolerances: output within ε when input within δ", values: "positive real numbers" },
      ]},
    ]},
    { id: "worked", blocks: [
      { t: "steps", title: "Evaluate lim (x² − 9)/(x − 3) as x → 3", steps: [
        { md: "Substitute: $\\frac{9 - 9}{3 - 3} = \\frac{0}{0}$ — indeterminate, so simplify." },
        { md: "Factorise the top (difference of squares).", tex: "\\frac{(x - 3)(x + 3)}{x - 3}" },
        { md: "Cancel $(x - 3)$ — allowed because $x \\ne 3$ while approaching.", tex: "= x + 3 \\quad (x \\ne 3)" },
        { md: "Now substitute.", tex: "\\lim_{x \\to 3} (x + 3) = 6" },
      ]},
      { t: "steps", title: "A limit at infinity: lim (3x² − 1)/(x² + 5) as x → ∞", steps: [
        { md: "Divide top and bottom by the highest power, $x^2$.", tex: "\\frac{3 - 1/x^2}{1 + 5/x^2}" },
        { md: "As $x \\to \\infty$, $1/x^2 \\to 0$.", tex: "\\to \\frac{3 - 0}{1 + 0} = 3" },
        { md: "Rule of thumb (lecture p. 16): equal degrees → ratio of leading coefficients." },
      ]},
    ]},
    { id: "try", blocks: [
      { t: "try", prompt: "For $\\frac{x^2 - 4}{x - 2}$, factorise the top. After cancelling, what expression remains? (in x)", answer: { kind: "expression", value: "x + 2", variables: ["x"] }, hints: ["$x^2 - 4$ is a difference of squares.", "$a^2 - b^2 = (a - b)(a + b)$.", "$(x-2)(x+2)$; cancel $(x - 2)$."], solution: [{ md: "", tex: "\\frac{(x-2)(x+2)}{x-2} = x + 2" }], answerDisplay: "x + 2" },
      { t: "try", prompt: "So $\\lim_{x\\to 2} \\frac{x^2 - 4}{x - 2} = \\;?$", answer: { kind: "integer", value: 4 }, hints: ["Substitute x = 2 into x + 2.", "2 + 2.", "4."], solution: [{ md: "", tex: "2 + 2 = 4" }], answerDisplay: "4", misconceptions: [{ id: "zero", values: ["0"], feedback: "0/0 doesn't mean 0 — simplify first, then substitute." }] },
    ]},
    { id: "tools", blocks: [
      { t: "code", lang: "python", code: "from sympy import limit, symbols, sin\nx = symbols('x')\nprint(limit((x**2 - 9)/(x - 3), x, 3))\nprint(limit(sin(x)/x, x, 0))", note: "SymPy prints 6 and 1. MCC's Limit Explorer reaches the same values numerically: with h = 10⁻⁶, sin(h)/h = 0.9999999999998334." },
      { t: "callout", kind: "exact", md: "A table of values *suggests* a limit; it does not *prove* one (a function could misbehave between the sampled points). The algebra in the worked example is the proof." },
    ]},
    { id: "practice", blocks: [{ t: "practice", templates: ["limit-removable"], count: 5 }] },
    { id: "apply", blocks: [
      { t: "text", md: "**Average → instantaneous speed.** A ball's height is $s(t) = 20t - 5t^2$ metres. Average speed over $[1, 1 + h]$ is $\\frac{s(1 + h) - s(1)}{h} = 10 - 5h$. What does it approach as $h \\to 0$?" },
      { t: "try", prompt: "Instantaneous speed at t = 1 (m/s):", answer: { kind: "integer", value: 10 }, hints: ["Let h shrink to 0 in 10 − 5h.", "5h → 0.", "10."], solution: [{ md: "", tex: "\\lim_{h \\to 0} (10 - 5h) = 10\\ \\text{m/s}" }, { md: "That limit is the derivative $s'(1)$ — next lesson." }], answerDisplay: "10 m/s" },
    ]},
    { id: "mastery", blocks: [{ t: "mastery", templates: ["limit-removable", "limit-removable", "limit-removable"] }] },
    { id: "next", blocks: [{ t: "links", items: [
      { kind: "lesson", id: "derivative-as-slope", label: "Next: the derivative as a limit" },
      { kind: "lesson", id: "slope-and-straight-lines", label: "Need basics? Slope" },
      { kind: "academy", id: "fy-s1-07a", label: "Back to FY S1 Ch 07A Limits" },
    ]}]},
  ],
};

export const derivative: Lesson = {
  slug: "derivative-as-slope",
  title: "The derivative: slope at a point",
  topic: "derivative-definition",
  alsoCovers: ["differentiation-rules"],
  level: 5,
  summary: "Secant slopes shrink to the tangent slope; the power, sum and chain rules. Matches FY S1 Ch 07B and the recap in SY S1 Ch 01.",
  bridgesFor: ["fy-s1-07b", "sy-s1-01", "sy-s1-nr"],
  stages: [
    { id: "why", blocks: [{ t: "text", md: "Rates of change are everywhere: velocity, growth rate of a cell culture, marginal cost, and — in machine learning — the gradient that tells a model which way to adjust its weights. The derivative is the precise version of ‘rate of change right now’." }] },
    { id: "intuition", blocks: [
      { t: "text", mode: "simple", md: "Pick two points on a curve and join them: that **secant** line has a slope you already know how to find (rise/run). Now slide the second point towards the first. The secant swings and settles into the **tangent** — the line that just touches the curve. Its slope is the derivative." },
      { t: "text", mode: "formal", md: "$f'(a) = \\lim_{h \\to 0} \\frac{f(a + h) - f(a)}{h}$, when this limit exists. $f$ is differentiable at $a$ if it does. The derivative function $f'(x)$ gives the tangent slope at every $x$." },
      { t: "text", mode: "university", md: "Lecture 07B defines differentiability at a value (p. 3) and on a set (p. 4), lists basic derivatives (p. 5) and the rules including the chain rule $(f(g(x)))' = f'(g(x))g'(x)$ (pp. 6–7). Differentiability implies continuity, but not conversely ($|x|$ at 0)." },
      { t: "callout", kind: "analogy", md: "**Zoom analogy:** zoom far enough into a smooth curve and it looks straight; the derivative is the slope of that straight piece. The analogy fails at corners (like $|x|$ at 0) — zooming never straightens them, and the derivative doesn't exist there." },
    ]},
    { id: "visualize", blocks: [{ t: "sim", slug: "tangent-lab", preset: "cubic", caption: "Shrink h: the dashed secant becomes the orange tangent" }] },
    { id: "explore", blocks: [
      { t: "text", md: "Set h to 1, 0.1, 0.01 and watch the *error* readout. Then drag the point to where the tangent is **horizontal** — what is $f'(a)$ there? Try typing your own function, e.g. `x^2` or `sin(x)`." },
      { t: "sim", slug: "tangent-lab", preset: "sine" },
    ]},
    { id: "meaning", blocks: [
      { t: "symbols", items: [
        { symbol: "f'(x)", name: "f prime of x", meaning: "derivative of f: slope of the tangent at x", values: "" },
        { symbol: "\\frac{dy}{dx}", name: "Leibniz notation", meaning: "same as $f'(x)$ when $y = f(x)$; ‘small change in y per small change in x’", values: "" },
        { symbol: "h", name: "step", meaning: "horizontal gap between the two secant points", values: "h ≠ 0" },
      ]},
      { t: "table", caption: "Rules used in the practice (from lecture 07B pp. 5–7)", head: ["Rule", "Formula"], rows: [["Power", "$\\frac{d}{dx}x^n = nx^{n-1}$"], ["Constant", "$\\frac{d}{dx}c = 0$"], ["Sum", "$(f + g)' = f' + g'$"], ["Chain", "$(f(g(x)))' = f'(g(x))\\,g'(x)$"]] },
    ]},
    { id: "worked", blocks: [
      { t: "steps", title: "From the definition: f(x) = x² at a = 3", steps: [
        { md: "Difference quotient:", tex: "\\frac{(3 + h)^2 - 9}{h} = \\frac{9 + 6h + h^2 - 9}{h} = \\frac{6h + h^2}{h}" },
        { md: "Cancel h (allowed, h ≠ 0):", tex: "= 6 + h" },
        { md: "Let h → 0:", tex: "f'(3) = 6" },
        { md: "Agrees with the power rule: $f'(x) = 2x$, so $f'(3) = 6$ ✓" },
      ]},
      { t: "steps", title: "Chain rule: y = (2x + 1)³", steps: [
        { md: "Outside: $u^3 \\to 3u^2$ with $u = 2x + 1$.", tex: "3(2x + 1)^2" },
        { md: "Inside derivative: $\\frac{d}{dx}(2x + 1) = 2$." },
        { md: "Multiply:", tex: "\\frac{dy}{dx} = 3(2x + 1)^2 \\times 2 = 6(2x + 1)^2" },
      ]},
    ]},
    { id: "try", blocks: [
      { t: "try", prompt: "For $f(x) = x^2$ at $a = 1$, the difference quotient simplifies to $2 + h$. What is $f'(1)$?", answer: { kind: "integer", value: 2 }, hints: ["Let h → 0.", "2 + 0.", "2."], solution: [{ md: "", tex: "\\lim_{h\\to 0}(2 + h) = 2" }], answerDisplay: "2" },
      { t: "try", prompt: "Differentiate $f(x) = 4x^3 - 5x + 7$.", answer: { kind: "expression", value: "12x^2 - 5", variables: ["x"] }, hints: ["Power rule term by term.", "$4x^3 \\to 12x^2$, $-5x \\to -5$.", "The constant 7 → 0."], solution: [{ md: "", tex: "f'(x) = 12x^2 - 5" }], answerDisplay: "12x² − 5", misconceptions: [{ id: "kept-constant", values: ["12x^2 - 5 + 7", "12x^2+2"], feedback: "The derivative of a constant is 0." }] },
    ]},
    { id: "tools", blocks: [{ t: "code", lang: "python", code: "from sympy import diff, symbols\nx = symbols('x')\nprint(diff(4*x**3 - 5*x + 7, x))\nprint(diff((2*x + 1)**3, x))", note: "SymPy: `12*x**2 - 5` and `6*(2*x + 1)**2`. MCC's Tangent Lab computes symbolic derivatives with a vetted library and compares them with numerical difference quotients." }] },
    { id: "practice", blocks: [{ t: "practice", templates: ["derivative-polynomial", "derivative-at-point", "chain-rule-power"], count: 6 }] },
    { id: "apply", blocks: [
      { t: "text", md: "**Optimisation preview.** Profit $P(x) = -2x^2 + 40x - 50$ (thousand Rs) for $x$ hundred units. At the best $x$ the tangent is horizontal: $P'(x) = 0$." },
      { t: "try", prompt: "Solve $P'(x) = -4x + 40 = 0$: best x =", answer: { kind: "integer", value: 10 }, hints: ["Set the derivative to 0.", "−4x + 40 = 0.", "x = 10."], solution: [{ md: "", tex: "-4x + 40 = 0 \\Rightarrow x = 10" }, { md: "SY S1 Ch 01 (pp. 9–16) formalises this with stationary points and the second-derivative test: $P''(x) = -4 < 0$, so it is a maximum." }], answerDisplay: "10 (hundred units)" },
    ]},
    { id: "mastery", blocks: [{ t: "mastery", templates: ["derivative-at-point", "derivative-polynomial", "chain-rule-power"] }] },
    { id: "next", blocks: [{ t: "links", items: [
      { kind: "lesson", id: "newton-raphson-method", label: "Next: Newton–Raphson uses tangents to find roots" },
      { kind: "sim", id: "gradient-descent", label: "Derivatives in ML: gradient descent" },
      { kind: "lesson", id: "limits-intuition", label: "Back: limits" },
    ]}]},
  ],
};

export const determinants: Lesson = {
  slug: "determinants-minors-cofactors",
  title: "Determinants, minors, cofactors and the inverse",
  topic: "determinants",
  alsoCovers: ["matrix-inverse"],
  level: 6,
  summary: "Compute 2×2 and 3×3 determinants, minors and cofactors, and solve AX = b with the inverse — the exact worked example of FY S1 Ch 08B, explained geometrically.",
  bridgesFor: ["fy-s1-08b", "fy-s1-08c", "sy-s1-02"],
  stages: [
    { id: "why", blocks: [
      { t: "text", md: "A determinant is one number that tells you whether a system of equations has a unique solution, how a transformation stretches area, and (later) whether a critical point is a maximum, minimum or saddle (the Hessian, SY S1 Ch 02). FY S1 Chapter 08B is entirely handwritten — this lesson follows its exact example: $B = \\begin{pmatrix} 1 & 3 & -2 \\\\ 4 & -5 & 6 \\\\ 3 & 5 & 2 \\end{pmatrix}$." },
    ]},
    { id: "intuition", blocks: [
      { t: "text", mode: "simple", md: "A 2×2 matrix moves every point of the plane. The unit square (area 1) becomes a parallelogram. The **determinant** is the new area — with a minus sign if the shape got flipped over. If the determinant is **0**, everything is squashed onto a line: information is lost and you can't undo the move (no inverse)." },
      { t: "text", mode: "formal", md: "$\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix} = ad - bc$. For $n \\times n$, expand along a row: $\\det A = \\sum_j a_{1j} C_{1j}$ with cofactors $C_{ij} = (-1)^{i+j} M_{ij}$, where the minor $M_{ij}$ is the determinant after deleting row $i$ and column $j$. $A$ is invertible iff $\\det A \\ne 0$, and then $A^{-1} = \\frac{1}{\\det A}\\operatorname{adj}(A)$ with $\\operatorname{adj}(A) = (\\operatorname{cof} A)^T$." },
      { t: "text", mode: "university", md: "Lecture 08B: p1 (1×1, 2×2), p2 (3×3 expansion, $|B| = -80$), pp3–4 (all nine minors of B), pp5–6 (cofactor matrix), pp7–9 (inverse via adjugate), pp10–11 (solving $BX = b$). Every number below was recomputed by MCC's engine and matches the handwritten notes." },
    ]},
    { id: "visualize", blocks: [{ t: "sim", slug: "matrix-transform", preset: "shear", caption: "Shear: area unchanged, det = 1" }] },
    { id: "explore", blocks: [
      { t: "text", md: "Try the presets. Which has det = 0? Which flips orientation (negative det)? Then type $\\begin{pmatrix}-1 & 2\\\\4 & 1\\end{pmatrix}$ (the lecture's first example) and confirm det = −9." },
      { t: "sim", slug: "matrix-transform", preset: "singular" },
    ]},
    { id: "meaning", blocks: [
      { t: "symbols", items: [
        { symbol: "|A| = \\det A", name: "determinant", meaning: "signed area/volume scale factor", values: "a real number (not a matrix); square matrices only" },
        { symbol: "M_{ij}", name: "minor", meaning: "det of A with row i and column j deleted", values: "" },
        { symbol: "C_{ij} = (-1)^{i+j}M_{ij}", name: "cofactor", meaning: "minor with checkerboard sign + − + / − + − / + − +", values: "" },
        { symbol: "\\operatorname{adj}(A)", name: "adjugate", meaning: "transpose of the cofactor matrix", values: "" },
        { symbol: "A^{-1}", name: "inverse", meaning: "the matrix with $AA^{-1} = A^{-1}A = I$", values: "exists iff $|A| \\ne 0$" },
      ]},
    ]},
    { id: "worked", blocks: [
      { t: "steps", title: "|B| by expanding along row 1 (lecture p2)", steps: [
        { md: "Minors of row 1:", tex: "M_{11} = \\begin{vmatrix}-5&6\\\\5&2\\end{vmatrix} = -10 - 30 = -40,\\; M_{12} = \\begin{vmatrix}4&6\\\\3&2\\end{vmatrix} = -10,\\; M_{13} = \\begin{vmatrix}4&-5\\\\3&5\\end{vmatrix} = 35" },
        { md: "Alternate signs + − +:", tex: "|B| = 1(-40) - 3(-10) + (-2)(35) = -40 + 30 - 70 = -80" },
      ]},
      { t: "steps", title: "Cofactors, adjugate and inverse (lecture pp4–9)", steps: [
        { md: "All nine minors:", tex: "M = \\begin{pmatrix}-40&-10&35\\\\16&8&-4\\\\8&14&-17\\end{pmatrix}" },
        { md: "Apply the checkerboard signs:", tex: "\\operatorname{cof}(B) = \\begin{pmatrix}-40&10&35\\\\-16&8&4\\\\8&-14&-17\\end{pmatrix}" },
        { md: "Transpose to get the adjugate, divide by |B| = −80:", tex: "B^{-1} = \\frac{1}{-80}\\begin{pmatrix}-40&-16&8\\\\10&8&-14\\\\35&4&-17\\end{pmatrix} = \\frac{1}{80}\\begin{pmatrix}40&16&-8\\\\-10&-8&14\\\\-35&-4&17\\end{pmatrix}" },
      ]},
      { t: "steps", title: "Solve x + 3y − 2z = 1, 4x − 5y + 6z = 2, 3x + 5y + 2z = 3 (lecture pp10–11)", steps: [
        { md: "Write as $BX = b$ with $b = (1, 2, 3)^T$, so $X = B^{-1}b$." },
        { md: "Multiply:", tex: "X = \\frac{1}{80}\\begin{pmatrix}40 + 32 - 24\\\\-10 - 16 + 42\\\\-35 - 8 + 51\\end{pmatrix} = \\frac{1}{80}\\begin{pmatrix}48\\\\16\\\\8\\end{pmatrix}" },
        { md: "Simplify:", tex: "x = \\tfrac35,\\quad y = \\tfrac15,\\quad z = \\tfrac{1}{10}" },
        { md: "Check in equation 1: $0.6 + 0.6 - 0.2 = 1$ ✓ (all three verified by MCC)." },
      ]},
    ]},
    { id: "try", blocks: [
      { t: "try", prompt: "Find the minor $M_{22}$ of B (delete row 2, column 2): $\\begin{vmatrix}1&-2\\\\3&2\\end{vmatrix}$", answer: { kind: "integer", value: 8 }, hints: ["2×2 determinant: ad − bc.", "(1)(2) − (−2)(3).", "2 + 6."], solution: [{ md: "", tex: "(1)(2) - (-2)(3) = 2 + 6 = 8" }], answerDisplay: "8", misconceptions: [{ id: "sign", values: ["-4"], feedback: "(−2)(3) = −6, and subtracting −6 adds 6." }] },
      { t: "try", prompt: "What is the cofactor $C_{23}$ if $M_{23} = -4$?", answer: { kind: "integer", value: 4 }, hints: ["$C_{ij} = (-1)^{i+j}M_{ij}$.", "2 + 3 = 5 is odd, so the sign is −.", "−(−4)."], solution: [{ md: "", tex: "C_{23} = (-1)^5(-4) = 4" }], answerDisplay: "4", misconceptions: [{ id: "no-sign", values: ["-4"], feedback: "Position (2,3) has a minus in the checkerboard pattern." }] },
    ]},
    { id: "tools", blocks: [
      { t: "code", lang: "r", code: "B <- matrix(c(1,3,-2, 4,-5,6, 3,5,2), nrow = 3, byrow = TRUE)\ndet(B)\nsolve(B, c(1, 2, 3))", note: "R returns −80 (as −80.0 in floating point) and 0.6 0.2 0.1. MCC's engine computes the same exactly (integer cofactor expansion) and by Gauss–Jordan elimination." },
    ]},
    { id: "practice", blocks: [{ t: "practice", templates: ["det-2x2", "det-3x3", "matrix-product-2x2"], count: 6 }] },
    { id: "apply", blocks: [
      { t: "text", md: "**Is the system solvable?** A mixing problem gives $2x + 4y = 10$, $3x + 6y = 15$. Compute the determinant of the coefficient matrix." },
      { t: "try", prompt: "$\\det\\begin{pmatrix}2&4\\\\3&6\\end{pmatrix} = \\;?$", answer: { kind: "integer", value: 0 }, hints: ["ad − bc.", "12 − 12.", "0."], solution: [{ md: "", tex: "2\\cdot 6 - 4 \\cdot 3 = 0" }, { md: "Determinant 0 → no unique solution. Here the second equation is 1.5 × the first, so there are infinitely many solutions (the same line twice)." }], answerDisplay: "0" },
    ]},
    { id: "mastery", blocks: [{ t: "mastery", templates: ["det-2x2", "det-3x3", "matrix-product-2x2"] }] },
    { id: "next", blocks: [{ t: "links", items: [
      { kind: "sim", id: "vector-lab", label: "Next chapter (08C): vectors and dot products" },
      { kind: "academy", id: "fy-s1-08b", label: "Back to FY S1 Ch 08B" },
      { kind: "lesson", id: "number-line-signed-numbers", label: "Signs keep going wrong? Negative numbers" },
    ]}]},
  ],
};

export const newtonRaphson: Lesson = {
  slug: "newton-raphson-method",
  title: "Finding roots: bisection and Newton–Raphson",
  topic: "root-finding",
  level: 8,
  summary: "Locate roots by interval halving, then converge fast by following tangent lines — and see exactly how Newton's method can fail. Matches SY S1 ‘Newton–Raphson method’.",
  bridgesFor: ["sy-s1-nr"],
  stages: [
    { id: "why", blocks: [{ t: "text", md: "Most equations cannot be solved with a formula: $x^3 - 2x - 5 = 0$, $\\cos x = x$, or the equations inside statistics software when it fits a logistic regression. Computers solve them *numerically*. Newton–Raphson is the classic method — fast when it works, and instructive when it doesn't." }] },
    { id: "intuition", blocks: [
      { t: "text", mode: "simple", md: "**Bisection:** if $f$ is negative at one end of an interval and positive at the other, a smooth curve must cross zero in between. Cut the interval in half, keep the half where the sign still changes, repeat. Slow but safe." },
      { t: "text", mode: "simple", md: "**Newton–Raphson:** stand on the curve at a guess $x_n$. Pretend the curve is its tangent line and slide down that line to where it hits the x-axis. That's the next guess. Near a simple root, the number of correct digits roughly **doubles** each step." },
      { t: "text", mode: "formal", md: "The tangent at $x_n$ is $y = f(x_n) + f'(x_n)(x - x_n)$. Setting $y = 0$: $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$, valid when $f'(x_n) \\ne 0$. For a simple root and a good start, convergence is quadratic: $|e_{n+1}| \\approx C|e_n|^2$." },
      { t: "text", mode: "university", md: "The lecture (p1) classifies roots as simple ($f(x_0) = 0, f'(x_0) \\ne 0$) or multiple; for $f(x) = x^3 - 3x^2 + 4$ the negative root $-1$ is simple and $2$ is a double root. Newton converges only linearly at a double root — try it in the lab. Pages 2–3 locate a root by halving intervals before introducing Newton–Raphson." },
    ]},
    { id: "visualize", blocks: [{ t: "sim", slug: "newton-raphson", preset: "sqrt2", caption: "Tangent steps converging to √2" }] },
    { id: "explore", blocks: [
      { t: "text", md: "1. In the **cycle** preset, start at $x_0 = 0$ and watch the iterates bounce 0 → 1 → 0. 2. In the **flat** preset, start near 0 where the tangent is horizontal. 3. In the **lecture cubic**, compare the number of iterations starting near −1 vs near 2." },
      { t: "sim", slug: "newton-raphson", preset: "cycle" },
    ]},
    { id: "meaning", blocks: [
      { t: "symbols", items: [
        { symbol: "x_n", name: "n-th iterate", meaning: "the current guess", values: "" },
        { symbol: "x_{n+1}", name: "next iterate", meaning: "where the tangent at $x_n$ meets the x-axis", values: "" },
        { symbol: "f'(x_n)", name: "slope at the guess", meaning: "must not be 0", values: "≠ 0" },
        { symbol: "|x_{n+1} - x_n| < \\text{tol}", name: "stopping rule", meaning: "stop when guesses stop changing", values: "tol e.g. 10⁻¹²" },
      ]},
    ]},
    { id: "worked", blocks: [
      { t: "steps", title: "√2 as the root of f(x) = x² − 2, starting at x₀ = 1", steps: [
        { md: "$f'(x) = 2x$, so", tex: "x_{n+1} = x_n - \\frac{x_n^2 - 2}{2x_n} = \\frac{x_n}{2} + \\frac{1}{x_n}" },
        { md: "Step 1:", tex: "x_1 = \\tfrac12 + 1 = 1.5" },
        { md: "Step 2:", tex: "x_2 = 0.75 + \\tfrac{1}{1.5} = 1.41\\overline{6}" },
        { md: "Step 3:", tex: "x_3 = \\tfrac{577}{408} \\approx 1.4142157" },
        { md: "True value $\\sqrt2 \\approx 1.4142136$: after 3 steps the error is about $2 \\times 10^{-6}$ — correct digits roughly double each step." },
      ]},
    ]},
    { id: "try", blocks: [
      { t: "try", prompt: "For $f(x) = x^2 - 5$ from $x_0 = 2$: what is $f(x_0)$?", answer: { kind: "integer", value: -1 }, hints: ["Substitute 2.", "4 − 5.", "−1."], solution: [{ md: "", tex: "f(2) = 4 - 5 = -1" }], answerDisplay: "−1" },
      { t: "try", prompt: "Then $x_1 = 2 - \\frac{f(2)}{f'(2)} = \\;?$ (exact)", answer: { kind: "rational", value: "9/4" }, hints: ["f'(x) = 2x, so f'(2) = 4.", "2 − (−1)/4.", "2 + 1/4."], solution: [{ md: "", tex: "x_1 = 2 - \\frac{-1}{4} = \\frac94 = 2.25" }], answerDisplay: "9/4", misconceptions: [{ id: "plus", values: ["7/4"], feedback: "Subtracting −1/4 *adds* 1/4." }] },
    ]},
    { id: "tools", blocks: [
      { t: "code", lang: "python", code: "def newton(f, df, x, steps=6):\n    for _ in range(steps):\n        x = x - f(x) / df(x)\n        print(x)\n\nnewton(lambda x: x*x - 5, lambda x: 2*x, 2.0)", note: "MCC's engine prints the same sequence:", computed: [{ label: "x₁", value: "2.25" }, { label: "x₂", value: "2.236111111111111" }, { label: "x₃", value: "2.236067977915804" }, { label: "√5", value: "2.23606797749979" }] },
      { t: "code", lang: "r", code: "uniroot(function(x) x^2 - 5, c(2, 3))$root", note: "R's `uniroot` uses a bracketing method (safe like bisection) and returns ≈ 2.236068 to its default tolerance." },
    ]},
    { id: "practice", blocks: [{ t: "practice", templates: ["newton-step"], count: 4 }] },
    { id: "apply", blocks: [
      { t: "text", md: "**Square roots by hand.** Your calculator uses a method like this. Use one Newton step on $x^2 - 10$ from $x_0 = 3$." },
      { t: "try", prompt: "$x_1$ (exact fraction):", answer: { kind: "rational", value: "19/6" }, hints: ["$x_1 = \\frac{x_0}{2} + \\frac{10}{2x_0}$.", "$\\frac32 + \\frac{10}{6}$.", "$\\frac{9}{6} + \\frac{10}{6}$."], solution: [{ md: "", tex: "x_1 = \\frac{19}{6} \\approx 3.1667\\quad(\\sqrt{10} \\approx 3.1623)" }], answerDisplay: "19/6" },
    ]},
    { id: "mastery", blocks: [{ t: "mastery", templates: ["newton-step", "derivative-at-point", "derivative-polynomial"] }] },
    { id: "next", blocks: [{ t: "links", items: [
      { kind: "sim", id: "ode-lab", label: "More numerical methods: Euler and RK4" },
      { kind: "lesson", id: "derivative-as-slope", label: "Need basics? Derivatives" },
      { kind: "academy", id: "sy-s1-nr", label: "Back to SY S1 Newton–Raphson" },
    ]}]},
  ],
};
