"use client";
import { useMemo, useState } from "react";
import { fmt, compileFn, symbolicDerivative, differenceQuotient, riemannSum, simpson, partialSums, linalg, type RiemannRule } from "@mcc/math-engine";
import { Plot, FnPath, DragPoint, Slider, Readouts, TextAlternative, DataTable, Seg, Panel } from "../kit";
import { TeX } from "../tex";
import type { SimProps } from "./foundation";

// ---------------------------------------------------------------- Limit explorer
const LIMIT_PRESETS: Record<string, { label: string; f: (x: number) => number; a: number; tex: string; left: number | string; right: number | string; value: string; view: [number, number, number, number]; note: string }> = {
  hole: { label: "removable hole", f: (x) => (x === 1 ? NaN : (x * x - 1) / (x - 1)), a: 1, tex: "\\frac{x^2-1}{x-1}", left: 2, right: 2, value: "undefined (0/0)", view: [-2, 4, -1, 5], note: "Both sides approach 2, so the limit is 2 even though f(1) is undefined." },
  jump: { label: "jump", f: (x) => (x < 0 ? -1 : 1) + x / 4, a: 0, tex: "\\begin{cases} x/4 - 1 & x<0 \\\\ x/4 + 1 & x \\ge 0\\end{cases}", left: -1, right: 1, value: "1", view: [-3, 3, -3, 3], note: "Left limit −1 ≠ right limit 1, so the two-sided limit does not exist." },
  asymptote: { label: "vertical asymptote", f: (x) => 1 / (x - 2) ** 2, a: 2, tex: "\\frac{1}{(x-2)^2}", left: "+∞", right: "+∞", value: "undefined", view: [-1, 5, -1, 12], note: "f grows without bound from both sides: lim = +∞ (an infinite limit — the limit does not exist as a real number)." },
  "sinx-over-x": { label: "sin x / x", f: (x) => (x === 0 ? NaN : Math.sin(x) / x), a: 0, tex: "\\frac{\\sin x}{x}", left: 1, right: 1, value: "undefined (0/0)", view: [-8, 8, -0.5, 1.4], note: "A famous limit: sin x / x → 1 as x → 0 (x in radians)." },
};
export function LimitExplorerSim({ preset }: SimProps) {
  const [key, setKey] = useState(preset && LIMIT_PRESETS[preset] ? preset : "hole");
  const P = LIMIT_PRESETS[key];
  const [k, setK] = useState(1); // h = 10^-k
  const h = 10 ** -k;
  const rows = [1, 2, 3, 4, 5, 6].map((e) => [10 ** -e, P.f(P.a - 10 ** -e), P.f(P.a + 10 ** -e)]);
  const [x0, x1, y0, y1] = P.view;
  return (
    <Panel>
      <Seg label="Function" value={key} onChange={(v) => setKey(v)} options={Object.entries(LIMIT_PRESETS).map(([id, p]) => ({ id, label: p.label }))} />
      <p><TeX tex={`f(x) = ${P.tex},\\qquad x \\to ${P.a}`} /></p>
      <Slider label="distance h from a" value={k} min={0} max={6} step={1} onChange={setK} format={(v) => `10^-${v} = ${fmt(10 ** -v)}`} />
      <Plot view={{ xmin: x0, xmax: x1, ymin: y0, ymax: y1 }} zoomable label={`Graph near x = ${P.a}`}>
        {(s) => (
          <g>
            <FnPath s={s} f={P.f} samples={1200} />
            <line x1={s.sx(P.a)} x2={s.sx(P.a)} y1={0} y2={s.H} stroke="var(--muted)" strokeDasharray="4 4" />
            {typeof P.left === "number" && <circle cx={s.sx(P.a)} cy={s.sy(P.left)} r={6} fill="var(--bg)" stroke="var(--accent)" strokeWidth={2} />}
            {typeof P.right === "number" && P.right !== P.left && <circle cx={s.sx(P.a)} cy={s.sy(P.right)} r={6} fill="var(--accent)" />}
            {Number.isFinite(P.f(P.a - h)) && <circle cx={s.sx(P.a - h)} cy={s.sy(P.f(P.a - h))} r={6} fill="var(--info)" />}
            {Number.isFinite(P.f(P.a + h)) && <circle cx={s.sx(P.a + h)} cy={s.sy(P.f(P.a + h))} r={6} fill="var(--ok)" />}
          </g>
        )}
      </Plot>
      <div className="overflow-x-auto">
        <DataTable caption="Table of values approaching a from each side" head={["h", `f(${P.a} − h) (left)`, `f(${P.a} + h) (right)`]} rows={rows.map(([hh, l, r]) => [fmt(hh), fmt(l, 9), fmt(r, 9)])} />
      </div>
      <Readouts items={[{ label: "Left limit", value: String(P.left) }, { label: "Right limit", value: String(P.right) }, { label: `f(${P.a}) itself`, value: P.value }, { label: "Two-sided limit", value: P.left === P.right ? String(P.left) : "does not exist" }]} />
      <p className="text-sm">{P.note}</p>
    </Panel>
  );
}

// ---------------------------------------------------------------- Tangent lab
const TANGENT: Record<string, { src: string; view: [number, number, number, number] }> = { cubic: { src: "x^3 - 3x", view: [-3, 3, -5, 5] }, sine: { src: "sin(x)", view: [-4, 4, -2, 2] }, exp: { src: "exp(x)", view: [-3, 2.5, -1, 8] } };
export function TangentLabSim({ preset }: SimProps) {
  const P = TANGENT[preset ?? ""] ?? TANGENT.cubic;
  const [src, setSrc] = useState(P.src);
  const [a, setA] = useState(1);
  const [h, setH] = useState(1);
  const parsed = useMemo(() => {
    try {
      return { f: compileFn(src), d: symbolicDerivative(src), err: null };
    } catch (e) {
      return { f: null, d: null, err: (e as Error).message };
    }
  }, [src]);
  const f = parsed.f;
  const df = useMemo(() => (parsed.d ? compileFn(parsed.d.source) : null), [parsed.d]);
  const sec = f ? differenceQuotient(f, a, h) : NaN;
  const exact = df ? df(a) : NaN;
  return (
    <Panel>
      <label className="block text-sm text-muted">f(x) =<input value={src} onChange={(e) => setSrc(e.target.value)} className="ml-2 w-64 rounded-md border border-line bg-bg px-2 py-1 font-mono text-fg" spellCheck={false} /></label>
      {parsed.err && <p role="alert" className="text-warn">{parsed.err}</p>}
      <div className="flex flex-wrap gap-4">
        <Slider label="point a" value={a} min={P.view[0] + 0.5} max={P.view[1] - 0.5} step={0.05} onChange={setA} />
        <Slider label="step h" value={h} min={-2} max={2} step={0.01} onChange={(v) => setH(Math.abs(v) < 0.001 ? 0.001 : v)} />
      </div>
      {f && (
        <Plot view={{ xmin: P.view[0], xmax: P.view[1], ymin: P.view[2], ymax: P.view[3] }} zoomable label={`Secant slope ${fmt(sec, 5)} and tangent slope ${fmt(exact, 5)} at x = ${fmt(a)}`}>
          {(s) => (
            <g>
              <FnPath s={s} f={f} color="var(--fg)" />
              <FnPath s={s} f={(x) => f(a) + sec * (x - a)} color="var(--info)" width={2} dash="6 4" />
              {Number.isFinite(exact) && <FnPath s={s} f={(x) => f(a) + exact * (x - a)} color="var(--accent)" width={2} />}
              <circle cx={s.sx(a + h)} cy={s.sy(f(a + h))} r={5} fill="var(--info)" />
              <DragPoint s={s} x={a} y={f(a)} step={0.05} lockY label="Point of tangency (moves along x)" onChange={(x) => setA(x)} />
            </g>
          )}
        </Plot>
      )}
      <Readouts items={[
        { label: "secant slope (f(a+h) − f(a))/h", value: fmt(sec, 8), note: "dashed blue line" },
        { label: "exact f′(a)", value: fmt(exact, 8), note: "orange tangent" },
        { label: "error", value: fmt(Math.abs(sec - exact), 3), note: "shrinks as h → 0" },
        { label: "f′(x) (symbolic)", value: parsed.d ? <TeX tex={parsed.d.tex} /> : "—" },
      ]} />
      <TextAlternative>
        <DataTable caption={`Difference quotients at a = ${fmt(a)}`} head={["h", "(f(a+h) − f(a))/h", "error vs f′(a)"]} rows={f ? [1, 0.1, 0.01, 0.001, 0.0001].map((hh) => [String(hh), fmt(differenceQuotient(f, a, hh), 10), fmt(Math.abs(differenceQuotient(f, a, hh) - exact), 3)]) : []} />
      </TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Riemann lab
const RIEMANN: Record<string, { src: string; a: number; b: number; exact: number; exactTex: string; view: [number, number, number, number] }> = {
  "x-squared": { src: "x^2", a: 0, b: 2, exact: 8 / 3, exactTex: "\\tfrac{8}{3}", view: [-0.5, 2.5, -0.5, 4.5] },
  sine: { src: "sin(x)", a: 0, b: Math.PI, exact: 2, exactTex: "2", view: [-0.3, 3.5, -0.3, 1.3] },
  "negative-area": { src: "x^3 - 2x", a: -1, b: 2, exact: 0.75, exactTex: "\\tfrac34", view: [-1.5, 2.5, -2, 4.5] },
};
export function RiemannLabSim({ preset }: SimProps) {
  const P = RIEMANN[preset ?? ""] ?? RIEMANN["x-squared"];
  const f = useMemo(() => compileFn(P.src), [P.src]);
  const [n, setN] = useState(6);
  const [rule, setRule] = useState<RiemannRule>("left");
  const { sum, rects } = riemannSum(f, P.a, P.b, n, rule);
  const ref = simpson(f, P.a, P.b, 2000);
  return (
    <Panel>
      <p><TeX tex={`\\int_{${fmt(P.a)}}^{${P.b === Math.PI ? "\\pi" : fmt(P.b)}} ${P.src.replace("^", "^").replace("sin", "\\sin ")}\\,dx = ${P.exactTex}\\ (\\text{exact})`} /></p>
      <div className="flex flex-wrap items-end gap-4">
        <Slider label="rectangles n" value={n} min={1} max={100} step={1} onChange={setN} />
        <Seg label="Rule" value={rule} onChange={(v) => setRule(v as RiemannRule)} options={[{ id: "left", label: "left" }, { id: "right", label: "right" }, { id: "midpoint", label: "midpoint" }, { id: "trapezoid", label: "trapezoid" }]} />
      </div>
      <Plot view={{ xmin: P.view[0], xmax: P.view[1], ymin: P.view[2], ymax: P.view[3] }} label={`${rule} Riemann sum with ${n} rectangles = ${fmt(sum, 6)}`}>
        {(s) => (
          <g>
            {rects.map((r, i) =>
              rule === "trapezoid" ? (
                <polygon key={i} points={`${s.sx(r.x0)},${s.sy(0)} ${s.sx(r.x0)},${s.sy(f(r.x0))} ${s.sx(r.x1)},${s.sy(f(r.x1))} ${s.sx(r.x1)},${s.sy(0)}`} fill={r.height >= 0 ? "color-mix(in srgb, var(--info) 35%, transparent)" : "color-mix(in srgb, var(--bad) 35%, transparent)"} stroke="var(--info)" />
              ) : (
                <rect key={i} x={s.sx(r.x0)} width={s.sx(r.x1) - s.sx(r.x0)} y={s.sy(Math.max(0, r.height))} height={Math.abs(s.sy(0) - s.sy(r.height))} fill={r.height >= 0 ? "color-mix(in srgb, var(--info) 35%, transparent)" : "color-mix(in srgb, var(--bad) 35%, transparent)"} stroke="var(--info)" />
              ),
            )}
            <FnPath s={s} f={f} />
          </g>
        )}
      </Plot>
      <Readouts items={[
        { label: `${rule} sum, n = ${n}`, value: fmt(sum, 8) },
        { label: "exact value", value: fmt(P.exact, 8) },
        { label: "error", value: fmt(sum - P.exact, 3), note: rule === "left" || rule === "right" ? "≈ halves when n doubles (first order)" : "≈ quarters when n doubles (second order)" },
        { label: "Simpson check", value: fmt(ref, 10), note: "independent numerical check" },
      ]} />
      <p className="text-sm text-muted">Red rectangles lie below the axis and count as <strong>negative</strong> area — a definite integral measures <em>signed</em> area.</p>
      <TextAlternative>
        <DataTable head={["n", "left", "right", "midpoint", "trapezoid"]} rows={[4, 8, 16, 32, 64].map((k) => [String(k), ...(["left", "right", "midpoint", "trapezoid"] as RiemannRule[]).map((rl) => fmt(riemannSum(f, P.a, P.b, k, rl).sum, 7))])} />
      </TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Series lab
const SERIES: Record<string, { label: string; term: (n: number) => number; tex: string; limit: number | null; verdict: string; start: number }> = {
  geometric: { label: "geometric ½ⁿ", term: (n) => 0.5 ** n, tex: "\\sum_{n=0}^{\\infty} \\left(\\tfrac12\\right)^n", limit: 2, verdict: "converges to 2 (|r| < 1, sum a/(1−r))", start: 0 },
  harmonic: { label: "harmonic 1/n", term: (n) => 1 / n, tex: "\\sum_{n=1}^{\\infty} \\frac1n", limit: null, verdict: "diverges — terms → 0 but the sum grows like ln n without bound", start: 1 },
  alternating: { label: "alternating (−1)ⁿ⁺¹/n", term: (n) => (n % 2 ? 1 : -1) / n, tex: "\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n}", limit: Math.LN2, verdict: "converges to ln 2 ≈ 0.6931 (alternating series test)", start: 1 },
  "p-series": { label: "p-series 1/n²", term: (n) => 1 / (n * n), tex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^2}", limit: (Math.PI * Math.PI) / 6, verdict: "converges to π²/6 ≈ 1.6449 (p = 2 > 1)", start: 1 },
};
export function SeriesLabSim({ preset }: SimProps) {
  const [key, setKey] = useState(preset && SERIES[preset] ? preset : "geometric");
  const S = SERIES[key];
  const [N, setN] = useState(20);
  const ps = partialSums(S.term, S.start, N);
  const ymax = Math.max(...ps.map((p) => p.sum), S.limit ?? 0) * 1.15 + 0.1;
  const ymin = Math.min(0, ...ps.map((p) => Math.min(p.sum, p.term))) - 0.1;
  return (
    <Panel>
      <Seg label="Series" value={key} onChange={setKey} options={Object.entries(SERIES).map(([id, s]) => ({ id, label: s.label }))} />
      <p><TeX tex={S.tex} /></p>
      <Slider label="number of terms N" value={N} min={1} max={200} step={1} onChange={setN} />
      <Plot view={{ xmin: S.start - 1, xmax: S.start + N, ymin, ymax }} xLabel="n" yLabel="" label={`Partial sums after ${N} terms: ${fmt(ps[ps.length - 1].sum, 6)}`}>
        {(s) => (
          <g>
            {S.limit !== null && <line x1={0} x2={s.W} y1={s.sy(S.limit)} y2={s.sy(S.limit)} stroke="var(--ok)" strokeDasharray="6 4" />}
            {ps.map((p) => <line key={`t${p.n}`} x1={s.sx(p.n)} x2={s.sx(p.n)} y1={s.sy(0)} y2={s.sy(p.term)} stroke="var(--info)" strokeWidth={Math.max(1, 300 / N)} />)}
            <polyline fill="none" stroke="var(--accent)" strokeWidth={2} points={ps.map((p) => `${s.sx(p.n)},${s.sy(p.sum)}`).join(" ")} />
          </g>
        )}
      </Plot>
      <Readouts items={[{ label: `S_${N}`, value: fmt(ps[ps.length - 1].sum, 10) }, { label: "Last term", value: fmt(ps[ps.length - 1].term, 6) }, { label: "Limit", value: S.limit === null ? "none (diverges)" : fmt(S.limit, 10) }, { label: "Error", value: S.limit === null ? "—" : fmt(Math.abs(ps[ps.length - 1].sum - S.limit), 3) }]} />
      <p className="text-sm">{S.verdict}. Blue bars are terms; the orange line is the running total.</p>
      <TextAlternative><DataTable head={["n", "term", "partial sum"]} rows={ps.slice(0, 15).map((p) => [String(p.n), fmt(p.term, 8), fmt(p.sum, 10)])} /></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Matrix transform
const MATRIX_PRESETS: Record<string, number[][]> = { rotation: [[0, -1], [1, 0]], shear: [[1, 1], [0, 1]], reflection: [[1, 0], [0, -1]], singular: [[1, 2], [0.5, 1]], stretch: [[2, 0], [0, 0.5]] };
export function MatrixTransformSim({ preset }: SimProps) {
  const [M, setM] = useState(MATRIX_PRESETS[preset ?? ""] ?? [[1.5, 0.5], [0.5, 1]]);
  const [t, setT] = useState(1);
  const A = [[1 + t * (M[0][0] - 1), t * M[0][1]], [t * M[1][0], 1 + t * (M[1][1] - 1)]];
  const det = linalg.det(M);
  const eig = linalg.eigen2x2(M);
  const set = (i: number, j: number, v: number) => setM((m) => m.map((r, a) => r.map((x, b) => (a === i && b === j ? v : x))));
  const T = (x: number, y: number) => [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y];
  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-line p-2" aria-label="Matrix entries">
          {[0, 1].map((i) => [0, 1].map((j) => (
            <label key={`${i}${j}`} className="text-xs text-muted">a{i + 1}{j + 1}
              <input type="number" step={0.5} value={M[i][j]} onChange={(e) => Number.isFinite(Number(e.target.value)) && set(i, j, Number(e.target.value))} className="ml-1 w-16 rounded border border-line bg-bg px-1 font-mono text-fg" />
            </label>
          )))}
        </div>
        <Seg label="Preset" value="" onChange={(v) => setM(MATRIX_PRESETS[v])} options={Object.keys(MATRIX_PRESETS).map((k) => ({ id: k, label: k }))} />
        <Slider label="animate identity → M" value={t} min={0} max={1} step={0.05} onChange={setT} />
      </div>
      <Plot view={{ xmin: -4, xmax: 4, ymin: -4, ymax: 4 }} equalAspect label={`Grid transformed by the matrix; determinant ${fmt(det)}`}>
        {(s) => (
          <g>
            {Array.from({ length: 9 }, (_, k) => k - 4).map((k) => {
              const [ax, ay] = T(k, -4), [bx, by] = T(k, 4), [cx, cy] = T(-4, k), [dx, dy] = T(4, k);
              return (
                <g key={k} stroke="var(--info)" strokeOpacity={0.35}>
                  <line x1={s.sx(ax)} y1={s.sy(ay)} x2={s.sx(bx)} y2={s.sy(by)} />
                  <line x1={s.sx(cx)} y1={s.sy(cy)} x2={s.sx(dx)} y2={s.sy(dy)} />
                </g>
              );
            })}
            <polygon points={[[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => T(x, y)).map(([x, y]) => `${s.sx(x)},${s.sy(y)}`).join(" ")} fill="color-mix(in srgb, var(--accent) 35%, transparent)" stroke="var(--accent)" />
            {eig.real && t === 1 && eig.vectors.map((v, i) => <line key={i} x1={s.sx(-5 * v[0])} y1={s.sy(-5 * v[1])} x2={s.sx(5 * v[0])} y2={s.sy(5 * v[1])} stroke="var(--warn)" strokeDasharray="6 4" />)}
            <line x1={s.sx(0)} y1={s.sy(0)} x2={s.sx(T(1, 0)[0])} y2={s.sy(T(1, 0)[1])} stroke="var(--ok)" strokeWidth={3} />
            <line x1={s.sx(0)} y1={s.sy(0)} x2={s.sx(T(0, 1)[0])} y2={s.sy(T(0, 1)[1])} stroke="var(--bad)" strokeWidth={3} />
          </g>
        )}
      </Plot>
      <Readouts items={[
        { label: "M", value: <TeX tex={`\\begin{pmatrix}${M[0][0]} & ${M[0][1]}\\\\ ${M[1][0]} & ${M[1][1]}\\end{pmatrix}`} /> },
        { label: "det M = ad − bc", value: fmt(det, 6), note: det === 0 ? "area collapses: not invertible" : det < 0 ? "orientation flipped" : "area scale factor" },
        { label: "î ↦ (green)", value: `(${fmt(M[0][0])}, ${fmt(M[1][0])})`, note: "first column" },
        { label: "ĵ ↦ (red)", value: `(${fmt(M[0][1])}, ${fmt(M[1][1])})`, note: "second column" },
        { label: "eigenvalues", value: eig.real ? eig.values.map((v) => fmt(v, 5)).join(", ") : `${fmt(eig.re, 4)} ± ${fmt(eig.im, 4)}i`, note: eig.real ? "dashed lines: eigenvector directions" : "complex: no real invariant direction (rotation)" },
      ]} />
      <TextAlternative><p>The unit square (orange) maps to a parallelogram with area |det M| = {fmt(Math.abs(det))}. The columns of M are where the basis vectors î and ĵ land.</p></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Vector lab
export function VectorLabSim({ preset }: SimProps) {
  const init = preset === "perpendicular" ? [[3, 1], [-1, 3]] : preset === "parallel" ? [[2, 1], [4, 2]] : preset === "obtuse" ? [[3, 1], [-3, 1]] : [[3, 1], [1, 2]];
  const [u, setU] = useState(init[0]);
  const [v, setV] = useState(init[1]);
  const d = linalg.dot(u, v);
  const nu = linalg.norm(u), nv = linalg.norm(v);
  const ang = nu && nv ? (linalg.angleBetween(u, v) * 180) / Math.PI : NaN;
  const proj = nv ? linalg.projection(u, v) : [0, 0];
  const sum = [u[0] + v[0], u[1] + v[1]];
  return (
    <Panel>
      <Plot view={{ xmin: -6, xmax: 6, ymin: -5, ymax: 5 }} equalAspect label={`Vectors a = (${u}) and b = (${v}); dot product ${fmt(d)}`}>
        {(s) => (
          <g strokeWidth={3}>
            <defs>{["accent", "info", "ok"].map((c) => <marker key={c} id={`vh-${c}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={`var(--${c})`} /></marker>)}</defs>
            <line x1={s.sx(u[0])} y1={s.sy(u[1])} x2={s.sx(sum[0])} y2={s.sy(sum[1])} stroke="var(--info)" strokeOpacity={0.4} strokeDasharray="5 4" />
            <line x1={s.sx(0)} y1={s.sy(0)} x2={s.sx(sum[0])} y2={s.sy(sum[1])} stroke="var(--ok)" markerEnd="url(#vh-ok)" />
            <line x1={s.sx(0)} y1={s.sy(0)} x2={s.sx(proj[0])} y2={s.sy(proj[1])} stroke="var(--warn)" strokeWidth={6} strokeOpacity={0.6} />
            <line x1={s.sx(u[0])} y1={s.sy(u[1])} x2={s.sx(proj[0])} y2={s.sy(proj[1])} stroke="var(--muted)" strokeWidth={1} strokeDasharray="3 3" />
            <line x1={s.sx(0)} y1={s.sy(0)} x2={s.sx(u[0])} y2={s.sy(u[1])} stroke="var(--accent)" markerEnd="url(#vh-accent)" />
            <line x1={s.sx(0)} y1={s.sy(0)} x2={s.sx(v[0])} y2={s.sy(v[1])} stroke="var(--info)" markerEnd="url(#vh-info)" />
            <DragPoint s={s} x={u[0]} y={u[1]} label="Tip of vector a" onChange={(x, y) => setU([x, y])} r={7} />
            <DragPoint s={s} x={v[0]} y={v[1]} label="Tip of vector b" color="var(--info)" onChange={(x, y) => setV([x, y])} r={7} />
          </g>
        )}
      </Plot>
      <Readouts items={[
        { label: "a, b", value: `(${u.join(", ")}), (${v.join(", ")})` },
        { label: "a + b (green)", value: `(${sum.join(", ")})` },
        { label: "a · b", value: `${u[0]}·${v[0]} + ${u[1]}·${v[1]} = ${fmt(d)}`, note: d === 0 ? "perpendicular" : d > 0 ? "acute angle" : "obtuse angle" },
        { label: "|a|, |b|", value: `${fmt(nu, 5)}, ${fmt(nv, 5)}` },
        { label: "angle θ", value: Number.isFinite(ang) ? `${fmt(ang, 5)}°` : "undefined (zero vector)", note: "cos θ = a·b / (|a||b|)" },
        { label: "projection of a on b (yellow)", value: `(${fmt(proj[0], 4)}, ${fmt(proj[1], 4)})` },
      ]} />
      <TextAlternative><p>a = ({u.join(", ")}), b = ({v.join(", ")}). a·b = {fmt(d)}; angle {fmt(ang, 4)}°.</p></TextAlternative>
    </Panel>
  );
}
