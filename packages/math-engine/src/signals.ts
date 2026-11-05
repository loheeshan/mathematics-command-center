/** Fourier synthesis, discrete spectra and 1-D/2-D gradient descent. */

export interface Wave {
  amplitude: number;
  frequency: number; // cycles per unit
  phase: number; // radians
}

export const synth = (waves: readonly Wave[]) => (t: number) =>
  waves.reduce((s, w) => s + w.amplitude * Math.sin(2 * Math.PI * w.frequency * t + w.phase), 0);

/** Magnitude spectrum via direct DFT (fine for N ≤ 1024). Returns |X_k| scaled to sinusoid amplitude. */
export function dftMagnitudes(samples: readonly number[]) {
  const N = samples.length;
  const out: number[] = [];
  for (let k = 0; k <= N / 2; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const ang = (-2 * Math.PI * k * n) / N;
      re += samples[n] * Math.cos(ang);
      im += samples[n] * Math.sin(ang);
    }
    const mag = Math.hypot(re, im) / N;
    out.push(k === 0 || k === N / 2 ? mag : 2 * mag);
  }
  return out;
}

/**
 * Fourier series partial sums of standard periodic waves on (−π, π):
 *   square  f = sign(sin x):      (4/π) Σ_{odd n} sin(nx)/n
 *   sawtooth f = x on (−π, π):     2 Σ (−1)^{n+1} sin(nx)/n
 *   triangle f = |x| on (−π, π):   π/2 − (4/π) Σ_{odd n} cos(nx)/n²
 */
export type StandardWave = "square" | "sawtooth" | "triangle";

export function fourierCoefficients(wave: StandardWave, N: number) {
  const a: number[] = new Array(N + 1).fill(0);
  const b: number[] = new Array(N + 1).fill(0);
  for (let n = 1; n <= N; n++) {
    if (wave === "square" && n % 2 === 1) b[n] = 4 / (Math.PI * n);
    if (wave === "sawtooth") b[n] = (2 * (n % 2 === 1 ? 1 : -1)) / n;
    if (wave === "triangle" && n % 2 === 1) a[n] = -4 / (Math.PI * n * n);
  }
  if (wave === "triangle") a[0] = Math.PI; // a0/2 = π/2
  return { a, b };
}

export function fourierPartialSum(wave: StandardWave, N: number) {
  const { a, b } = fourierCoefficients(wave, N);
  return (x: number) => {
    let s = a[0] / 2;
    for (let n = 1; n <= N; n++) s += a[n] * Math.cos(n * x) + b[n] * Math.sin(n * x);
    return s;
  };
}

export function standardWave(wave: StandardWave) {
  return (x: number) => {
    // reduce to (−π, π]
    const r = x - 2 * Math.PI * Math.floor((x + Math.PI) / (2 * Math.PI));
    if (wave === "square") return r === 0 || Math.abs(r) === Math.PI ? 0 : Math.sign(r);
    if (wave === "sawtooth") return Math.abs(r) === Math.PI ? 0 : r;
    return Math.abs(r);
  };
}

export interface GDStep {
  i: number;
  x: number[];
  f: number;
  grad: number[];
}

/** Plain gradient descent x ← x − η ∇f(x). Stops on convergence, divergence or maxIter. */
export function gradientDescent(f: (x: number[]) => number, grad: (x: number[]) => number[], x0: number[], eta: number, maxIter = 100, tol = 1e-10) {
  const steps: GDStep[] = [];
  let x = x0.slice();
  for (let i = 0; i <= maxIter; i++) {
    const g = grad(x);
    const fx = f(x);
    steps.push({ i, x: x.slice(), f: fx, grad: g });
    if (!Number.isFinite(fx) || Math.abs(fx) > 1e12) return { steps, outcome: "diverged" as const };
    const gn = Math.hypot(...g);
    if (gn < tol) return { steps, outcome: "converged" as const };
    x = x.map((v, k) => v - eta * g[k]);
  }
  return { steps, outcome: "max-iterations" as const };
}
