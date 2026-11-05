/**
 * Cross-method agreement checks: every generated answer is re-derived by an
 * independent method (symbolic vs numeric, exact vs quadrature, closed form vs
 * iteration). Run: pnpm validate:math   (exits non-zero on any disagreement)
 */
import {
  compileFn, symbolicDerivative, derivative, simpson, newtonRaphson, bisection, linalg, binomialPmf, poissonPmf,
  stdNormalCdf, normalPdf, exponentialPdf, linearRegression, parseRational, riemannSum, fourierPartialSum, standardWave, rk4,
} from "../../packages/math-engine/src";
import { generateQuestion, canonicalInput } from "../../packages/question-engine/src";

let checks = 0;
const failures: string[] = [];
const expect = (cond: boolean, msg: string) => {
  checks++;
  if (!cond) failures.push(msg);
};
const close = (a: number, b: number, tol = 1e-8) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const SEEDS = 200;

// 1. Differentiation templates: symbolic derivative of the prompt's f agrees with the expected answer numerically
for (let s = 1; s <= SEEDS; s++) {
  const q = generateQuestion("derivative-polynomial", s);
  const m = q.prompt.match(/f\(x\) = (.+?)\$/)!;
  const f = m[1].replace(/\^\{(\d+)\}/g, "^$1").replace(/(\d)x/g, "$1*x");
  const d = compileFn(symbolicDerivative(f).source);
  const ans = compileFn(canonicalInput(q));
  for (const x of [-1.7, 0.3, 2.1]) expect(close(d(x), ans(x), 1e-9), `derivative-polynomial seed ${s}: symbolic ≠ expected at ${x}`);
}
for (let s = 1; s <= SEEDS; s++) {
  const q = generateQuestion("chain-rule-power", s);
  const m = q.prompt.match(/y = \((-?\d+)x ([+-]) (\d+)\)\^\{(\d+)\}/)!;
  const a = Number(m[1]), b = (m[2] === "-" ? -1 : 1) * Number(m[3]), n = Number(m[4]);
  const f = (x: number) => (a * x + b) ** n;
  const ans = compileFn(canonicalInput(q));
  for (const x of [-0.6, 0.2, 0.9]) expect(close(derivative(f, x, 1e-6), ans(x), 1e-5), `chain-rule seed ${s}: numeric derivative ≠ expected`);
}

// 2. Definite integrals: exact rational answer vs Simpson quadrature of the prompt's polynomial
for (let s = 1; s <= SEEDS; s++) {
  const q = generateQuestion("definite-integral-poly", s);
  const m = q.prompt.match(/\\int_\{(-?\d+)\}\^\{(-?\d+)\} \\left\((.+?)\\right\)/)!;
  const lo = Number(m[1]), hi = Number(m[2]);
  const f = compileFn(m[3].replace(/\^\{(\d+)\}/g, "^$1").replace(/(\d)x/g, "$1*x"));
  expect(close(simpson(f, lo, hi, 2000), parseRational(canonicalInput(q))!.toNumber(), 1e-9), `definite-integral seed ${s}: exact ≠ Simpson`);
}

// 3. Quadratic roots satisfy the equation
for (let s = 1; s <= SEEDS; s++) {
  const q = generateQuestion("quadratic-roots", s);
  if (q.answer.kind !== "tuple") continue;
  const m = q.prompt.match(/x\^2 (.*?) = 0/)!;
  const f = compileFn(("x^2 " + m[1]).replace(/(\d)x/g, "$1*x"));
  for (const r of q.answer.values) expect(Math.abs(f(Number(r))) < 1e-9, `quadratic seed ${s}: root ${r} does not satisfy ${m[1]}`);
}

// 4. Newton step vs engine; engine root vs bisection
for (let s = 1; s <= SEEDS; s++) {
  const q = generateQuestion("newton-step", s);
  const m = q.prompt.match(/x\^2 - (\d+)\$ starting from \$x_0 = (\d+)/)!;
  const c = Number(m[1]), x0 = Number(m[2]);
  const r = newtonRaphson((x) => x * x - c, (x) => 2 * x, x0, { maxIter: 1 });
  expect(close(r.steps[0].next!, parseRational(canonicalInput(q))!.toNumber(), 1e-12), `newton-step seed ${s}`);
  const nr = newtonRaphson((x) => x * x - c, (x) => 2 * x, x0);
  const bi = bisection((x) => x * x - c, 0, c + 1);
  expect(nr.outcome === "converged" && bi.ok && close(nr.root!, bi.root, 1e-9), `newton vs bisection for √${c}`);
}

// 5. Determinants: cofactor expansion vs product of LU pivots (via inverse existence) and det(AB) = det(A)det(B)
for (let s = 1; s <= SEEDS; s++) {
  const q = generateQuestion("det-3x3", s);
  const rows = q.prompt.match(/\\begin\{pmatrix\}(.+?)\\end\{pmatrix\}/)![1].split(" \\\\ ").map((r) => r.split(" & ").map(Number));
  const d = linalg.det(rows);
  expect(d === Number(canonicalInput(q)), `det-3x3 seed ${s}`);
  expect((d === 0) === (linalg.inverse(rows) === null), `det-3x3 seed ${s}: singularity disagreement`);
  const B = [[1, 2, 0], [0, 1, 3], [2, 0, 1]];
  expect(close(linalg.det(linalg.multiply(rows, B)), d * linalg.det(B), 1e-9), `det multiplicativity seed ${s}`);
}

// 6. Distributions integrate/sum to 1 and CDF agrees with integrated PDF
for (const [n, p] of [[10, 0.3], [25, 0.5], [7, 0.9]] as const) {
  let t = 0;
  for (let k = 0; k <= n; k++) t += binomialPmf(k, n, p);
  expect(close(t, 1, 1e-12), `binomial(${n},${p}) sums to 1`);
}
for (const l of [0.5, 4, 15]) {
  let t = 0;
  for (let k = 0; k < 200; k++) t += poissonPmf(k, l);
  expect(close(t, 1, 1e-12), `poisson(${l}) sums to 1`);
}
for (const z of [-2.5, -1, 0, 0.7, 1.96, 3]) expect(close(stdNormalCdf(z), 0.5 + simpson((x) => normalPdf(x), 0, z, 4000), 1e-10), `Φ(${z}) vs ∫pdf`);
expect(close(simpson((x) => exponentialPdf(x, 2), 0, 40, 20000), 1, 1e-8), "exponential pdf integrates to 1");

// 7. Regression: closed form agrees with normal equations solved by the linear-algebra engine
{
  const xs = [1, 2, 3, 4, 5, 6, 7, 8], ys = [2, 3, 5, 4, 6, 7, 7, 9];
  const fit = linearRegression(xs, ys);
  const X = xs.map((x) => [1, x]);
  const Xt = linalg.transpose(X);
  const beta = linalg.solve(linalg.multiply(Xt, X), linalg.apply(Xt, ys))!;
  expect(close(beta[0], fit.intercept, 1e-10) && close(beta[1], fit.slope, 1e-10), "regression closed form vs normal equations");
}

// 8. Riemann sums converge at the expected order; Fourier partial sums converge; RK4 matches exact
{
  const f = (x: number) => x * x;
  const e1 = Math.abs(riemannSum(f, 0, 2, 50, "left").sum - 8 / 3);
  const e2 = Math.abs(riemannSum(f, 0, 2, 100, "left").sum - 8 / 3);
  expect(e1 / e2 > 1.9 && e1 / e2 < 2.1, `left rule is first order (ratio ${e1 / e2})`);
  const m1 = Math.abs(riemannSum(f, 0, 2, 50, "midpoint").sum - 8 / 3);
  const m2 = Math.abs(riemannSum(f, 0, 2, 100, "midpoint").sum - 8 / 3);
  expect(m1 / m2 > 3.9 && m1 / m2 < 4.1, `midpoint rule is second order (ratio ${m1 / m2})`);
  expect(Math.abs(fourierPartialSum("triangle", 101)(1.2) - standardWave("triangle")(1.2)) < 1e-3, "triangle wave Fourier series converges");
  const y = rk4((_x, yy) => yy * (1 - yy / 4), 0, 0.5, 0.01, 800).at(-1)![1];
  expect(close(y, 4 / (1 + 7 * Math.exp(-8)), 1e-9), "RK4 logistic vs exact");
}

if (failures.length) {
  console.error(`✗ ${failures.length} of ${checks} math cross-checks failed:\n- ${failures.slice(0, 30).join("\n- ")}`);
  process.exit(1);
}
console.log(`✓ ${checks} cross-method math checks passed (symbolic vs numeric, exact vs quadrature, iteration vs bracketing, closed form vs linear algebra).`);
