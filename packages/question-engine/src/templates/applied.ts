import { Rational, linalg, binomialPmf, choose, stdNormalCdf, median, linearRegression, fmt, expressionsEquivalent, roundTo } from "@mcc/math-engine";
import type { QuestionTemplate } from "../types";
import { numEq, ratEq } from "../check";

const R = (n: number, d = 1) => new Rational(n, d);
const signed = (k: number) => (k < 0 ? `- ${-k}` : `+ ${k}`);
const matTex = (M: number[][]) => `\\begin{pmatrix}${M.map((r) => r.join(" & ")).join(" \\\\ ")}\\end{pmatrix}`;
const safeEq = (a: string, b: string, vars: string[]) => {
  try {
    return expressionsEquivalent(a, b, { variables: vars });
  } catch {
    return false;
  }
};

export const appliedTemplates: QuestionTemplate[] = [
  {
    id: "det-2x2",
    skill: "determinants",
    title: "Determinant of a 2×2 matrix",
    difficulty: 1,
    representation: "symbolic",
    generate(rng) {
      const M = [[rng.int(-9, 9), rng.int(-9, 9)], [rng.int(-9, 9), rng.int(-9, 9)]];
      const d = linalg.det(M);
      const [[a, b], [c, e]] = M;
      return {
        prompt: `Find $\\det A$ for $A = ${matTex(M)}$.`,
        answer: { kind: "integer", value: d },
        hints: ["For $\\begin{pmatrix} a & b \\\\ c & d\\end{pmatrix}$, $\\det = ad - bc$ (main diagonal minus the other diagonal).", `$ad = (${a})(${e}) = ${a * e}$.`, `$bc = (${b})(${c}) = ${b * c}$. Subtract.`],
        solution: [{ text: "", tex: `\\det A = (${a})(${e}) - (${b})(${c}) = ${a * e} - (${b * c}) = ${d}` }],
        answerDisplay: `$${d}$`,
        misconceptions: [
          { id: "added-diagonals", detect: (s) => numEq(s, a * e + b * c) && a * e + b * c !== d, feedback: "The two diagonal products are **subtracted**: $ad - bc$." },
          { id: "wrong-diagonal-order", detect: (s) => numEq(s, -d) && d !== 0, feedback: "Sign error: it's (main diagonal) − (other diagonal), i.e. $ad - bc$, not $bc - ad$." },
        ],
        exactness: "exact",
      };
    },
  },
  {
    id: "det-3x3",
    skill: "determinants",
    title: "Determinant of a 3×3 matrix (cofactor expansion)",
    difficulty: 3,
    representation: "symbolic",
    generate(rng) {
      const M = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => rng.int(-5, 6)));
      const d = linalg.det(M);
      const m = [0, 1, 2].map((j) => linalg.det(linalg.minorMatrix(M, 0, j)));
      return {
        prompt: `Find $\\det B$ for $B = ${matTex(M)}$ by expanding along the first row.`,
        answer: { kind: "integer", value: d },
        hints: ["$\\det B = b_{11}M_{11} - b_{12}M_{12} + b_{13}M_{13}$, where $M_{1j}$ is the 2×2 determinant left after deleting row 1 and column $j$.", `The minors are $M_{11} = ${m[0]}$, $M_{12} = ${m[1]}$, $M_{13} = ${m[2]}$.`, "Remember the alternating signs $+,\\,-,\\,+$."],
        solution: [{ text: "", tex: `(${M[0][0]})(${m[0]}) - (${M[0][1]})(${m[1]}) + (${M[0][2]})(${m[2]}) = ${d}` }],
        answerDisplay: `$${d}$`,
        misconceptions: [{ id: "no-alternating-sign", detect: (s) => numEq(s, M[0][0] * m[0] + M[0][1] * m[1] + M[0][2] * m[2]) && M[0][1] * m[1] !== 0, feedback: "Missing the checkerboard sign: the middle term of a first-row expansion is **subtracted**." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "matrix-product-2x2",
    skill: "matrices",
    title: "Multiply 2×2 matrices",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const A = [[rng.int(-4, 5), rng.int(-4, 5)], [rng.int(-4, 5), rng.int(-4, 5)]];
      const B = [[rng.int(-4, 5), rng.int(-4, 5)], [rng.int(-4, 5), rng.int(-4, 5)]];
      const C = linalg.multiply(A, B);
      return {
        prompt: `Compute $AB$ for $A = ${matTex(A)}$, $B = ${matTex(B)}$. Enter the entries $c_{11}, c_{12}, c_{21}, c_{22}$.`,
        answer: { kind: "tuple", values: C.flat().map(String), labels: ["c₁₁", "c₁₂", "c₂₁", "c₂₂"] },
        hints: ["Entry $c_{ij}$ = (row $i$ of A) · (column $j$ of B): multiply matching entries and add.", `$c_{11} = (${A[0][0]})(${B[0][0]}) + (${A[0][1]})(${B[1][0]})$.`, `$c_{12}$ uses row 1 of A with column 2 of B: $(${A[0][0]})(${B[0][1]}) + (${A[0][1]})(${B[1][1]})$.`],
        solution: [{ text: "Row-by-column products:", tex: `AB = ${matTex(C)}` }],
        answerDisplay: `$${matTex(C)}$`,
        exactness: "exact",
      };
    },
  },
  {
    id: "dot-product-angle",
    skill: "dot-cross-product",
    title: "Dot product and perpendicularity",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const u = [rng.int(-5, 5), rng.int(-5, 5), rng.int(-5, 5)];
      const v = [rng.int(-5, 5), rng.int(-5, 5), rng.int(-5, 5)];
      if (u.every((x) => x === 0)) u[0] = 1;
      const d = linalg.dot(u, v);
      const vt = (w: number[]) => `${w[0]}\\mathbf i ${signed(w[1])}\\mathbf j ${signed(w[2])}\\mathbf k`.replace(/(^|[ -]|\+ )1\\mathbf/g, "$1\\mathbf");
      return {
        prompt: `For $\\mathbf a = ${vt(u)}$ and $\\mathbf b = ${vt(v)}$, compute $\\mathbf a \\cdot \\mathbf b$.`,
        answer: { kind: "integer", value: d },
        hints: ["$\\mathbf a\\cdot\\mathbf b = a_1b_1 + a_2b_2 + a_3b_3$ (because $\\mathbf i\\cdot\\mathbf i = 1$ and $\\mathbf i\\cdot\\mathbf j = 0$).", `Products: $${u[0] * v[0]}$, $${u[1] * v[1]}$, $${u[2] * v[2]}$.`, "Add them. (If the result is 0, the vectors are perpendicular.)"],
        solution: [{ text: "", tex: `(${u[0]})(${v[0]}) + (${u[1]})(${v[1]}) + (${u[2]})(${v[2]}) = ${d}` }],
        answerDisplay: `$${d}$`,
        exactness: "exact",
      };
    },
  },
  {
    id: "two-dice-probability",
    skill: "probability-basics",
    title: "Two dice: sum probabilities",
    difficulty: 1,
    representation: "word-problem",
    generate(rng) {
      const s = rng.int(2, 12);
      const kind = rng.pick(["eq", "ge"] as const);
      let count = 0;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (kind === "eq" ? a + b === s : a + b >= s) count++;
      const p = R(count, 36);
      return {
        prompt: `Two fair dice are rolled. What is the probability that the sum is ${kind === "eq" ? "exactly" : "at least"} ${s}? Give an exact fraction.`,
        answer: { kind: "rational", value: p.toString() },
        hints: ["All $6 \\times 6 = 36$ ordered outcomes are equally likely.", "Count the outcomes (first die, second die) that satisfy the condition — (1, 2) and (2, 1) are different outcomes.", `There are ${count} such outcomes.`],
        solution: [{ text: "", tex: `P = \\frac{\\text{favourable}}{\\text{total}} = \\frac{${count}}{36}${p.d !== 36 ? ` = ${p.toTex()}` : ""}` }],
        answerDisplay: `$${p.toTex()}$`,
        misconceptions: [{ id: "eleven-outcomes", detect: (s2) => ratEq(s2, R(1, 11)) || (kind === "ge" && ratEq(s2, R(13 - s, 11))), feedback: "The 11 possible sums (2 to 12) are **not** equally likely. Count the 36 equally likely ordered pairs instead." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "bayes-test",
    skill: "bayes",
    title: "Bayes' theorem: medical test",
    difficulty: 3,
    representation: "word-problem",
    generate(rng) {
      const prev = rng.pick([0.01, 0.02, 0.05, 0.1]);
      const sens = rng.pick([0.9, 0.95, 0.99]);
      const fpr = rng.pick([0.05, 0.08, 0.1]);
      const pPos = sens * prev + fpr * (1 - prev);
      const ans = (sens * prev) / pPos;
      return {
        prompt: `A disease affects ${prev * 100}% of a population. A test detects it in ${sens * 100}% of people who have it, but also gives a positive result for ${fpr * 100}% of people who don't. A person tests positive. What is the probability they have the disease? Round to 3 decimal places.`,
        answer: { kind: "numeric", value: roundTo(ans, 3), dp: 3 },
        hints: [
          "You want $P(D \\mid +)$, which is **not** the same as $P(+ \\mid D) = " + sens + "$.",
          `Total probability of a positive: $P(+) = P(+\\mid D)P(D) + P(+\\mid D^c)P(D^c) = ${sens}(${prev}) + ${fpr}(${roundTo(1 - prev, 4)})$.`,
          `Bayes: $P(D\\mid +) = \\dfrac{P(+\\mid D)P(D)}{P(+)} = \\dfrac{${roundTo(sens * prev, 6)}}{${roundTo(pPos, 6)}}$.`,
        ],
        solution: [
          { text: "Law of total probability:", tex: `P(+) = ${sens}\\times${prev} + ${fpr}\\times${roundTo(1 - prev, 4)} = ${fmt(pPos, 6)}` },
          { text: "Bayes' theorem:", tex: `P(D\\mid +) = \\frac{${fmt(sens * prev, 6)}}{${fmt(pPos, 6)}} \\approx ${roundTo(ans, 3).toFixed(3)}` },
          { text: "Most positives come from the much larger healthy group — that is why the answer is far below the test's sensitivity." },
        ],
        answerDisplay: `$\\approx ${roundTo(ans, 3).toFixed(3)}$`,
        misconceptions: [{ id: "inverse-conditional", detect: (s) => numEq(s, sens, 1e-3), feedback: "That is $P(+ \\mid D)$ — the chance of testing positive *if* you have the disease. The question asks the reverse, $P(D \\mid +)$. Confusing these is the classic Bayes error." }],
        exactness: "approximate",
      };
    },
  },
  {
    id: "expectation-discrete",
    skill: "expectation-variance",
    title: "Expected value of a discrete random variable",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const xs = rng.shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3).sort((a, b) => a - b);
      const w = [rng.int(1, 5), rng.int(1, 5), rng.int(1, 5)];
      const W = w[0] + w[1] + w[2];
      const ps = w.map((k) => R(k, W));
      const E = xs.reduce((s, x, i) => s.add(ps[i].mul(x)), R(0));
      return {
        prompt: `$X$ takes values ${xs.map((x) => `$${x}$`).join(", ")} with probabilities ${ps.map((p) => `$${p.toTex()}$`).join(", ")}. Find $E[X]$ exactly.`,
        answer: { kind: "rational", value: E.toString() },
        hints: ["$E[X] = \\sum x\\,P(X = x)$ — a probability-weighted average.", `Products: ${xs.map((x, i) => `$${x}\\times${ps[i].toTex()}$`).join(", ")}.`, "Add the products using a common denominator."],
        solution: [{ text: "", tex: `E[X] = ${xs.map((x, i) => `${x}\\cdot${ps[i].toTex()}`).join(" + ")} = ${E.toTex()}` }],
        answerDisplay: `$${E.toTex()}$`,
        misconceptions: [{ id: "unweighted-mean", detect: (s) => ratEq(s, R(xs[0] + xs[1] + xs[2], 3)) && !R(xs[0] + xs[1] + xs[2], 3).equals(E), feedback: "That's the plain average of the values. Expectation weights each value by its probability." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "binomial-probability",
    skill: "discrete-distributions",
    title: "Binomial probability",
    difficulty: 2,
    representation: "word-problem",
    generate(rng) {
      const n = rng.int(4, 10);
      const p = rng.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6]);
      const k = rng.int(0, n);
      const ans = binomialPmf(k, n, p);
      return {
        prompt: `Each seed germinates independently with probability ${p}. You plant ${n} seeds. Find $P(X = ${k})$, where $X$ is the number that germinate. Round to 4 decimal places.`,
        answer: { kind: "numeric", value: roundTo(ans, 4), dp: 4 },
        hints: ["$X \\sim \\text{Bin}(n, p)$ and $P(X = k) = \\binom{n}{k}p^k(1-p)^{n-k}$.", `$\\binom{${n}}{${k}} = ${choose(n, k)}$.`, `Compute $${choose(n, k)} \\times ${p}^{${k}} \\times ${roundTo(1 - p, 2)}^{${n - k}}$.`],
        solution: [{ text: "", tex: `P(X=${k}) = \\binom{${n}}{${k}}(${p})^{${k}}(${roundTo(1 - p, 2)})^{${n - k}} = ${choose(n, k)}\\times${fmt(p ** k, 6)}\\times${fmt((1 - p) ** (n - k), 6)} \\approx ${roundTo(ans, 4).toFixed(4)}` }],
        answerDisplay: `$\\approx ${roundTo(ans, 4).toFixed(4)}$`,
        misconceptions: [{ id: "no-binomial-coefficient", detect: (s) => choose(n, k) > 1 && numEq(s, roundTo(p ** k * (1 - p) ** (n - k), 4), 1e-3), feedback: `That's the probability of one *particular* order. There are $\\binom{${n}}{${k}} = ${choose(n, k)}$ orders, so multiply by it.` }],
        exactness: "approximate",
      };
    },
  },
  {
    id: "normal-probability",
    skill: "continuous-distributions",
    title: "Normal probabilities via z-scores",
    difficulty: 2,
    representation: "word-problem",
    generate(rng) {
      const mu = rng.int(40, 80) * 10;
      const sigma = rng.pick([20, 25, 40, 50, 100]);
      const z = rng.pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.25, 1.5, 2]);
      const x = mu + z * sigma;
      const above = rng.next() < 0.5;
      const ans = above ? 1 - stdNormalCdf(z) : stdNormalCdf(z);
      return {
        prompt: `Exam scores are $N(\\mu = ${mu}, \\sigma = ${sigma})$. Find the probability a randomly chosen score is ${above ? "**above**" : "**below**"} ${x}. Round to 4 decimal places.`,
        answer: { kind: "numeric", value: roundTo(ans, 4), dp: 4 },
        hints: ["Standardise: $z = \\dfrac{x - \\mu}{\\sigma}$.", `$z = \\dfrac{${x} - ${mu}}{${sigma}} = ${z}$.`, above ? `$P(X > ${x}) = 1 - \\Phi(${z})$, and $\\Phi(${z}) \\approx ${stdNormalCdf(z).toFixed(4)}$.` : `$P(X < ${x}) = \\Phi(${z}) \\approx ${stdNormalCdf(z).toFixed(4)}$.`],
        solution: [
          { text: "Standardise:", tex: `z = \\frac{${x} - ${mu}}{${sigma}} = ${z}` },
          { text: "Use the standard normal CDF (R: pnorm):", tex: `${above ? `1 - \\Phi(${z})` : `\\Phi(${z})`} \\approx ${roundTo(ans, 4).toFixed(4)}` },
        ],
        answerDisplay: `$\\approx ${roundTo(ans, 4).toFixed(4)}$`,
        misconceptions: [{ id: "wrong-tail", detect: (s) => numEq(s, roundTo(1 - ans, 4), 1e-3), feedback: `That's the other tail. ${above ? "Above" : "Below"} ${x} corresponds to the area to the ${above ? "right" : "left"} of $z = ${z}$.` }],
        exactness: "approximate",
      };
    },
  },
  {
    id: "mean-median",
    skill: "central-tendency",
    title: "Mean and median",
    difficulty: 1,
    representation: "symbolic",
    generate(rng) {
      const n = rng.int(5, 8);
      const xs = Array.from({ length: n }, () => rng.int(1, 30));
      const which = rng.pick(["mean", "median"] as const);
      const ans = which === "mean" ? R(xs.reduce((a, b) => a + b, 0), n) : Rational.fromNumber(median(xs));
      const sorted = xs.slice().sort((a, b) => a - b);
      return {
        prompt: `Data: ${xs.join(", ")}. Find the **${which}** exactly.`,
        answer: { kind: "rational", value: ans.toString() },
        hints: which === "mean"
          ? ["Mean = (sum of values) ÷ (number of values).", `Sum = ${xs.reduce((a, b) => a + b, 0)}.`, `Divide by n = ${n}.`]
          : ["Median = middle value of the **sorted** data.", `Sorted: ${sorted.join(", ")}.`, n % 2 ? `With n = ${n} (odd), it's value number ${(n + 1) / 2}.` : `With n = ${n} (even), average values ${n / 2} and ${n / 2 + 1}.`],
        solution: which === "mean"
          ? [{ text: "", tex: `\\bar x = \\frac{${xs.reduce((a, b) => a + b, 0)}}{${n}} = ${ans.toTex()}` }]
          : [{ text: `Sorted: ${sorted.join(", ")}`, tex: `\\text{median} = ${ans.toTex()}` }],
        answerDisplay: `$${ans.toTex()}$`,
        misconceptions: which === "median" ? [{ id: "unsorted-middle", detect: (s) => numEq(s, n % 2 ? xs[(n - 1) / 2] : (xs[n / 2 - 1] + xs[n / 2]) / 2) && (n % 2 ? xs[(n - 1) / 2] : (xs[n / 2 - 1] + xs[n / 2]) / 2) !== ans.toNumber(), feedback: "You took the middle of the data as listed. Sort it first." }] : [],
        exactness: "exact",
      };
    },
  },
  {
    id: "regression-slope",
    skill: "linear-regression",
    title: "Least-squares slope",
    difficulty: 3,
    representation: "symbolic",
    generate(rng) {
      const xs = [1, 2, 3, 4, 5];
      const b = rng.int(-3, 3) || 2;
      const c0 = rng.int(-4, 6);
      const ys = xs.map((x) => c0 + b * x + rng.int(-2, 2));
      const fit = linearRegression(xs, ys);
      const Sxy = xs.reduce((s, x, i) => s + (x - 3) * (ys[i] - ys.reduce((a, b) => a + b, 0) / 5), 0);
      return {
        prompt: `Fit the least-squares line $\\hat y = b_0 + b_1 x$ to the data $x$: 1, 2, 3, 4, 5 and $y$: ${ys.join(", ")}. Find the slope $b_1$ (round to 2 decimal places).`,
        answer: { kind: "numeric", value: roundTo(fit.slope, 2), dp: 2 },
        hints: ["$b_1 = \\dfrac{S_{xy}}{S_{xx}} = \\dfrac{\\sum (x_i - \\bar x)(y_i - \\bar y)}{\\sum (x_i - \\bar x)^2}$.", `$\\bar x = 3$, $\\bar y = ${fmt(ys.reduce((a, b) => a + b, 0) / 5)}$, $S_{xx} = 10$.`, `$S_{xy} = ${fmt(Sxy)}$.`],
        solution: [{ text: "", tex: `b_1 = \\frac{${fmt(Sxy)}}{10} = ${fmt(fit.slope)}\\ (\\text{R: } \\texttt{coef(lm(y \\sim x))})` }],
        answerDisplay: `$b_1 \\approx ${roundTo(fit.slope, 2).toFixed(2)}$`,
        misconceptions: [{ id: "inverted", detect: (s) => Sxy !== 0 && numEq(s, roundTo(10 / Sxy, 2), 1e-2), feedback: "Inverted: the slope is $S_{xy}/S_{xx}$." }],
        exactness: "approximate",
      };
    },
  },
  {
    id: "newton-step",
    skill: "root-finding",
    title: "One Newton–Raphson step",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const c = rng.pick([2, 3, 5, 6, 7, 10, 11]);
      const x0 = rng.int(1, 4);
      const x1 = R(x0 * x0 + c, 2 * x0);
      return {
        prompt: `Use one Newton–Raphson step to approximate a root of $f(x) = x^2 - ${c}$ starting from $x_0 = ${x0}$. Give $x_1$ exactly.`,
        answer: { kind: "rational", value: x1.toString() },
        hints: ["$x_{n+1} = x_n - \\dfrac{f(x_n)}{f'(x_n)}$: follow the tangent line down to the x-axis.", `$f(${x0}) = ${x0 * x0 - c}$ and $f'(x) = 2x$, so $f'(${x0}) = ${2 * x0}$.`, `$x_1 = ${x0} - \\frac{${x0 * x0 - c}}{${2 * x0}}$.`],
        solution: [{ text: "", tex: `x_1 = ${x0} - \\frac{${x0 * x0 - c}}{${2 * x0}} = ${x1.toTex()} \\approx ${fmt(x1.toNumber(), 6)}\\quad(\\sqrt{${c}} \\approx ${fmt(Math.sqrt(c), 6)})` }],
        answerDisplay: `$${x1.toTex()}$`,
        misconceptions: [{ id: "plus-sign", detect: (s) => ratEq(s, R(x0).add(R(x0 * x0 - c, 2 * x0))), feedback: "The update **subtracts** $f/f'$." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "euler-step",
    skill: "numerical-ode",
    title: "Euler's method",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const a = rng.intExcept(-3, 3, [0]);
      const y0 = rng.int(1, 5);
      const h = R(1, rng.pick([2, 4, 5, 10]));
      // y' = a*y ; two Euler steps
      const y1 = R(y0).add(h.mul(a).mul(y0));
      const y2 = y1.add(h.mul(a).mul(y1));
      return {
        prompt: `Apply **two** steps of Euler's method with step $h = ${h.toTex()}$ to $y' = ${a === 1 ? "" : a === -1 ? "-" : a}y$, $y(0) = ${y0}$. Give $y_2 \\approx y(${h.mul(2).toTex()})$ exactly.`,
        answer: { kind: "rational", value: y2.toString() },
        hints: ["Euler: $y_{n+1} = y_n + h\\,f(x_n, y_n)$ — step along the tangent slope.", `$y_1 = ${y0} + ${h.toTex()}\\cdot(${a}\\cdot${y0}) = ${y1.toTex()}$.`, `$y_2 = y_1 + ${h.toTex()}\\cdot(${a}\\,y_1)$.`],
        solution: [
          { text: "", tex: `y_1 = ${y0} + ${h.toTex()}(${a})(${y0}) = ${y1.toTex()}` },
          { text: "", tex: `y_2 = ${y1.toTex()} + ${h.toTex()}(${a})\\left(${y1.toTex()}\\right) = ${y2.toTex()}` },
          { text: `Exact solution for comparison: $y = ${y0}e^{${a}x}$ gives $y(${h.mul(2).toTex()}) \\approx ${fmt(y0 * Math.exp(a * h.mul(2).toNumber()), 6)}$.` },
        ],
        answerDisplay: `$${y2.toTex()}$`,
        exactness: "exact",
      };
    },
  },
  {
    id: "partial-derivative",
    skill: "partial-derivatives",
    title: "Partial derivatives",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const a = rng.intExcept(-4, 5, [0]);
      const b = rng.intExcept(-4, 5, [0]);
      const c = rng.intExcept(-6, 6, [0]);
      const m = rng.int(2, 3);
      const wrt = rng.pick(["x", "y"] as const);
      const ans = wrt === "x" ? `${a * m}*x^${m - 1}*y + ${b}*y^2` : `${a}*x^${m} + ${2 * b}*x*y + ${c}`;
      return {
        prompt: `For $f(x, y) = ${a}x^{${m}}y ${signed(b)}xy^2 ${signed(c)}y$, find $\\dfrac{\\partial f}{\\partial ${wrt}}$.`,
        answer: { kind: "expression", value: ans, variables: ["x", "y"] },
        hints: [`Treat ${wrt === "x" ? "$y$" : "$x$"} as a **constant** and differentiate with respect to $${wrt}$.`, wrt === "x" ? "The term $" + c + "y$ has no $x$, so its partial derivative is 0." : `Differentiate $y$, $y^2$ and keep the $x$ factors as coefficients.`, wrt === "x" ? `$\\frac{\\partial}{\\partial x}(${a}x^{${m}}y) = ${a * m}x^{${m - 1}}y$.` : `$\\frac{\\partial}{\\partial y}(${b}xy^2) = ${2 * b}xy$.`],
        solution: [{ text: "", tex: wrt === "x" ? `f_x = ${a * m}x^{${m - 1}}y ${signed(b)}y^2` : `f_y = ${a}x^{${m}} ${signed(2 * b)}xy ${signed(c)}` }],
        answerDisplay: wrt === "x" ? `$${a * m}x^{${m - 1}}y ${signed(b)}y^2$` : `$${a}x^{${m}} ${signed(2 * b)}xy ${signed(c)}$`,
        misconceptions: [{ id: "total-derivative", detect: (s) => wrt === "x" && safeEq(s, `${ans} + ${c}`, ["x", "y"]), feedback: "Terms with no $x$ are constants when differentiating with respect to $x$ — their partial derivative is 0." }],
        exactness: "exact",
        inputHelp: "Use * for products if needed, e.g. 6*x^2*y + 3*y^2",
      };
    },
  },
  {
    id: "gradient-descent-step",
    skill: "gradient-descent",
    title: "One gradient-descent step",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const a = rng.intExcept(-5, 5, [0]);
      const x0 = rng.intExcept(-6, 6, [a]);
      const eta = R(1, rng.pick([2, 4, 5, 10]));
      // f(x) = (x - a)^2, f'(x) = 2(x - a)
      const g = 2 * (x0 - a);
      const x1 = R(x0).sub(eta.mul(g));
      return {
        prompt: `Loss $L(w) = (w ${signed(-a)})^2$. Starting at $w_0 = ${x0}$ with learning rate $\\eta = ${eta.toTex()}$, compute $w_1$ after one gradient-descent step.`,
        answer: { kind: "rational", value: x1.toString() },
        hints: ["Update rule: $w_1 = w_0 - \\eta\\,L'(w_0)$ — step *downhill*, against the gradient.", `$L'(w) = 2(w ${signed(-a)})$, so $L'(${x0}) = ${g}$.`, `$w_1 = ${x0} - ${eta.toTex()}\\times ${g}$.`],
        solution: [{ text: "", tex: `w_1 = ${x0} - ${eta.toTex()}(${g}) = ${x1.toTex()}` }, { text: `The minimum is at $w = ${a}$; the step moved ${Math.abs(x1.toNumber() - a) < Math.abs(x0 - a) ? "closer to" : "past or away from"} it.` }],
        answerDisplay: `$${x1.toTex()}$`,
        misconceptions: [{ id: "uphill", detect: (s) => ratEq(s, R(x0).add(eta.mul(g))), feedback: "You stepped *uphill*. Gradient descent subtracts $\\eta \\times$ gradient." }],
        exactness: "exact",
      };
    },
  },
];
