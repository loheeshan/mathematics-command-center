"use client";
import { useMemo, useState } from "react";
import {
  fmt, createRng, binomialPmf, poissonPmf, normalPdf, normalCdf, exponentialPdf, exponentialCdf, mean, sd, histogram, linearRegression, pearson,
  newtonRaphson, eulerMethod, rk4, fourierPartialSum, standardWave, synth, dftMagnitudes, gradientDescent, type StandardWave, type Wave,
} from "@mcc/math-engine";
import { Plot, FnPath, DragPoint, Slider, Readouts, TextAlternative, DataTable, Seg, Panel } from "../kit";
import { TeX } from "../tex";
import type { SimProps } from "./foundation";

// ---------------------------------------------------------------- Probability lab
export function ProbabilityLabSim({ preset }: SimProps) {
  const [kind, setKind] = useState(preset === "coin" ? "coin" : "dice");
  const [seed, setSeed] = useState(1);
  const [trials, setTrials] = useState(100);
  const outcomes = kind === "coin" ? ["H", "T"] : Array.from({ length: 11 }, (_, i) => String(i + 2));
  const theory = kind === "coin" ? [0.5, 0.5] : outcomes.map((o) => (6 - Math.abs(Number(o) - 7)) / 36);
  const counts = useMemo(() => {
    const r = createRng(`prob-${kind}-${seed}`);
    const c = new Array(outcomes.length).fill(0);
    for (let i = 0; i < trials; i++) {
      if (kind === "coin") c[r.int(0, 1)]++;
      else c[r.int(1, 6) + r.int(1, 6) - 2]++;
    }
    return c as number[];
  }, [kind, seed, trials, outcomes.length]);
  const maxP = Math.max(...theory, ...counts.map((c) => c / trials)) * 1.15;
  return (
    <Panel>
      <div className="flex flex-wrap items-end gap-4">
        <Seg label="Experiment" value={kind} onChange={setKind} options={[{ id: "dice", label: "sum of two dice" }, { id: "coin", label: "one coin" }]} />
        <Slider label="trials" value={Math.log10(trials)} min={1} max={5} step={0.25} onChange={(v) => setTrials(Math.round(10 ** v))} format={() => String(trials)} />
        <button type="button" className="rounded-lg border border-line px-3 py-2" onClick={() => setSeed((s) => s + 1)}>Run again (new seed {seed + 1})</button>
      </div>
      <Plot view={{ xmin: -0.7, xmax: outcomes.length - 0.3, ymin: 0, ymax: maxP }} height={320} xLabel="" yLabel="probability" label={`Experimental vs theoretical probabilities after ${trials} trials`}>
        {(s) => (
          <g>
            {counts.map((c, i) => <rect key={i} x={s.sx(i - 0.35)} width={s.sx(0.7) - s.sx(0)} y={s.sy(c / trials)} height={s.sy(0) - s.sy(c / trials)} fill="color-mix(in srgb, var(--info) 60%, transparent)" />)}
            {theory.map((p, i) => <line key={i} x1={s.sx(i - 0.4)} x2={s.sx(i + 0.4)} y1={s.sy(p)} y2={s.sy(p)} stroke="var(--accent)" strokeWidth={3} />)}
            {outcomes.map((o, i) => <text key={o} x={s.sx(i)} y={s.sy(0) - 4} fontSize={12} textAnchor="middle" fill="var(--fg)">{o}</text>)}
          </g>
        )}
      </Plot>
      <p className="text-sm text-muted">Blue bars: observed relative frequency. Orange lines: exact probability{kind === "dice" ? " (count of the 36 equally likely pairs ÷ 36)" : ""}. More trials → bars usually settle near the lines (law of large numbers), but any single run still varies.</p>
      <Readouts items={[{ label: "trials", value: trials }, { label: "largest gap", value: fmt(Math.max(...counts.map((c, i) => Math.abs(c / trials - theory[i]))), 3) }, { label: "seed", value: seed, note: "same seed → same results" }]} />
      <TextAlternative><DataTable head={["outcome", "count", "observed", "exact"]} rows={outcomes.map((o, i) => [o, String(counts[i]), fmt(counts[i] / trials, 4), kind === "dice" ? `${6 - Math.abs(Number(o) - 7)}/36` : "1/2"])} /></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Distribution builder
export function DistributionBuilderSim({ preset }: SimProps) {
  const [dist, setDist] = useState(preset && ["binomial", "poisson", "normal", "exponential"].includes(preset) ? preset : "binomial");
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.3);
  const [lambda, setLambda] = useState(4);
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [rate, setRate] = useState(1);
  const [a, setA] = useState(dist === "normal" ? -1 : 2);
  const [b, setB] = useState(dist === "normal" ? 1 : 4);
  const discrete = dist === "binomial" || dist === "poisson";
  const kmax = dist === "binomial" ? n : Math.max(10, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
  const pmf = (k: number) => (dist === "binomial" ? binomialPmf(k, n, p) : poissonPmf(k, lambda));
  const lo = Math.min(a, b), hi = Math.max(a, b);
  let prob: number, meanV: number, varV: number, rCall: string;
  if (dist === "binomial") { prob = 0; for (let k = Math.ceil(lo); k <= Math.floor(hi); k++) prob += pmf(k); meanV = n * p; varV = n * p * (1 - p); rCall = `sum(dbinom(${Math.ceil(lo)}:${Math.floor(hi)}, ${n}, ${p}))`; }
  else if (dist === "poisson") { prob = 0; for (let k = Math.max(0, Math.ceil(lo)); k <= Math.floor(hi); k++) prob += pmf(k); meanV = lambda; varV = lambda; rCall = `sum(dpois(${Math.max(0, Math.ceil(lo))}:${Math.floor(hi)}, ${lambda}))`; }
  else if (dist === "normal") { prob = normalCdf(hi, mu, sigma) - normalCdf(lo, mu, sigma); meanV = mu; varV = sigma * sigma; rCall = `pnorm(${fmt(hi)}, ${mu}, ${sigma}) - pnorm(${fmt(lo)}, ${mu}, ${sigma})`; }
  else { prob = exponentialCdf(hi, rate) - exponentialCdf(lo, rate); meanV = 1 / rate; varV = 1 / (rate * rate); rCall = `pexp(${fmt(hi)}, ${rate}) - pexp(${fmt(lo)}, ${rate})`; }
  const view = discrete ? { xmin: -1, xmax: kmax + 1, ymin: 0, ymax: Math.max(...Array.from({ length: kmax + 1 }, (_, k) => pmf(k))) * 1.2 } : dist === "normal" ? { xmin: mu - 4 * sigma, xmax: mu + 4 * sigma, ymin: 0, ymax: normalPdf(mu, mu, sigma) * 1.2 } : { xmin: -0.2, xmax: 6 / rate, ymin: 0, ymax: rate * 1.15 };
  const range = discrete ? [0, kmax] : [view.xmin, view.xmax];
  return (
    <Panel>
      <Seg label="Distribution" value={dist} onChange={(v) => { setDist(v); if (v === "normal") { setA(-1); setB(1); } else if (v === "exponential") { setA(0.5); setB(2); } else { setA(2); setB(4); } }} options={[{ id: "binomial", label: "Binomial" }, { id: "poisson", label: "Poisson" }, { id: "normal", label: "Normal" }, { id: "exponential", label: "Exponential" }]} />
      <div className="flex flex-wrap gap-4">
        {dist === "binomial" && <><Slider label="n (trials)" value={n} min={1} max={40} step={1} onChange={setN} /><Slider label="p (success)" value={p} min={0} max={1} step={0.01} onChange={setP} /></>}
        {dist === "poisson" && <Slider label="λ (mean rate)" value={lambda} min={0.5} max={20} step={0.5} onChange={setLambda} />}
        {dist === "normal" && <><Slider label="μ" value={mu} min={-3} max={3} step={0.1} onChange={setMu} /><Slider label="σ" value={sigma} min={0.2} max={3} step={0.1} onChange={setSigma} /></>}
        {dist === "exponential" && <Slider label="λ (rate)" value={rate} min={0.2} max={3} step={0.1} onChange={setRate} />}
        <Slider label="from a" value={a} min={range[0]} max={range[1]} step={discrete ? 1 : 0.05} onChange={setA} />
        <Slider label="to b" value={b} min={range[0]} max={range[1]} step={discrete ? 1 : 0.05} onChange={setB} />
      </div>
      <Plot view={view} height={320} label={`P(${fmt(lo)} ≤ X ≤ ${fmt(hi)}) = ${fmt(prob, 5)}`} xLabel="x" yLabel={discrete ? "P(X = k)" : "f(x)"}>
        {(s) => discrete ? (
          <g>{Array.from({ length: kmax + 1 }, (_, k) => <rect key={k} x={s.sx(k - 0.4)} width={s.sx(0.8) - s.sx(0)} y={s.sy(pmf(k))} height={s.sy(0) - s.sy(pmf(k))} fill={k >= lo && k <= hi ? "var(--accent)" : "color-mix(in srgb, var(--info) 50%, transparent)"} />)}</g>
        ) : (
          <g>
            <polygon fill="color-mix(in srgb, var(--accent) 45%, transparent)" points={[`${s.sx(lo)},${s.sy(0)}`, ...Array.from({ length: 101 }, (_, i) => { const x = lo + ((hi - lo) * i) / 100; const y = dist === "normal" ? normalPdf(x, mu, sigma) : exponentialPdf(x, rate); return `${s.sx(x)},${s.sy(y)}`; }), `${s.sx(hi)},${s.sy(0)}`].join(" ")} />
            <FnPath s={s} f={(x) => (dist === "normal" ? normalPdf(x, mu, sigma) : exponentialPdf(x, rate))} color="var(--info)" />
          </g>
        )}
      </Plot>
      <Readouts items={[
        { label: <>P({fmt(lo)} ≤ X ≤ {fmt(hi)})</>, value: fmt(prob, 6), note: discrete ? "sum of the orange bars" : "orange area = integral of the pdf" },
        { label: "mean E[X]", value: fmt(meanV, 5) },
        { label: "variance", value: fmt(varV, 5) },
        { label: "Same in R", value: <code className="text-xs">{rCall}</code> },
      ]} />
      {!discrete && <p className="text-sm text-muted">For a continuous variable P(X = x) = 0 for any single x; probabilities are areas, so ≤ and &lt; give the same answer.</p>}
      <TextAlternative>
        {discrete ? <DataTable head={["k", "P(X = k)"]} rows={Array.from({ length: Math.min(kmax, 25) + 1 }, (_, k) => [String(k), fmt(pmf(k), 6)])} /> : <p>Shaded probability {fmt(prob, 6)} between {fmt(lo)} and {fmt(hi)}.</p>}
      </TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- CLT lab
export function CltLabSim({ preset }: SimProps) {
  const [pop, setPop] = useState(preset === "uniform" ? "uniform" : preset === "dice" ? "dice" : "exponential");
  const [n, setN] = useState(5);
  const [reps, setReps] = useState(2000);
  const [seed, setSeed] = useState(1);
  const P = { uniform: { mu: 0.5, sigma: Math.sqrt(1 / 12), draw: (r: ReturnType<typeof createRng>) => r.next(), range: [0, 1] }, exponential: { mu: 1, sigma: 1, draw: (r: ReturnType<typeof createRng>) => -Math.log(1 - r.next()), range: [0, 4] }, dice: { mu: 3.5, sigma: Math.sqrt(35 / 12), draw: (r: ReturnType<typeof createRng>) => r.int(1, 6), range: [1, 6] } }[pop]!;
  const means = useMemo(() => {
    const r = createRng(`clt-${pop}-${seed}`);
    return Array.from({ length: reps }, () => { let s = 0; for (let i = 0; i < n; i++) s += P.draw(r); return s / n; });
  }, [pop, n, reps, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const se = P.sigma / Math.sqrt(n);
  const lo = P.mu - 4.5 * se, hi = P.mu + 4.5 * se;
  const bins = histogram(means, lo, hi, 40);
  const w = (hi - lo) / 40;
  const dens = bins.map((b) => b.count / (reps * w));
  return (
    <Panel>
      <div className="flex flex-wrap items-end gap-4">
        <Seg label="Population" value={pop} onChange={setPop} options={[{ id: "exponential", label: "skewed (exponential)" }, { id: "uniform", label: "uniform" }, { id: "dice", label: "one die" }]} />
        <Slider label="sample size n" value={n} min={1} max={100} step={1} onChange={setN} />
        <Slider label="number of samples" value={reps} min={100} max={10000} step={100} onChange={setReps} />
        <button type="button" className="rounded-lg border border-line px-3 py-2" onClick={() => setSeed((s) => s + 1)}>Resample</button>
      </div>
      <Plot view={{ xmin: lo, xmax: hi, ymin: 0, ymax: Math.max(...dens, normalPdf(P.mu, P.mu, se)) * 1.15 }} height={320} xLabel="sample mean" yLabel="density" label={`Histogram of ${reps} sample means with n = ${n}`}>
        {(s) => (
          <g>
            {bins.map((b, i) => <rect key={i} x={s.sx(b.x0)} width={s.sx(b.x1) - s.sx(b.x0) - 0.5} y={s.sy(dens[i])} height={s.sy(0) - s.sy(dens[i])} fill="color-mix(in srgb, var(--info) 60%, transparent)" />)}
            <FnPath s={s} f={(x) => normalPdf(x, P.mu, se)} />
          </g>
        )}
      </Plot>
      <Readouts items={[
        { label: "population μ, σ", value: `${fmt(P.mu, 4)}, ${fmt(P.sigma, 4)}` },
        { label: "mean of sample means", value: fmt(mean(means), 5), note: "≈ μ" },
        { label: "SD of sample means", value: fmt(sd(means), 5), note: `theory σ/√n = ${fmt(se, 5)}` },
      ]} />
      <p className="text-sm text-muted">The orange curve is the normal distribution the CLT predicts, N(μ, σ²/n). With small n from a skewed population the histogram is still skewed; it becomes bell-shaped as n grows. Results vary from run to run — that variability is real, not an error.</p>
    </Panel>
  );
}

// ---------------------------------------------------------------- Regression studio
const CARS = { speed: [4,4,7,7,8,9,10,10,10,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,16,16,17,17,17,18,18,18,18,19,19,19,20,20,20,20,20,22,23,24,24,24,24,25], dist: [2,10,4,22,16,10,18,26,34,17,28,14,20,24,28,26,34,34,46,26,36,60,80,20,26,54,32,40,32,40,50,42,56,76,84,36,46,68,32,48,52,56,64,66,54,70,92,93,120,85] };
export function RegressionStudioSim({ preset }: SimProps) {
  const initial = preset === "cars" ? CARS.speed.map((x, i) => [x, CARS.dist[i]]) : preset === "no-correlation" ? [[2, 5], [3, 2], [4, 7], [5, 3], [6, 6], [7, 4], [8, 5]] : [[1, 2], [2, 3], [3, 5], [4, 4], [5, 6], [6, 7], [7, 7], [8, 9], ...(preset === "outlier" ? [[8, 0]] : [])];
  const [pts, setPts] = useState(initial);
  const [showRes, setShowRes] = useState(true);
  const cars = preset === "cars";
  const view = cars ? { xmin: 0, xmax: 27, ymin: -20, ymax: 125 } : { xmin: 0, xmax: 10, ymin: -2, ymax: 11 };
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  let fit: ReturnType<typeof linearRegression> | null = null;
  try { fit = linearRegression(xs, ys); } catch { fit = null; }
  const r = pts.length > 1 ? pearson(xs, ys) : NaN;
  return (
    <Panel>
      <Plot view={view} label={`Scatter plot with least-squares line; R squared ${fit ? fmt(fit.r2, 4) : "undefined"}`} xLabel={cars ? "speed (mph)" : "x"} yLabel={cars ? "dist (ft)" : "y"}>
        {(s) => (
          <g>
            {fit && <FnPath s={s} f={(x) => fit!.intercept + fit!.slope * x} />}
            {fit && showRes && pts.map((p, i) => <line key={`r${i}`} x1={s.sx(p[0])} x2={s.sx(p[0])} y1={s.sy(p[1])} y2={s.sy(fit!.fitted[i])} stroke="var(--bad)" strokeWidth={1.5} />)}
            {pts.map((p, i) => cars ? <circle key={i} cx={s.sx(p[0])} cy={s.sy(p[1])} r={4} fill="var(--info)" /> : <DragPoint key={i} s={s} x={p[0]} y={p[1]} step={0.1} r={6} color="var(--info)" label={`Data point ${i + 1}`} onChange={(x, y) => setPts((ps) => ps.map((q, j) => (j === i ? [x, y] : q)))} />)}
          </g>
        )}
      </Plot>
      <div className="flex flex-wrap gap-2">
        {!cars && <button type="button" className="rounded-lg border border-line px-3 py-2" onClick={() => setPts((p) => [...p, [5, 5]])}>Add point</button>}
        {!cars && <button type="button" className="rounded-lg border border-line px-3 py-2" disabled={pts.length <= 2} onClick={() => setPts((p) => p.slice(0, -1))}>Remove last point</button>}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showRes} onChange={(e) => setShowRes(e.target.checked)} /> show residuals</label>
      </div>
      <Readouts items={[
        { label: "fitted line", value: fit ? <TeX tex={`\\hat y = ${fmt(fit.intercept, 5)} ${fit.slope < 0 ? "-" : "+"} ${fmt(Math.abs(fit.slope), 5)}x`} /> : "undefined (all x equal)" },
        { label: "Pearson r", value: fmt(r, 4) },
        { label: "R²", value: fit ? fmt(fit.r2, 4) : "—", note: fit ? `${fmt(fit.r2 * 100, 3)}% of variation in y explained` : undefined },
        { label: "residual sum of squares", value: fit ? fmt(fit.ssRes, 5) : "—" },
      ]} />
      {cars && <p className="text-sm text-muted">This is R’s built-in <code>cars</code> data (50 cars, 1920s). <code>lm(dist ~ speed, data = cars)</code> gives the same coefficients: −17.579 and 3.932, R² = 0.6511.</p>}
      <TextAlternative><DataTable head={["x", "y", "fitted", "residual"]} rows={pts.slice(0, 50).map((p, i) => [fmt(p[0]), fmt(p[1]), fit ? fmt(fit.fitted[i], 5) : "—", fit ? fmt(fit.residuals[i], 5) : "—"])} /></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Newton–Raphson
const NR: Record<string, { label: string; f: (x: number) => number; df: (x: number) => number; tex: string; x0: number; view: [number, number, number, number] }> = {
  sqrt2: { label: "x² − 2", f: (x) => x * x - 2, df: (x) => 2 * x, tex: "x^2 - 2", x0: 3, view: [-1, 4, -3, 10] },
  "lecture-cubic": { label: "x³ − 3x² + 4", f: (x) => x ** 3 - 3 * x * x + 4, df: (x) => 3 * x * x - 6 * x, tex: "x^3 - 3x^2 + 4", x0: -2, view: [-3, 4, -8, 8] },
  cycle: { label: "x³ − 2x + 2 (cycles)", f: (x) => x ** 3 - 2 * x + 2, df: (x) => 3 * x * x - 2, tex: "x^3 - 2x + 2", x0: 0, view: [-2.5, 2, -4, 6] },
  flat: { label: "cos x (flat tangent)", f: Math.cos, df: (x) => -Math.sin(x), tex: "\\cos x", x0: 0.001, view: [-4, 7, -1.5, 1.5] },
};
export function NewtonRaphsonSim({ preset }: SimProps) {
  const [key, setKey] = useState(preset && NR[preset] ? preset : "sqrt2");
  const P = NR[key];
  const [x0, setX0] = useState(P.x0);
  const [shown, setShown] = useState(4);
  const res = newtonRaphson(P.f, P.df, x0, { maxIter: 30 });
  const steps = res.steps.slice(0, shown);
  return (
    <Panel>
      <Seg label="Function" value={key} onChange={(v) => { setKey(v); setX0(NR[v].x0); setShown(4); }} options={Object.entries(NR).map(([id, p]) => ({ id, label: p.label }))} />
      <p><TeX tex={`f(x) = ${P.tex},\\qquad x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}`} /></p>
      <div className="flex flex-wrap items-end gap-4">
        <Slider label="starting guess x₀" value={x0} min={P.view[0]} max={P.view[1]} step={0.01} onChange={setX0} />
        <Slider label="iterations shown" value={shown} min={1} max={12} step={1} onChange={setShown} />
      </div>
      <Plot view={{ xmin: P.view[0], xmax: P.view[1], ymin: P.view[2], ymax: P.view[3] }} zoomable label={`Newton–Raphson from x0 = ${fmt(x0)}: ${res.outcome}`}>
        {(s) => (
          <g>
            <FnPath s={s} f={P.f} color="var(--fg)" />
            {steps.map((st, i) => st.next !== null && (
              <g key={i} opacity={0.4 + (0.6 * (i + 1)) / steps.length}>
                <line x1={s.sx(st.x)} y1={s.sy(0)} x2={s.sx(st.x)} y2={s.sy(st.fx)} stroke="var(--muted)" strokeDasharray="3 3" />
                <line x1={s.sx(st.x)} y1={s.sy(st.fx)} x2={s.sx(st.next)} y2={s.sy(0)} stroke="var(--accent)" strokeWidth={2} />
                <circle cx={s.sx(st.next)} cy={s.sy(0)} r={4} fill="var(--accent)" />
              </g>
            ))}
            <DragPoint s={s} x={x0} y={0} step={0.01} lockY label="Starting guess x0" color="var(--info)" onChange={(x) => setX0(x)} />
          </g>
        )}
      </Plot>
      <Readouts items={[
        { label: "outcome", value: res.outcome, note: res.outcome === "zero-derivative" ? "tangent is horizontal: never meets the x-axis" : res.outcome === "max-iterations" ? "no convergence — e.g. a 2-cycle" : res.outcome === "converged" ? `root ≈ ${fmt(res.root!, 12)}` : undefined },
        { label: "iterations", value: res.steps.length },
      ]} />
      <DataTable caption="Iterates" head={["n", "xₙ", "f(xₙ)", "f′(xₙ)", "xₙ₊₁"]} rows={res.steps.slice(0, 10).map((st) => [String(st.n), fmt(st.x, 12), fmt(st.fx, 6), fmt(st.dfx, 6), st.next === null ? "—" : fmt(st.next, 12)])} />
      {key === "lecture-cubic" && <p className="text-sm text-muted">The lecture classifies this cubic’s roots: x = −1 is simple, x = 2 is a double root. Start near 2 and notice convergence is much slower (linear, not quadratic) at a multiple root.</p>}
    </Panel>
  );
}

// ---------------------------------------------------------------- ODE lab
const ODE: Record<string, { label: string; f: (x: number, y: number) => number; exact: (x: number, y0: number) => number; tex: string; view: [number, number, number, number]; y0: number }> = {
  growth: { label: "y′ = y", f: (_x, y) => y, exact: (x, y0) => y0 * Math.exp(x), tex: "y' = y", view: [0, 2.5, 0, 12], y0: 1 },
  decay: { label: "y′ = −2y", f: (_x, y) => -2 * y, exact: (x, y0) => y0 * Math.exp(-2 * x), tex: "y' = -2y", view: [0, 3, -0.5, 3], y0: 2.5 },
  logistic: { label: "y′ = y(1 − y/4)", f: (_x, y) => y * (1 - y / 4), exact: (x, y0) => 4 / (1 + ((4 - y0) / y0) * Math.exp(-x)), tex: "y' = y\\left(1 - \\tfrac{y}{4}\\right)", view: [0, 8, 0, 5], y0: 0.5 },
};
export function OdeLabSim({ preset }: SimProps) {
  const [key, setKey] = useState(preset && ODE[preset] ? preset : "growth");
  const P = ODE[key];
  const [h, setH] = useState(0.25);
  const [y0, setY0] = useState(P.y0);
  const steps = Math.round((P.view[1] - P.view[0]) / h);
  const eu = eulerMethod(P.f, 0, y0, h, steps);
  const rk = rk4(P.f, 0, y0, h, steps);
  const X = eu[eu.length - 1][0];
  return (
    <Panel>
      <Seg label="Equation" value={key} onChange={(v) => { setKey(v); setY0(ODE[v].y0); }} options={Object.entries(ODE).map(([id, p]) => ({ id, label: p.label }))} />
      <p><TeX tex={`${P.tex},\\quad y(0) = ${fmt(y0)}`} /></p>
      <div className="flex flex-wrap gap-4">
        <Slider label="step h" value={h} min={0.05} max={1} step={0.05} onChange={setH} />
        <Slider label="y(0)" value={y0} min={0.1} max={P.view[3] * 0.8} step={0.1} onChange={setY0} />
      </div>
      <Plot view={{ xmin: P.view[0], xmax: P.view[1], ymin: P.view[2], ymax: P.view[3] }} label={`Direction field with Euler and RK4 solutions, step ${h}`}>
        {(s) => (
          <g>
            {Array.from({ length: 15 }, (_, i) => Array.from({ length: 11 }, (_, j) => {
              const x = P.view[0] + ((i + 0.5) * (P.view[1] - P.view[0])) / 15, y = P.view[2] + ((j + 0.5) * (P.view[3] - P.view[2])) / 11;
              const m = P.f(x, y);
              const dx = 1, dy = m * ((s.sy(0) - s.sy(1)) / (s.sx(1) - s.sx(0)));
              const L = 9 / Math.hypot(dx, dy);
              return <line key={`${i}-${j}`} x1={s.sx(x) - dx * L} y1={s.sy(y) + dy * L} x2={s.sx(x) + dx * L} y2={s.sy(y) - dy * L} stroke="var(--muted)" strokeOpacity={0.6} />;
            }))}
            <FnPath s={s} f={(x) => P.exact(x, y0)} color="var(--ok)" width={2} />
            <polyline fill="none" stroke="var(--accent)" strokeWidth={2} points={eu.map(([x, y]) => `${s.sx(x)},${s.sy(y)}`).join(" ")} />
            {eu.map(([x, y], i) => <circle key={i} cx={s.sx(x)} cy={s.sy(y)} r={3} fill="var(--accent)" />)}
            <polyline fill="none" stroke="var(--info)" strokeWidth={2} strokeDasharray="5 4" points={rk.map(([x, y]) => `${s.sx(x)},${s.sy(y)}`).join(" ")} />
          </g>
        )}
      </Plot>
      <Readouts items={[
        { label: `exact y(${fmt(X)})`, value: fmt(P.exact(X, y0), 8), note: "green" },
        { label: "Euler", value: fmt(eu[eu.length - 1][1], 8), note: `error ${fmt(Math.abs(eu[eu.length - 1][1] - P.exact(X, y0)), 3)} (orange)` },
        { label: "RK4", value: fmt(rk[rk.length - 1][1], 8), note: `error ${fmt(Math.abs(rk[rk.length - 1][1] - P.exact(X, y0)), 3)} (blue dashed)` },
      ]} />
      <p className="text-sm text-muted">Halving h roughly halves Euler’s error (first-order method) but divides RK4’s error by about 16 (fourth-order).</p>
      <TextAlternative><DataTable head={["x", "Euler", "RK4", "exact"]} rows={eu.slice(0, 20).map(([x, y], i) => [fmt(x), fmt(y, 6), fmt(rk[i][1], 6), fmt(P.exact(x, y0), 6)])} /></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Fourier
export function FourierSynthSim({ preset }: SimProps) {
  const [wave, setWave] = useState<StandardWave | "custom">(preset === "sawtooth" || preset === "triangle" || preset === "custom" ? (preset as StandardWave | "custom") : "square");
  const [N, setN] = useState(5);
  const [waves, setWaves] = useState<Wave[]>([{ amplitude: 1, frequency: 1, phase: 0 }, { amplitude: 0.5, frequency: 3, phase: 0 }, { amplitude: 0, frequency: 5, phase: 0 }]);
  const f = wave === "custom" ? (x: number) => synth(waves)(x / (2 * Math.PI)) : fourierPartialSum(wave, N);
  const target = wave === "custom" ? null : standardWave(wave);
  const samples = Array.from({ length: 64 }, (_, n) => (wave === "custom" ? synth(waves)(n / 64) : 0));
  const spectrum = wave === "custom" ? dftMagnitudes(samples).slice(0, 12) : Array.from({ length: Math.min(N, 15) + 1 }, (_, n) => { if (n === 0) return wave === "triangle" ? Math.PI / 2 : 0; const sq = wave === "square" ? (n % 2 ? 4 / (Math.PI * n) : 0) : wave === "sawtooth" ? 2 / n : n % 2 ? 4 / (Math.PI * n * n) : 0; return sq; });
  const overshoot = wave === "square" ? Math.max(...Array.from({ length: 400 }, (_, i) => f(0.001 + (i * Math.PI) / 400))) : NaN;
  return (
    <Panel>
      <Seg label="Wave" value={wave} onChange={(v) => setWave(v as StandardWave | "custom")} options={[{ id: "square", label: "square" }, { id: "sawtooth", label: "sawtooth" }, { id: "triangle", label: "triangle" }, { id: "custom", label: "build your own" }]} />
      {wave !== "custom" ? (
        <>
          <p><TeX tex={wave === "square" ? `f(x) \\approx \\frac{4}{\\pi}\\sum_{n\\,\\text{odd}\\le ${N}} \\frac{\\sin nx}{n}` : wave === "sawtooth" ? `f(x) \\approx 2\\sum_{n=1}^{${N}} \\frac{(-1)^{n+1}\\sin nx}{n}` : `f(x) \\approx \\frac{\\pi}{2} - \\frac{4}{\\pi}\\sum_{n\\,\\text{odd}\\le ${N}} \\frac{\\cos nx}{n^2}`} /></p>
          <Slider label="harmonics N" value={N} min={1} max={60} step={1} onChange={setN} />
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {waves.map((w, i) => (
            <div key={i} className="rounded-lg border border-line p-2">
              <Slider label={`amplitude ${i + 1}`} value={w.amplitude} min={0} max={2} step={0.05} onChange={(v) => setWaves((ws) => ws.map((x, j) => (j === i ? { ...x, amplitude: v } : x)))} />
              <Slider label={`frequency ${i + 1} (cycles)`} value={w.frequency} min={1} max={10} step={1} onChange={(v) => setWaves((ws) => ws.map((x, j) => (j === i ? { ...x, frequency: v } : x)))} />
              <Slider label={`phase ${i + 1}`} value={w.phase} min={0} max={6.28} step={0.01} onChange={(v) => setWaves((ws) => ws.map((x, j) => (j === i ? { ...x, phase: v } : x)))} />
            </div>
          ))}
        </div>
      )}
      <Plot view={{ xmin: -2 * Math.PI, xmax: 2 * Math.PI, ymin: wave === "sawtooth" ? -4 : wave === "triangle" ? -0.5 : -2.2, ymax: wave === "sawtooth" ? 4 : wave === "triangle" ? 3.8 : 2.2 }} piTicks label="Composite signal">
        {(s) => (
          <g>
            {target && <FnPath s={s} f={target} color="var(--muted)" width={1.5} dash="4 3" />}
            <FnPath s={s} f={f} samples={1500} />
          </g>
        )}
      </Plot>
      <div>
        <p className="mb-1 text-sm text-muted">Spectrum: amplitude of each frequency component</p>
        <svg viewBox="0 0 600 120" className="h-auto w-full rounded-lg border border-line bg-bg" role="img" aria-label="Bar chart of harmonic amplitudes">
          {spectrum.map((m, k) => <g key={k}><rect x={20 + k * (560 / spectrum.length)} width={560 / spectrum.length - 4} y={100 - Math.min(90, m * 45)} height={Math.min(90, m * 45)} fill="var(--accent)" /><text x={20 + k * (560 / spectrum.length) + 560 / spectrum.length / 2 - 2} y={114} fontSize={10} textAnchor="middle" fill="var(--muted)">{k}</text></g>)}
        </svg>
      </div>
      {wave === "square" && <Readouts items={[{ label: "peak of partial sum", value: fmt(overshoot, 5), note: "Gibbs: overshoot ≈ 9% of the jump (→ 1.179) never disappears" }]} />}
    </Panel>
  );
}

// ---------------------------------------------------------------- Gradient descent
const GD: Record<string, { label: string; eta: number; dim: 1 | 2 }> = { "good-rate": { label: "good rate", eta: 0.1, dim: 1 }, oscillate: { label: "oscillating", eta: 0.9, dim: 1 }, diverge: { label: "diverging", eta: 1.05, dim: 1 }, valley: { label: "2-D narrow valley", eta: 0.09, dim: 2 } };
export function GradientDescentSim({ preset }: SimProps) {
  const P = GD[preset ?? ""] ?? GD["good-rate"];
  const [dim, setDim] = useState<1 | 2>(P.dim);
  const [eta, setEta] = useState(P.eta);
  const [x0, setX0] = useState(dim === 1 ? 4 : -4);
  const [y0, setY0] = useState(2);
  const [iters, setIters] = useState(25);
  const f1 = (x: number[]) => (x[0] - 1) ** 2;
  const g1 = (x: number[]) => [2 * (x[0] - 1)];
  const f2 = (x: number[]) => 0.5 * x[0] ** 2 + 5 * x[1] ** 2; // condition number 10
  const g2 = (x: number[]) => [x[0], 10 * x[1]];
  const run = dim === 1 ? gradientDescent(f1, g1, [x0], eta, iters) : gradientDescent(f2, g2, [x0, y0], eta, iters);
  const last = run.steps[run.steps.length - 1];
  return (
    <Panel>
      <div className="flex flex-wrap items-end gap-4">
        <Seg label="Loss" value={String(dim)} onChange={(v) => { const d = Number(v) as 1 | 2; setDim(d); setX0(d === 1 ? 4 : -4); }} options={[{ id: "1", label: "L(w) = (w − 1)²" }, { id: "2", label: "L = ½w₁² + 5w₂²" }]} />
        <Slider label="learning rate η" value={eta} min={0.01} max={dim === 1 ? 1.2 : 0.25} step={0.01} onChange={setEta} />
        <Slider label="iterations" value={iters} min={1} max={100} step={1} onChange={setIters} />
      </div>
      {dim === 1 ? (
        <Plot view={{ xmin: -4, xmax: 6, ymin: -1, ymax: 20 }} label={`Gradient descent on (w-1)^2, eta ${eta}: ${run.outcome}`} xLabel="w" yLabel="L">
          {(s) => (
            <g>
              <FnPath s={s} f={(x) => (x - 1) ** 2} color="var(--fg)" />
              <polyline fill="none" stroke="var(--accent)" strokeWidth={1.5} points={run.steps.filter((st) => Math.abs(st.x[0]) < 50).map((st) => `${s.sx(st.x[0])},${s.sy(st.f)}`).join(" ")} />
              {run.steps.filter((st) => Math.abs(st.x[0]) < 50).map((st) => <circle key={st.i} cx={s.sx(st.x[0])} cy={s.sy(st.f)} r={4} fill="var(--accent)" />)}
              <DragPoint s={s} x={x0} y={(x0 - 1) ** 2} lockY step={0.1} label="Starting weight" color="var(--info)" onChange={(x) => setX0(x)} />
            </g>
          )}
        </Plot>
      ) : (
        <Plot view={{ xmin: -5, xmax: 5, ymin: -3, ymax: 3 }} equalAspect label={`Gradient descent on an elongated bowl, eta ${eta}: ${run.outcome}`} xLabel="w₁" yLabel="w₂">
          {(s) => (
            <g>
              {[0.5, 2, 4.5, 8, 12.5].map((c) => <ellipse key={c} cx={s.sx(0)} cy={s.sy(0)} rx={s.sx(Math.sqrt(2 * c)) - s.sx(0)} ry={s.sy(0) - s.sy(Math.sqrt(c / 5))} fill="none" stroke="var(--muted)" strokeOpacity={0.6} />)}
              <polyline fill="none" stroke="var(--accent)" strokeWidth={2} points={run.steps.filter((st) => Math.hypot(st.x[0], st.x[1]) < 50).map((st) => `${s.sx(st.x[0])},${s.sy(st.x[1])}`).join(" ")} />
              <DragPoint s={s} x={x0} y={y0} step={0.1} label="Starting point" color="var(--info)" onChange={(x, y) => { setX0(x); setY0(y); }} />
            </g>
          )}
        </Plot>
      )}
      <Readouts items={[
        { label: "outcome", value: run.outcome, note: dim === 1 ? (eta < 1 ? (eta > 0.5 ? "0.5 < η < 1: overshoots, oscillates, converges" : "0 < η ≤ 0.5: approaches steadily") : eta === 1 ? "η = 1: bounces forever" : "η > 1: each step overshoots further — diverges") : "stable only if η < 2/10 (largest curvature)" },
        { label: "final loss", value: fmt(last.f, 6) },
        { label: "final w", value: last.x.map((v) => fmt(v, 5)).join(", ") },
      ]} />
      <p className="text-sm text-muted">Update: <TeX tex={"w \\leftarrow w - \\eta\\,\\nabla L(w)"} />. For L = (w − 1)², each step multiplies the distance to the minimum by |1 − 2η| — so the behaviour is predictable exactly.</p>
      <TextAlternative><DataTable head={["step", "w", "L(w)"]} rows={run.steps.slice(0, 15).map((st) => [String(st.i), st.x.map((v) => fmt(v, 6)).join(", "), fmt(st.f, 6)])} /></TextAlternative>
    </Panel>
  );
}


