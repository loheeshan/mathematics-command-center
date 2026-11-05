/** Descriptive statistics, probability distributions and inference helpers. */
import type { Rng } from "./rng";

const assertNonEmpty = (xs: readonly number[]) => {
  if (xs.length === 0) throw new RangeError("empty data");
};

export const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

export function mean(xs: readonly number[]) {
  assertNonEmpty(xs);
  return sum(xs) / xs.length;
}

export function weightedMean(xs: readonly number[], ws: readonly number[]) {
  if (xs.length !== ws.length) throw new RangeError("length mismatch");
  const W = sum(ws);
  if (W === 0) throw new RangeError("weights sum to zero");
  return xs.reduce((a, x, i) => a + x * ws[i], 0) / W;
}

/** R type-7 quantile (R's default `quantile()`). */
export function quantile(xs: readonly number[], p: number) {
  assertNonEmpty(xs);
  if (p < 0 || p > 1) throw new RangeError("p must be in [0,1]");
  const s = xs.slice().sort((a, b) => a - b);
  const h = (s.length - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.min(lo + 1, s.length - 1);
  return s[lo] + (h - lo) * (s[hi] - s[lo]);
}

export const median = (xs: readonly number[]) => quantile(xs, 0.5);

export function modes(xs: readonly number[]) {
  assertNonEmpty(xs);
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  const max = Math.max(...counts.values());
  return [...counts.entries()].filter(([, c]) => c === max).map(([v]) => v).sort((a, b) => a - b);
}

/** sample variance (n − 1), as R's var() */
export function variance(xs: readonly number[], population = false) {
  if (xs.length < (population ? 1 : 2)) throw new RangeError("not enough data");
  const m = mean(xs);
  const ss = xs.reduce((a, x) => a + (x - m) ** 2, 0);
  return ss / (population ? xs.length : xs.length - 1);
}

export const sd = (xs: readonly number[], population = false) => Math.sqrt(variance(xs, population));

/** Median absolute deviation from the median. Raw (unscaled); R's mad() multiplies by 1.4826 by default. */
export function mad(xs: readonly number[], scaled = false) {
  const m = median(xs);
  const raw = median(xs.map((x) => Math.abs(x - m)));
  return scaled ? 1.4826 * raw : raw;
}

export function fiveNumberSummary(xs: readonly number[]) {
  return { min: Math.min(...xs), q1: quantile(xs, 0.25), median: median(xs), q3: quantile(xs, 0.75), max: Math.max(...xs) };
}

export function pearson(xs: readonly number[], ys: readonly number[]) {
  if (xs.length !== ys.length || xs.length < 2) throw new RangeError("need paired data, n ≥ 2");
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return NaN;
  return sxy / Math.sqrt(sxx * syy);
}

/** average ranks (ties share the mean rank) */
export function ranks(xs: readonly number[]) {
  const idx = xs.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]);
  const r = new Array<number>(xs.length);
  for (let i = 0; i < idx.length; ) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}

export const spearman = (xs: readonly number[], ys: readonly number[]) => pearson(ranks(xs), ranks(ys));

export function linearRegression(xs: readonly number[], ys: readonly number[]) {
  if (xs.length !== ys.length || xs.length < 2) throw new RangeError("need paired data, n ≥ 2");
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0, sxx = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
  }
  if (sxx === 0) throw new RangeError("all x values are equal — slope undefined");
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const fitted = xs.map((x) => intercept + slope * x);
  const residuals = ys.map((y, i) => y - fitted[i]);
  const ssRes = sum(residuals.map((e) => e * e));
  const ssTot = sum(ys.map((y) => (y - my) ** 2));
  const r2 = ssTot === 0 ? NaN : 1 - ssRes / ssTot;
  return { slope, intercept, fitted, residuals, ssRes, ssTot, r2 };
}

// ---------- combinatorics used by distributions ----------

export function choose(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0) throw new RangeError("choose needs integers n ≥ 0");
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

function logFactorial(n: number) {
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log(i);
  return s;
}

// ---------- discrete distributions ----------

export function binomialPmf(k: number, n: number, p: number) {
  if (p < 0 || p > 1) throw new RangeError("p in [0,1]");
  if (!Number.isInteger(k) || k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  const logC = logFactorial(n) - logFactorial(k) - logFactorial(n - k);
  return Math.exp(logC + k * Math.log(p) + (n - k) * Math.log1p(-p));
}

export function binomialCdf(k: number, n: number, p: number) {
  let s = 0;
  for (let i = 0; i <= Math.min(Math.floor(k), n); i++) s += binomialPmf(i, n, p);
  return Math.min(1, s);
}

export function poissonPmf(k: number, lambda: number) {
  if (lambda <= 0) throw new RangeError("λ > 0");
  if (!Number.isInteger(k) || k < 0) return 0;
  return Math.exp(-lambda + k * Math.log(lambda) - logFactorial(k));
}

export function poissonCdf(k: number, lambda: number) {
  let s = 0;
  for (let i = 0; i <= Math.floor(k); i++) s += poissonPmf(i, lambda);
  return Math.min(1, s);
}

// ---------- continuous distributions ----------

export function normalPdf(x: number, mu = 0, sigma = 1) {
  if (sigma <= 0) throw new RangeError("σ > 0");
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/** Standard normal CDF Φ(z), Hart (1968) algorithm 5666 as given by West (2005); ~double precision. */
export function stdNormalCdf(z: number): number {
  if (Number.isNaN(z)) return NaN;
  const x = Math.abs(z);
  let c: number;
  if (x > 37) c = 0;
  else {
    const e = Math.exp((-x * x) / 2);
    if (x < 7.07106781186547) {
      let b = 3.52624965998911e-2 * x + 0.700383064443688;
      b = b * x + 6.37396220353165;
      b = b * x + 33.912866078383;
      b = b * x + 112.079291497871;
      b = b * x + 221.213596169931;
      b = b * x + 220.206867912376;
      c = e * b;
      b = 8.83883476483184e-2 * x + 1.75566716318264;
      b = b * x + 16.064177579207;
      b = b * x + 86.7807322029461;
      b = b * x + 296.564248779674;
      b = b * x + 637.333633378831;
      b = b * x + 793.826512519948;
      b = b * x + 440.413735824752;
      c = c / b;
    } else {
      let b = x + 0.65;
      b = x + 4 / b;
      b = x + 3 / b;
      b = x + 2 / b;
      b = x + 1 / b;
      c = e / b / 2.506628274631;
    }
  }
  return z > 0 ? 1 - c : c;
}

export const normalCdf = (x: number, mu = 0, sigma = 1) => {
  if (sigma <= 0) throw new RangeError("σ > 0");
  return stdNormalCdf((x - mu) / sigma);
};

/** Inverse standard normal (Acklam) refined by one Halley step. */
export function stdNormalInv(p: number): number {
  if (p <= 0 || p >= 1) {
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    throw new RangeError("p in (0,1)");
  }
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  let x: number;
  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - plow) {
    const q = p - 0.5;
    const r = q * q;
    x = ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const e = stdNormalCdf(x) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

export function exponentialPdf(x: number, rate: number) {
  if (rate <= 0) throw new RangeError("λ > 0");
  return x < 0 ? 0 : rate * Math.exp(-rate * x);
}
export function exponentialCdf(x: number, rate: number) {
  if (rate <= 0) throw new RangeError("λ > 0");
  return x < 0 ? 0 : 1 - Math.exp(-rate * x);
}
export function uniformPdf(x: number, a: number, b: number) {
  if (b <= a) throw new RangeError("need a < b");
  return x < a || x > b ? 0 : 1 / (b - a);
}
export function uniformCdf(x: number, a: number, b: number) {
  if (b <= a) throw new RangeError("need a < b");
  return x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a);
}

// ---------- inference ----------

/** z-based confidence interval for μ with known σ. */
export function zConfidenceInterval(xbar: number, sigma: number, n: number, level = 0.95) {
  const z = stdNormalInv(1 - (1 - level) / 2);
  const margin = (z * sigma) / Math.sqrt(n);
  return { lower: xbar - margin, upper: xbar + margin, margin, z };
}

export type Tail = "two" | "right" | "left";

/** One-sample z test (σ known). */
export function zTest(xbar: number, mu0: number, sigma: number, n: number, tail: Tail = "two", alpha = 0.05) {
  const z = (xbar - mu0) / (sigma / Math.sqrt(n));
  const p = tail === "two" ? 2 * (1 - stdNormalCdf(Math.abs(z))) : tail === "right" ? 1 - stdNormalCdf(z) : stdNormalCdf(z);
  const critical = tail === "two" ? stdNormalInv(1 - alpha / 2) : stdNormalInv(1 - alpha);
  return { z, p, critical, reject: p < alpha };
}

/** Draw `count` sample means of size n from a sampler. */
export function sampleMeans(rng: Rng, draw: (rng: Rng) => number, n: number, count: number) {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += draw(rng);
    out.push(s / n);
  }
  return out;
}

export function histogram(xs: readonly number[], lo: number, hi: number, bins: number) {
  const counts = new Array<number>(bins).fill(0);
  const w = (hi - lo) / bins;
  for (const x of xs) {
    if (x < lo || x > hi) continue;
    const i = Math.min(bins - 1, Math.floor((x - lo) / w));
    counts[i]++;
  }
  return counts.map((c, i) => ({ x0: lo + i * w, x1: lo + (i + 1) * w, count: c }));
}
