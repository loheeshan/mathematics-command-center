/** Numerical analysis primitives used by labs, question generators and validators. */

export type Fn = (x: number) => number;

export function approxEqual(a: number, b: number, rel = 1e-9, abs = 1e-12): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b;
  return Math.abs(a - b) <= Math.max(abs, rel * Math.max(Math.abs(a), Math.abs(b)));
}

/** Format for display: up to `digits` significant figures, no trailing zeros, no "-0". */
export function fmt(x: number, digits = 6): string {
  if (Number.isNaN(x)) return "undefined";
  if (x === Infinity) return "∞";
  if (x === -Infinity) return "−∞";
  if (Math.abs(x) < 1e-12) return "0";
  const abs = Math.abs(x);
  if (abs >= 1e7 || abs < 1e-4) return x.toExponential(Math.max(0, digits - 1)).replace(/\.?0+e/, "e");
  const s = Number(x.toPrecision(digits)).toString();
  return s === "-0" ? "0" : s;
}

/** Round to a fixed number of decimal places (half away from zero). */
export function roundTo(x: number, dp: number): number {
  const f = 10 ** dp;
  return (Math.sign(x) * Math.round(Math.abs(x) * f + Number.EPSILON)) / f;
}

/** central difference f'(x) */
export function derivative(f: Fn, x: number, h = 1e-5): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

export function secondDerivative(f: Fn, x: number, h = 1e-4): number {
  return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
}

/** forward difference quotient (f(a+h) - f(a)) / h — the secant slope taught in lectures */
export function differenceQuotient(f: Fn, a: number, h: number): number {
  if (h === 0) throw new RangeError("h must be non-zero");
  return (f(a + h) - f(a)) / h;
}

export type RiemannRule = "left" | "right" | "midpoint" | "trapezoid";

export function riemannSum(f: Fn, a: number, b: number, n: number, rule: RiemannRule) {
  if (!Number.isInteger(n) || n < 1) throw new RangeError("n must be a positive integer");
  const dx = (b - a) / n;
  let sum = 0;
  const rects: { x0: number; x1: number; height: number }[] = [];
  for (let i = 0; i < n; i++) {
    const x0 = a + i * dx;
    const x1 = x0 + dx;
    let height: number;
    if (rule === "left") height = f(x0);
    else if (rule === "right") height = f(x1);
    else if (rule === "midpoint") height = f((x0 + x1) / 2);
    else height = (f(x0) + f(x1)) / 2;
    rects.push({ x0, x1, height });
    sum += height * dx;
  }
  return { sum, dx, rects };
}

/** composite Simpson's rule (n rounded up to even) */
export function simpson(f: Fn, a: number, b: number, n = 1000): number {
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

export interface BisectionStep {
  a: number;
  b: number;
  mid: number;
  fmid: number;
}

export function bisection(f: Fn, a: number, b: number, tol = 1e-10, maxIter = 200) {
  let fa = f(a);
  const fb = f(b);
  if (fa * fb > 0) return { ok: false as const, reason: "f(a) and f(b) have the same sign — no guaranteed root in [a, b]", steps: [] as BisectionStep[] };
  const steps: BisectionStep[] = [];
  for (let i = 0; i < maxIter; i++) {
    const mid = (a + b) / 2;
    const fmid = f(mid);
    steps.push({ a, b, mid, fmid });
    if (fmid === 0 || (b - a) / 2 < tol) return { ok: true as const, root: mid, steps };
    if (fa * fmid < 0) b = mid;
    else {
      a = mid;
      fa = fmid;
    }
  }
  return { ok: true as const, root: (a + b) / 2, steps };
}

export interface NewtonStep {
  n: number;
  x: number;
  fx: number;
  dfx: number;
  next: number | null;
}

export type NewtonOutcome = "converged" | "zero-derivative" | "diverged" | "max-iterations" | "non-finite";

/**
 * Newton–Raphson: x_{n+1} = x_n − f(x_n)/f'(x_n).
 * Records every iterate and reports *why* it stopped so failure modes can be taught.
 */
export function newtonRaphson(f: Fn, df: Fn, x0: number, opts: { tol?: number; maxIter?: number; divergeAt?: number } = {}) {
  const tol = opts.tol ?? 1e-12;
  const maxIter = opts.maxIter ?? 50;
  const divergeAt = opts.divergeAt ?? 1e8;
  const steps: NewtonStep[] = [];
  let x = x0;
  for (let n = 0; n < maxIter; n++) {
    const fx = f(x);
    const dfx = df(x);
    if (!Number.isFinite(fx) || !Number.isFinite(dfx)) {
      steps.push({ n, x, fx, dfx, next: null });
      return { outcome: "non-finite" as NewtonOutcome, steps, root: null };
    }
    if (Math.abs(dfx) < 1e-14) {
      steps.push({ n, x, fx, dfx, next: null });
      return { outcome: "zero-derivative" as NewtonOutcome, steps, root: null };
    }
    const next = x - fx / dfx;
    steps.push({ n, x, fx, dfx, next });
    if (Math.abs(next) > divergeAt) return { outcome: "diverged" as NewtonOutcome, steps, root: null };
    if (Math.abs(next - x) <= tol * Math.max(1, Math.abs(next))) return { outcome: "converged" as NewtonOutcome, steps, root: next };
    x = next;
  }
  return { outcome: "max-iterations" as NewtonOutcome, steps, root: null };
}

export type OdeFn = (x: number, y: number) => number;

export function eulerMethod(f: OdeFn, x0: number, y0: number, h: number, steps: number) {
  const pts: [number, number][] = [[x0, y0]];
  let x = x0;
  let y = y0;
  for (let i = 0; i < steps; i++) {
    y = y + h * f(x, y);
    x = x + h;
    pts.push([x, y]);
  }
  return pts;
}

export function rk4(f: OdeFn, x0: number, y0: number, h: number, steps: number) {
  const pts: [number, number][] = [[x0, y0]];
  let x = x0;
  let y = y0;
  for (let i = 0; i < steps; i++) {
    const k1 = f(x, y);
    const k2 = f(x + h / 2, y + (h / 2) * k1);
    const k3 = f(x + h / 2, y + (h / 2) * k2);
    const k4 = f(x + h, y + h * k3);
    y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    x = x + h;
    pts.push([x, y]);
  }
  return pts;
}

export function partialSums(term: (n: number) => number, start: number, count: number) {
  const out: { n: number; term: number; sum: number }[] = [];
  let s = 0;
  for (let n = start; n < start + count; n++) {
    const t = term(n);
    s += t;
    out.push({ n, term: t, sum: s });
  }
  return out;
}

/** Sample y = f(x) on [a, b]; splits into separate segments at non-finite values or huge jumps (asymptotes). */
export function sampleFunction(f: Fn, a: number, b: number, n = 400, jump = Infinity) {
  const segments: [number, number][][] = [];
  let cur: [number, number][] = [];
  let prev: number | null = null;
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    let y: number;
    try {
      y = f(x);
    } catch {
      y = NaN;
    }
    if (!Number.isFinite(y) || (prev !== null && Math.abs(y - prev) > jump)) {
      if (cur.length > 1) segments.push(cur);
      cur = Number.isFinite(y) ? [[x, y]] : [];
      prev = Number.isFinite(y) ? y : null;
      continue;
    }
    cur.push([x, y]);
    prev = y;
  }
  if (cur.length > 1) segments.push(cur);
  return segments;
}
