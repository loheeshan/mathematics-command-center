import { Rational, mod, solveLinearCongruence, truthTable, permutations, combinations, factorial, gcd, expressionsEquivalent, parseExpression, type Rng } from "@mcc/math-engine";
import type { QuestionTemplate } from "../types";
import { numEq, ratEq } from "../check";

const R = (n: number, d = 1) => new Rational(n, d);
const signed = (k: number) => (k < 0 ? `- ${-k}` : `+ ${k}`);

function polyTex(cs: number[]) {
  // cs[i] is coefficient of x^i
  const terms: string[] = [];
  for (let i = cs.length - 1; i >= 0; i--) {
    const c = cs[i];
    if (c === 0) continue;
    const mag = Math.abs(c);
    const body = i === 0 ? `${mag}` : `${mag === 1 ? "" : mag}x${i > 1 ? `^{${i}}` : ""}`;
    terms.push(`${terms.length === 0 ? (c < 0 ? "-" : "") : c < 0 ? " - " : " + "}${body}`);
  }
  return terms.join("") || "0";
}
const polySrc = (cs: number[]) => cs.map((c, i) => `(${c})*x^${i}`).join(" + ");

const FORMULAS: { f: string; label: string }[] = [
  { f: "P & Q", label: "P ∧ Q" },
  { f: "P | Q", label: "P ∨ Q" },
  { f: "P -> Q", label: "P ⇒ Q" },
  { f: "P <-> Q", label: "P ⇔ Q" },
  { f: "~P | Q", label: "∼P ∨ Q" },
  { f: "~(P & Q)", label: "∼(P ∧ Q)" },
  { f: "(P | Q) & ~(P & Q)", label: "(P ∨ Q) ∧ ∼(P ∧ Q)" },
  { f: "Q -> P", label: "Q ⇒ P" },
  { f: "~Q -> ~P", label: "∼Q ⇒ ∼P" },
  { f: "(P -> Q) & (Q -> P)", label: "(P ⇒ Q) ∧ (Q ⇒ P)" },
];

const STD_ANGLES: { deg: number; rad: string; radTex: string }[] = [
  { deg: 30, rad: "pi/6", radTex: "\\frac{\\pi}{6}" }, { deg: 45, rad: "pi/4", radTex: "\\frac{\\pi}{4}" },
  { deg: 60, rad: "pi/3", radTex: "\\frac{\\pi}{3}" }, { deg: 90, rad: "pi/2", radTex: "\\frac{\\pi}{2}" },
  { deg: 120, rad: "2pi/3", radTex: "\\frac{2\\pi}{3}" }, { deg: 135, rad: "3pi/4", radTex: "\\frac{3\\pi}{4}" },
  { deg: 150, rad: "5pi/6", radTex: "\\frac{5\\pi}{6}" }, { deg: 210, rad: "7pi/6", radTex: "\\frac{7\\pi}{6}" },
  { deg: 225, rad: "5pi/4", radTex: "\\frac{5\\pi}{4}" }, { deg: 300, rad: "5pi/3", radTex: "\\frac{5\\pi}{3}" },
];

const EXACT_TRIG: Record<number, { sin: string; cos: string; sinTex: string; cosTex: string }> = {
  0: { sin: "0", cos: "1", sinTex: "0", cosTex: "1" },
  30: { sin: "1/2", cos: "sqrt(3)/2", sinTex: "\\tfrac12", cosTex: "\\tfrac{\\sqrt3}{2}" },
  45: { sin: "sqrt(2)/2", cos: "sqrt(2)/2", sinTex: "\\tfrac{\\sqrt2}{2}", cosTex: "\\tfrac{\\sqrt2}{2}" },
  60: { sin: "sqrt(3)/2", cos: "1/2", sinTex: "\\tfrac{\\sqrt3}{2}", cosTex: "\\tfrac12" },
  90: { sin: "1", cos: "0", sinTex: "1", cosTex: "0" },
};

function setOf(rng: Rng, size: number, hi: number) {
  return rng.shuffle(Array.from({ length: hi }, (_, i) => i + 1)).slice(0, size).sort((a, b) => a - b);
}

export const discreteCalculusTemplates: QuestionTemplate[] = [
  {
    id: "set-cardinality",
    skill: "sets",
    title: "Union, intersection and difference",
    difficulty: 1,
    representation: "symbolic",
    generate(rng) {
      const A = setOf(rng, rng.int(3, 6), 12);
      const B = setOf(rng, rng.int(3, 6), 12);
      const inter = A.filter((x) => B.includes(x));
      const uni = [...new Set([...A, ...B])].sort((a, b) => a - b);
      const diff = A.filter((x) => !B.includes(x));
      const which = rng.pick(["union", "intersection", "difference"] as const);
      const ans = which === "union" ? uni.length : which === "intersection" ? inter.length : diff.length;
      const sym = which === "union" ? "A \\cup B" : which === "intersection" ? "A \\cap B" : "A - B";
      return {
        prompt: `Let $A = \\{${A.join(", ")}\\}$ and $B = \\{${B.join(", ")}\\}$. How many elements are in $${sym}$?`,
        answer: { kind: "integer", value: ans },
        hints: [
          which === "union" ? "$A \\cup B$ contains everything in A **or** B (or both), each element listed once." : which === "intersection" ? "$A \\cap B$ contains the elements in **both** A and B." : "$A - B$ contains the elements of A that are **not** in B.",
          `The common elements are $\\{${inter.join(", ") || "\\,"}\\}$.`,
          which === "union" ? `$n(A \\cup B) = n(A) + n(B) - n(A \\cap B) = ${A.length} + ${B.length} - ${inter.length}$.` : which === "intersection" ? "Count them." : `Remove the common elements from A.`,
        ],
        solution: [{ text: "", tex: `${sym} = \\{${(which === "union" ? uni : which === "intersection" ? inter : diff).join(", ") || "\\;"}\\},\\quad n(${sym}) = ${ans}` }],
        answerDisplay: `$${ans}$`,
        misconceptions: which === "union" ? [{ id: "double-count", detect: (s) => inter.length > 0 && numEq(s, A.length + B.length), feedback: "You counted the shared elements twice. A set lists each element once: subtract $n(A \\cap B)$." }] : [],
        exactness: "exact",
      };
    },
  },
  {
    id: "truth-table-column",
    skill: "propositional-logic",
    title: "Complete a truth table",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const F = rng.pick(FORMULAS);
      const t = truthTable(F.f, ["P", "Q"]);
      const labels = t.rows.map((r) => `P=${r.env.P ? "T" : "F"}, Q=${r.env.Q ? "T" : "F"}`);
      const imp = F.f.includes("->") && !F.f.includes("<->");
      return {
        prompt: `Complete the truth-table column for $${F.label.replace(/∧/g, "\\land ").replace(/∨/g, "\\lor ").replace(/⇒/g, "\\Rightarrow ").replace(/⇔/g, "\\Leftrightarrow ").replace(/∼/g, "\\sim ")}$ (rows in the order TT, TF, FT, FF).`,
        answer: { kind: "boolean-list", values: t.rows.map((r) => r.value), labels },
        hints: [
          "Work out the innermost parts first, one row at a time.",
          imp ? "An implication $A \\Rightarrow B$ is false **only** when A is true and B is false." : "$\\land$ needs both true; $\\lor$ needs at least one true; $\\Leftrightarrow$ needs both the same.",
          `First row (P=T, Q=T): the value is ${t.rows[0].value ? "T" : "F"}.`,
        ],
        solution: t.rows.map((r, i) => ({ text: `${labels[i]} → **${r.value ? "T" : "F"}**` })),
        answerDisplay: t.rows.map((r) => (r.value ? "T" : "F")).join(", "),
        misconceptions: imp ? [{ id: "implication-false-when-antecedent-false", detect: (s) => s.toUpperCase().replace(/\s/g, "").split(",").slice(2).includes("F") && !t.rows.slice(2).some((r) => !r.value), feedback: "When the 'if' part is false, an implication is **true** (vacuously): the promise was never tested." }] : [],
        exactness: "exact",
      };
    },
  },
  {
    id: "contrapositive",
    skill: "propositional-logic",
    title: "Converse, inverse, contrapositive",
    difficulty: 2,
    representation: "conceptual",
    generate(rng) {
      const pairs = [
        ["it is raining", "the ground is wet"],
        ["a number is divisible by 4", "it is even"],
        ["a matrix has determinant 0", "it has no inverse"],
        ["x² is odd", "x is odd"],
      ];
      const [p, q] = rng.pick(pairs);
      const opts = rng.shuffle([
        { id: "contra", label: `If NOT (${q}), then NOT (${p}).` },
        { id: "converse", label: `If ${q}, then ${p}.` },
        { id: "inverse", label: `If NOT (${p}), then NOT (${q}).` },
        { id: "same", label: `If ${p}, then ${q}.` },
      ]);
      return {
        prompt: `Which statement is the **contrapositive** of: "If ${p}, then ${q}"?`,
        answer: { kind: "choice", options: opts, correct: ["contra"] },
        hints: ["The contrapositive of $P \\Rightarrow Q$ is $\\sim Q \\Rightarrow \\sim P$: swap **and** negate.", "It is logically equivalent to the original statement.", "Look for the option that starts from 'NOT Q'."],
        solution: [{ text: "Swap the parts and negate both:", tex: "P \\Rightarrow Q \\;\\equiv\\; \\sim Q \\Rightarrow \\sim P" }],
        answerDisplay: `If NOT (${q}), then NOT (${p}).`,
        misconceptions: [
          { id: "converse", detect: (s) => s === "converse", feedback: "That is the **converse** ($Q \\Rightarrow P$): swapped but not negated. It is *not* equivalent to the original." },
          { id: "inverse", detect: (s) => s === "inverse", feedback: "That is the **inverse** ($\\sim P \\Rightarrow \\sim Q$): negated but not swapped." },
        ],
        exactness: "exact",
      };
    },
  },
  {
    id: "mod-remainder",
    skill: "modular-arithmetic",
    title: "Remainders using congruence",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const m = rng.int(3, 13);
      const nums = Array.from({ length: rng.int(3, 5) }, () => rng.int(10, 99));
      const product = rng.next() < 0.4;
      const ans = product ? nums.slice(0, 3).reduce((a, b) => mod(a * b, m), 1) : mod(nums.reduce((a, b) => a + b, 0), m);
      const used = product ? nums.slice(0, 3) : nums;
      return {
        prompt: `Without a calculator, find the remainder when $${used.join(product ? " \\times " : " + ")}$ is divided by ${m}.`,
        answer: { kind: "integer", value: ans },
        hints: [
          "Congruence respects + and ×: replace each number by its remainder mod m first.",
          `Remainders mod ${m}: ${used.map((n) => `$${n} \\equiv ${mod(n, m)}$`).join(", ")}.`,
          `${product ? "Multiply" : "Add"} those remainders and reduce mod ${m} again.`,
        ],
        solution: [
          { text: "Reduce each term:", tex: used.map((n) => `${n}\\equiv ${mod(n, m)}`).join(",\\; ") + `\\pmod{${m}}` },
          { text: `${product ? "Multiply" : "Add"} and reduce:`, tex: `${used.map((n) => mod(n, m)).join(product ? "\\times" : "+")} \\equiv ${ans} \\pmod{${m}}` },
        ],
        answerDisplay: `$${ans}$`,
        misconceptions: [{ id: "not-reduced", detect: (s) => { const v = Number(s); return Number.isInteger(v) && v >= m && mod(v, m) === ans; }, feedback: `Your number is congruent to the answer, but a remainder must be between 0 and ${m - 1}. Reduce it once more.` }],
        exactness: "exact",
      };
    },
  },
  {
    id: "linear-congruence",
    skill: "modular-arithmetic",
    title: "Solve ax ≡ b (mod m)",
    difficulty: 3,
    representation: "symbolic",
    generate(rng) {
      const m = rng.pick([7, 11, 13, 17, 19]);
      const a = rng.int(2, m - 1);
      const b = rng.int(1, m - 1);
      const [x] = solveLinearCongruence(a, b, m);
      return {
        prompt: `Find $x \\in \\{0, 1, \\dots, ${m - 1}\\}$ with $${a}x \\equiv ${b} \\pmod{${m}}$.`,
        answer: { kind: "integer", value: x },
        hints: ["You need the number that, multiplied by a, leaves remainder b.", `Since ${m} is prime and ${a} is not a multiple of ${m}, there is exactly one solution in the range.`, `Test values: $${a}\\times x$ for $x = 0, 1, 2, \\dots$ and reduce mod ${m}, or find the inverse of ${a} mod ${m}.`],
        solution: [{ text: "Check:", tex: `${a}\\times ${x} = ${a * x} = ${Math.floor((a * x) / m)}\\times ${m} + ${b} \\equiv ${b} \\pmod{${m}}` }],
        answerDisplay: `$x = ${x}$`,
        exactness: "exact",
      };
    },
  },
  {
    id: "permutations-combinations",
    skill: "combinations",
    title: "Permutations vs combinations",
    difficulty: 2,
    representation: "word-problem",
    generate(rng) {
      const n = rng.int(5, 10);
      const r = rng.int(2, Math.min(4, n - 1));
      const ordered = rng.next() < 0.5;
      const ans = ordered ? permutations(n, r) : combinations(n, r);
      const prompt = ordered
        ? `${n} students run for **president, secretary${r > 2 ? ", treasurer" : ""}${r > 3 ? " and editor" : ""}** of the maths society (${r} different roles). In how many ways can the roles be filled?`
        : `A lab group of ${r} is chosen from ${n} students. Roles are not assigned — only who is in the group matters. How many different groups are possible?`;
      return {
        prompt,
        answer: { kind: "integer", value: ans },
        hints: [
          "Ask: **does order matter?** Different roles → order matters (permutation). Just a group → order doesn't matter (combination).",
          ordered ? `Order matters: ${n} choices for the first role, ${n - 1} for the next, …` : `Order doesn't matter: $\\binom{${n}}{${r}} = \\frac{${n}!}{${r}!\\,${n - r}!}$.`,
          ordered ? `${Array.from({ length: r }, (_, i) => n - i).join(" × ")}` : `Divide $${permutations(n, r)}$ ordered selections by the $${r}! = ${factorial(r)}$ orderings of each group.`,
        ],
        solution: [
          { text: ordered ? "Roles are different, so order matters:" : "Order doesn't matter:", tex: ordered ? `{}^{${n}}P_{${r}} = ${Array.from({ length: r }, (_, i) => n - i).join("\\times")} = ${ans}` : `\\binom{${n}}{${r}} = \\frac{${permutations(n, r)}}{${factorial(r)}} = ${ans}` },
        ],
        answerDisplay: `$${ans}$`,
        misconceptions: [
          { id: "order-confusion", detect: (s) => numEq(s, ordered ? combinations(n, r) : permutations(n, r)), feedback: ordered ? "That counts groups, but here the roles are different, so the *order* of selection matters." : `That counts ordered selections. Each group of ${r} was counted ${factorial(r)} times — divide by ${r}!.` },
          { id: "power", detect: (s) => numEq(s, n ** r), feedback: "That allows the same person to be chosen more than once. Each pick removes one person." },
        ],
        exactness: "exact",
      };
    },
  },
  {
    id: "degrees-to-radians",
    skill: "radians",
    title: "Degrees to radians (exact)",
    difficulty: 1,
    representation: "symbolic",
    generate(rng) {
      const a = rng.pick(STD_ANGLES);
      return {
        prompt: `Convert $${a.deg}^\\circ$ to radians exactly, in terms of $\\pi$ (type pi, e.g. 3pi/4).`,
        answer: { kind: "expression", value: a.rad, variables: [] },
        hints: ["$180^\\circ = \\pi$ radians.", `Multiply by $\\frac{\\pi}{180}$: $${a.deg} \\times \\frac{\\pi}{180}$.`, `Simplify the fraction $\\frac{${a.deg}}{180}$.`],
        solution: [{ text: "", tex: `${a.deg}^\\circ \\times \\frac{\\pi}{180^\\circ} = ${a.radTex}` }],
        answerDisplay: `$${a.radTex}$`,
        misconceptions: [{ id: "inverted-factor", detect: (s) => { try { return Math.abs(eval0(s) - (a.deg * 180) / Math.PI) < 0.5; } catch { return false; } }, feedback: "You multiplied by 180/π. To go from degrees to radians multiply by π/180." }],
        exactness: "exact",
        inputHelp: "Use pi for π, e.g. 5pi/6",
      };
    },
  },
  {
    id: "exact-trig-values",
    skill: "trig-ratios",
    title: "Exact sine and cosine values",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const deg = rng.pick([0, 30, 45, 60, 90]);
      const fn = rng.pick(["sin", "cos"] as const);
      const v = EXACT_TRIG[deg];
      return {
        prompt: `Give the exact value of $\\${fn} ${deg}^\\circ$ (use sqrt(), e.g. sqrt(3)/2).`,
        answer: { kind: "expression", value: v[fn], variables: [] },
        hints: [
          "On the unit circle, the point at angle θ is $(\\cos\\theta, \\sin\\theta)$.",
          deg === 30 || deg === 60 ? "Use an equilateral triangle of side 2 cut in half: sides 1, $\\sqrt3$, 2." : deg === 45 ? "Use a right isosceles triangle with legs 1 and hypotenuse $\\sqrt2$." : "Picture the point on the unit circle at this angle.",
          fn === "sin" ? "sin = opposite / hypotenuse." : "cos = adjacent / hypotenuse.",
        ],
        solution: [{ text: "", tex: `\\${fn} ${deg}^\\circ = ${fn === "sin" ? v.sinTex : v.cosTex}` }],
        answerDisplay: `$${fn === "sin" ? v.sinTex : v.cosTex}$`,
        misconceptions: deg !== 45 && deg % 90 !== 0 ? [{ id: "sin-cos-swap", detect: (s) => { try { return Math.abs(eval0(s) - eval0(v[fn === "sin" ? "cos" : "sin"])) < 1e-9; } catch { return false; } }, feedback: "That is the value of the *other* ratio. Sine is the vertical coordinate on the unit circle; cosine is the horizontal one." }] : [],
        exactness: "exact",
      };
    },
  },
  {
    id: "limit-removable",
    skill: "limits",
    title: "Limits with a removable hole",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const a = rng.intExcept(-6, 6, [0]);
      const k = rng.intExcept(-5, 5, [0]);
      // (x^2 + (k - a)x - ka)/(x - a) = x + k for x ≠ a
      const b = k - a;
      const c = -k * a;
      const ans = a + k;
      return {
        prompt: `Find $\\displaystyle\\lim_{x \\to ${a}} \\frac{x^2 ${b === 0 ? "" : `${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}x`} ${signed(c)}}{x ${signed(-a)}}$.`,
        answer: { kind: "integer", value: ans },
        hints: [
          `Direct substitution gives $\\frac{0}{0}$ — an indeterminate form, not an answer. Simplify first.`,
          `Factorise the top: it has a factor $(x ${signed(-a)})$.`,
          `$x^2 ${b === 0 ? "" : `${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}x`} ${signed(c)} = (x ${signed(-a)})(x ${signed(k)})$. Cancel, then substitute $x = ${a}$.`,
        ],
        solution: [
          { text: "Factorise and cancel (allowed because $x \\neq " + a + "$ while approaching):", tex: `\\frac{(x ${signed(-a)})(x ${signed(k)})}{x ${signed(-a)}} = x ${signed(k)}` },
          { text: "Now substitute:", tex: `\\lim_{x\\to ${a}} (x ${signed(k)}) = ${a} ${signed(k)} = ${ans}` },
        ],
        answerDisplay: `$${ans}$`,
        misconceptions: [{ id: "zero-over-zero", detect: (s) => /undefined|dne|does not exist|0\/0|none/i.test(s) || numEq(s, 0) && ans !== 0, feedback: "0/0 means *substitution didn't tell us* — it's not the limit. The function has a hole at this point; the limit is the height the graph approaches." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "derivative-polynomial",
    skill: "differentiation-rules",
    title: "Differentiate a polynomial",
    difficulty: 1,
    representation: "symbolic",
    generate(rng) {
      const deg = rng.int(2, 4);
      const cs = Array.from({ length: deg + 1 }, (_, i) => (i === deg ? rng.intExcept(-5, 6, [0]) : rng.int(-7, 7)));
      const ds = cs.slice(1).map((c, i) => c * (i + 1));
      return {
        prompt: `Differentiate $f(x) = ${polyTex(cs)}$. Type $f'(x)$ (e.g. 6x^2 - 4).`,
        answer: { kind: "expression", value: polySrc(ds), variables: ["x"] },
        hints: ["Power rule: $\\frac{d}{dx}x^n = n x^{n-1}$; constants differentiate to 0.", "Differentiate term by term (the derivative of a sum is the sum of derivatives).", `The leading term $${polyTex([...Array(deg).fill(0), cs[deg]])}$ becomes $${polyTex([...Array(deg - 1).fill(0), cs[deg] * deg])}$.`],
        solution: [{ text: "Term by term:", tex: `f'(x) = ${polyTex(ds)}` }],
        answerDisplay: `$f'(x) = ${polyTex(ds)}$`,
        misconceptions: [{ id: "kept-constant", detect: (s) => cs[0] !== 0 && safeExprEq(s, `${polySrc(ds)} + (${cs[0]})`), feedback: "The derivative of a constant is 0 — constants don't change, so their rate of change is zero." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "derivative-at-point",
    skill: "derivative-definition",
    title: "Slope of the tangent at a point",
    difficulty: 2,
    representation: "visual",
    generate(rng) {
      const a = rng.intExcept(-3, 3, [0]);
      const b = rng.int(-5, 5);
      const c = rng.int(-5, 5);
      const x0 = rng.int(-3, 3);
      const ans = 2 * a * x0 + b;
      return {
        prompt: `For $f(x) = ${polyTex([c, b, a])}$, find the slope of the tangent line at $x = ${x0}$, i.e. $f'(${x0})$.`,
        answer: { kind: "integer", value: ans },
        hints: ["The derivative $f'(x)$ gives the slope of the tangent at each $x$.", `Differentiate: $f'(x) = ${polyTex([b, 2 * a])}$.`, `Substitute $x = ${x0}$.`],
        solution: [
          { text: "Differentiate:", tex: `f'(x) = ${polyTex([b, 2 * a])}` },
          { text: "Evaluate:", tex: `f'(${x0}) = ${2 * a}(${x0}) ${signed(b)} = ${ans}` },
        ],
        answerDisplay: `$${ans}$`,
        misconceptions: [{ id: "function-value", detect: (s) => numEq(s, a * x0 * x0 + b * x0 + c) && a * x0 * x0 + b * x0 + c !== ans, feedback: "That is $f(" + x0 + ")$, the **height** of the curve. The slope is $f'(" + x0 + ")$." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "chain-rule-power",
    skill: "differentiation-rules",
    title: "Chain rule",
    difficulty: 3,
    representation: "symbolic",
    generate(rng) {
      const a = rng.intExcept(-5, 5, [0, 1]);
      const b = rng.intExcept(-6, 6, [0]);
      const n = rng.int(2, 5);
      return {
        prompt: `Differentiate $y = (${a}x ${signed(b)})^{${n}}$. (Unexpanded answers like 3*2*(2x+1)^2 are fine.)`,
        answer: { kind: "expression", value: `${n * a}*(${a}*x + ${b})^${n - 1}`, variables: ["x"] },
        hints: ["Chain rule: derivative of the outside (keeping the inside) × derivative of the inside.", `Outside: $u^{${n}} \\to ${n}u^{${n - 1}}$ with $u = ${a}x ${signed(b)}$.`, `Inside derivative: $\\frac{d}{dx}(${a}x ${signed(b)}) = ${a}$.`],
        solution: [{ text: "", tex: `\\frac{dy}{dx} = ${n}(${a}x ${signed(b)})^{${n - 1}} \\times ${a} = ${n * a}(${a}x ${signed(b)})^{${n - 1}}` }],
        answerDisplay: `$${n * a}(${a}x ${signed(b)})^{${n - 1}}$`,
        misconceptions: [{ id: "forgot-inner", detect: (s) => safeExprEq(s, `${n}*(${a}*x + ${b})^${n - 1}`), feedback: `You differentiated the outside but forgot to multiply by the derivative of the inside (${a}).` }],
        exactness: "exact",
      };
    },
  },
  {
    id: "definite-integral-poly",
    skill: "definite-integrals",
    title: "Definite integral of a polynomial",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const deg = rng.int(1, 3);
      const cs = Array.from({ length: deg + 1 }, (_, i) => (i === deg ? rng.intExcept(-4, 5, [0]) : rng.int(-5, 5)));
      const lo = rng.int(-2, 1);
      const hi = rng.int(lo + 1, 3);
      const F = (x: number) => cs.reduce((s, c, i) => s.add(R(c, i + 1).mul(R(x).mul(x ** i))), R(0));
      const ans = F(hi).sub(F(lo));
      const Fcs = [0, ...cs.map((c, i) => R(c, i + 1))];
      const Ftex = Fcs.map((c, i) => ({ c: Rational.of(c as Rational | number), i })).filter((t) => !t.c.equals(0)).reverse().map((t, k) => {
        const s = t.c.compare(0) < 0 ? "-" : k === 0 ? "" : "+";
        const mag = t.c.abs();
        return `${s} ${mag.equals(1) ? "" : mag.toTex()}x${t.i > 1 ? `^{${t.i}}` : ""}`;
      }).join(" ");
      return {
        prompt: `Evaluate $\\displaystyle\\int_{${lo}}^{${hi}} \\left(${polyTex(cs)}\\right)\\,dx$ exactly.`,
        answer: { kind: "rational", value: ans.toString() },
        hints: ["Find an antiderivative $F$ (power rule backwards: $x^n \\to \\frac{x^{n+1}}{n+1}$), then compute $F(b) - F(a)$.", `$F(x) = ${Ftex}$.`, `Compute $F(${hi}) = ${F(hi).toTex()}$ and $F(${lo}) = ${F(lo).toTex()}$.`],
        solution: [
          { text: "Antiderivative:", tex: `F(x) = ${Ftex}` },
          { text: "Fundamental theorem of calculus:", tex: `F(${hi}) - F(${lo}) = ${F(hi).toTex()} - \\left(${F(lo).toTex()}\\right) = ${ans.toTex()}` },
        ],
        answerDisplay: `$${ans.toTex()}$`,
        misconceptions: [{ id: "reversed", detect: (s) => ratEq(s, ans.neg()) && !ans.equals(0), feedback: "Sign reversed: it's $F(\\text{upper}) - F(\\text{lower})$." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "geometric-series-sum",
    skill: "series-convergence",
    title: "Sum of a geometric series",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      let rn: number, rd: number;
      do {
        rd = rng.int(2, 6);
        rn = rng.intExcept(-(rd - 1), rd - 1, [0]);
      } while (gcd(Math.abs(rn), rd) !== 1);
      const r = R(rn, rd);
      const a = R(rng.intExcept(-9, 9, [0]));
      const S = a.div(R(1).sub(r));
      return {
        prompt: `Find the sum of the infinite geometric series with first term $${a.toTex()}$ and common ratio $${r.toTex()}$: $\\;${[a, a.mul(r), a.mul(r).mul(r)].map((t, i) => (i === 0 ? t.toTex() : t.compare(0) < 0 ? ` - ${t.neg().toTex()}` : ` + ${t.toTex()}`)).join("")} ${a.mul(r).mul(r).mul(r).compare(0) < 0 ? "-" : "+"} \\cdots$`,
        answer: { kind: "rational", value: S.toString() },
        hints: ["A geometric series converges when $|r| < 1$, with sum $S = \\dfrac{a}{1 - r}$.", `Here $|r| = ${r.abs().toTex()} < 1$, so the series converges.`, `$1 - r = ${R(1).sub(r).toTex()}$.`],
        solution: [{ text: "", tex: `S = \\frac{${a.toTex()}}{1 - \\left(${r.toTex()}\\right)} = \\frac{${a.toTex()}}{${R(1).sub(r).toTex()}} = ${S.toTex()}` }],
        answerDisplay: `$${S.toTex()}$`,
        misconceptions: [{ id: "one-plus-r", detect: (s) => ratEq(s, a.div(R(1).add(r))), feedback: "The denominator is $1 - r$; with a negative ratio be careful: $1 - (" + r.toString() + ") = " + R(1).sub(r).toString() + "$." }],
        exactness: "exact",
      };
    },
  },
];

function safeExprEq(a: string, b: string) {
  try {
    return expressionsEquivalent(a, b);
  } catch {
    return false;
  }
}
function eval0(s: string) {
  return parseExpression(s, []).evaluate();
}
