"use client";
import { useMemo, useState } from "react";
import { fmt, mod, solveLinearCongruence, truthTable, equivalentProps, propToString, union, intersection, difference, complement, permutations, combinations, enumeratePermutations, enumerateCombinations, factorial } from "@mcc/math-engine";
import { Plot, FnPath, DragPoint, Slider, NumberField, Readouts, TextAlternative, DataTable, Seg, Panel } from "../kit";
import { TeX } from "../tex";
import type { SimProps } from "./foundation";

// ---------------------------------------------------------------- Unit circle
const EXACT: Record<number, [string, string]> = { 0: ["0", "1"], 30: ["\\tfrac12", "\\tfrac{\\sqrt3}{2}"], 45: ["\\tfrac{\\sqrt2}{2}", "\\tfrac{\\sqrt2}{2}"], 60: ["\\tfrac{\\sqrt3}{2}", "\\tfrac12"], 90: ["1", "0"] };
function exactTrig(deg: number): [string, string] | null {
  const d = ((deg % 360) + 360) % 360;
  const ref = d <= 90 ? d : d <= 180 ? 180 - d : d <= 270 ? d - 180 : 360 - d;
  const e = EXACT[ref];
  if (!e) return null;
  const sSign = d > 180 && d < 360 ? -1 : 1;
  const cSign = d > 90 && d < 270 ? -1 : 1;
  const sg = (v: string, s: number) => (v === "0" ? "0" : s < 0 ? `-${v}` : v);
  return [sg(e[0], sSign), sg(e[1], cSign)];
}
function radTex(deg: number) {
  if (deg === 0) return "0";
  const g = gcdI(Math.abs(deg), 180);
  const n = deg / g, d = 180 / g;
  const num = `${n === 1 ? "" : n}\\pi`;
  return d === 1 ? num : `\\frac{${num}}{${d}}`;
}
const gcdI = (a: number, b: number): number => (b ? gcdI(b, a % b) : a || 1);

export function UnitCircleSim({ preset }: SimProps) {
  const [deg, setDeg] = useState(preset === "135" ? 135 : preset === "240" ? 240 : 30);
  const t = (deg * Math.PI) / 180;
  const x = Math.cos(t), y = Math.sin(t);
  const ex = exactTrig(deg);
  return (
    <Panel>
      <Slider label="Angle θ" value={deg} min={0} max={360} step={5} onChange={setDeg} format={(v) => `${v}°`} />
      <div className="grid gap-3 lg:grid-cols-2">
        <Plot view={{ xmin: -1.4, xmax: 1.4, ymin: -1.4, ymax: 1.4 }} width={420} height={420} equalAspect label={`Unit circle at ${deg} degrees: cos = ${fmt(x, 4)}, sin = ${fmt(y, 4)}`}>
          {(s) => (
            <g>
              <circle cx={s.sx(0)} cy={s.sy(0)} r={s.sx(1) - s.sx(0)} fill="none" stroke="var(--muted)" strokeWidth={1.5} />
              <path d={`M ${s.sx(0.25)} ${s.sy(0)} A ${s.sx(0.25) - s.sx(0)} ${s.sx(0.25) - s.sx(0)} 0 ${deg > 180 ? 1 : 0} 0 ${s.sx(0.25 * x)} ${s.sy(0.25 * y)}`} fill="none" stroke="var(--warn)" strokeWidth={2} />
              <line x1={s.sx(0)} y1={s.sy(0)} x2={s.sx(x)} y2={s.sy(y)} stroke="var(--fg)" strokeWidth={2} />
              <line x1={s.sx(x)} y1={s.sy(0)} x2={s.sx(x)} y2={s.sy(y)} stroke="var(--ok)" strokeWidth={3} />
              <line x1={s.sx(0)} y1={s.sy(0)} x2={s.sx(x)} y2={s.sy(0)} stroke="var(--info)" strokeWidth={3} />
              <DragPoint s={s} x={x} y={y} step={0.001} label="Point on the unit circle" onChange={(px, py) => setDeg(Math.round((((Math.atan2(py, px) * 180) / Math.PI + 360) % 360) / 5) * 5)} />
              <text x={s.sx(x / 2)} y={s.sy(0) + (y >= 0 ? 16 : -6)} fill="var(--info)" fontSize={13} textAnchor="middle">cos θ</text>
              <text x={s.sx(x) + (x >= 0 ? 6 : -6)} y={s.sy(y / 2)} fill="var(--ok)" fontSize={13} textAnchor={x >= 0 ? "start" : "end"}>sin θ</text>
            </g>
          )}
        </Plot>
        <Plot view={{ xmin: 0, xmax: 2 * Math.PI, ymin: -1.3, ymax: 1.3 }} width={560} height={300} piTicks xLabel="θ" label="Graphs of sine and cosine with the current angle marked">
          {(s) => (
            <g>
              <FnPath s={s} f={Math.sin} color="var(--ok)" />
              <FnPath s={s} f={Math.cos} color="var(--info)" dash="6 4" />
              <line x1={s.sx(t)} x2={s.sx(t)} y1={0} y2={s.H} stroke="var(--muted)" strokeDasharray="3 3" />
              <circle cx={s.sx(t)} cy={s.sy(y)} r={5} fill="var(--ok)" />
              <circle cx={s.sx(t)} cy={s.sy(x)} r={5} fill="var(--info)" />
            </g>
          )}
        </Plot>
      </div>
      <Readouts items={[
        { label: "Degrees → radians", value: <TeX tex={`${deg}^\\circ = ${radTex(deg)} \\approx ${fmt(t, 5)}`} /> },
        { label: "cos θ (x-coordinate)", value: ex ? <TeX tex={`${ex[1]} \\approx ${fmt(x, 5)}`} /> : fmt(x, 6) },
        { label: "sin θ (y-coordinate)", value: ex ? <TeX tex={`${ex[0]} \\approx ${fmt(y, 5)}`} /> : fmt(y, 6) },
        { label: "tan θ = sin/cos", value: Math.abs(x) < 1e-12 ? "undefined (cos θ = 0)" : fmt(y / x, 6) },
        { label: "Quadrant", value: deg % 90 === 0 ? "on an axis" : ["I", "II", "III", "IV"][Math.floor((deg % 360) / 90)] },
        { label: "Check", value: `sin²θ + cos²θ = ${fmt(x * x + y * y, 10)}` },
      ]} />
      <TextAlternative><p>At θ = {deg}° the point on the unit circle is ({fmt(x, 4)}, {fmt(y, 4)}): cos θ is the horizontal coordinate and sin θ the vertical one.</p></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Venn studio
type Region = "A" | "B" | "AB" | "U";
export function VennStudioSim({ preset }: SimProps) {
  const U = Array.from({ length: 16 }, (_, i) => i + 1);
  const initial: Record<number, Region> = {};
  U.forEach((n) => {
    if (preset === "disjoint") initial[n] = n <= 4 ? "A" : n >= 12 ? "B" : "U";
    else if (preset === "subset") initial[n] = n % 4 === 0 ? "AB" : n % 2 === 0 ? "B" : "U";
    else initial[n] = n % 2 === 0 && [2, 3, 5, 7, 11, 13].includes(n) ? "AB" : n % 2 === 0 ? "A" : [3, 5, 7, 11, 13].includes(n) ? "B" : "U"; // A = evens, B = primes (lecture-style)
  });
  const [where, setWhere] = useState(initial);
  const [view, setView] = useState("union");
  const A = U.filter((n) => where[n] === "A" || where[n] === "AB");
  const B = U.filter((n) => where[n] === "B" || where[n] === "AB");
  const result = view === "union" ? union(A, B) : view === "inter" ? intersection(A, B) : view === "diff" ? difference(A, B) : view === "comp" ? complement(A, U) : difference(union(A, B), intersection(A, B));
  const sym = { union: "A \\cup B", inter: "A \\cap B", diff: "A - B", comp: "A^c", sym: "A \\triangle B" }[view]!;
  const shade = (r: Region) => (view === "union" ? r !== "U" : view === "inter" ? r === "AB" : view === "diff" ? r === "A" : view === "comp" ? r === "B" || r === "U" : r === "A" || r === "B");
  const cycle: Region[] = ["U", "A", "AB", "B"];
  const pos: Record<Region, [number, number]> = { A: [150, 150], AB: [250, 150], B: [350, 150], U: [60, 40] };
  const byRegion = (r: Region) => U.filter((n) => where[n] === r);
  return (
    <Panel>
      <Seg label="Operation" value={view} onChange={setView} options={[{ id: "union", label: "A ∪ B" }, { id: "inter", label: "A ∩ B" }, { id: "diff", label: "A − B" }, { id: "comp", label: "Aᶜ" }, { id: "sym", label: "A △ B" }]} />
      <svg viewBox="0 0 500 300" className="h-auto w-full rounded-lg border border-line bg-bg" role="group" aria-label={`Venn diagram; ${sym.replace(/\\/g, "")} has ${result.length} elements`}>
        <defs>
          <clipPath id="vA"><circle cx={190} cy={150} r={110} /></clipPath>
          <clipPath id="vB"><circle cx={310} cy={150} r={110} /></clipPath>
        </defs>
        <rect x={5} y={5} width={490} height={290} rx={8} fill={shade("U") ? "color-mix(in srgb, var(--accent) 30%, transparent)" : "none"} stroke="var(--muted)" />
        <circle cx={190} cy={150} r={110} fill={shade("A") ? "color-mix(in srgb, var(--accent) 45%, var(--bg))" : "var(--bg)"} />
        <circle cx={310} cy={150} r={110} fill={shade("B") ? "color-mix(in srgb, var(--accent) 45%, var(--bg))" : "var(--bg)"} />
        <g clipPath="url(#vA)"><circle cx={310} cy={150} r={110} fill={shade("AB") ? "color-mix(in srgb, var(--accent) 70%, var(--bg))" : "var(--bg)"} /></g>
        <circle cx={190} cy={150} r={110} fill="none" stroke="var(--fg)" />
        <circle cx={310} cy={150} r={110} fill="none" stroke="var(--fg)" />
        <text x={110} y={60} fill="var(--fg)" fontWeight={700}>A</text>
        <text x={380} y={60} fill="var(--fg)" fontWeight={700}>B</text>
        <text x={20} y={28} fill="var(--muted)" fontSize={12}>U = {"{1,…,16}"}</text>
        {(["A", "AB", "B", "U"] as Region[]).map((r) =>
          byRegion(r).map((n, i) => {
            const [cx, cy] = pos[r];
            const cols = r === "U" ? 8 : r === "AB" ? 2 : 3;
            const x = r === "U" ? 30 + (i % 16) * 28 : cx - (cols - 1) * 15 + (i % cols) * 30;
            const y = r === "U" ? (i < 16 ? 280 : 260) : cy - 40 + Math.floor(i / cols) * 28;
            return (
              <g key={n} role="button" tabIndex={0} aria-label={`Element ${n}, in region ${r === "U" ? "outside A and B" : r === "AB" ? "A and B" : `only ${r}`}. Press to move.`} style={{ cursor: "pointer" }}
                onClick={() => setWhere((w) => ({ ...w, [n]: cycle[(cycle.indexOf(w[n]) + 1) % 4] }))}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setWhere((w) => ({ ...w, [n]: cycle[(cycle.indexOf(w[n]) + 1) % 4] })); } }}>
                <circle cx={x} cy={y} r={12} fill="var(--card-2)" stroke={result.includes(n) ? "var(--accent)" : "var(--line)"} strokeWidth={2} />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fill="var(--fg)">{n}</text>
              </g>
            );
          }),
        )}
      </svg>
      <p className="text-sm text-muted">Click (or Enter on) an element to move it: outside → only A → A and B → only B.</p>
      <Readouts items={[
        { label: "A", value: `{${A.join(", ")}}` },
        { label: "B", value: `{${B.join(", ")}}` },
        { label: <TeX tex={sym} />, value: `{${result.sort((a, b) => a - b).join(", ")}}`, note: `${result.length} elements` },
        { label: "Check n(A∪B)", value: `${A.length} + ${B.length} − ${intersection(A, B).length} = ${union(A, B).length}` },
      ]} />
      <TextAlternative><p>A = {"{"}{A.join(", ")}{"}"}, B = {"{"}{B.join(", ")}{"}"}. The selected set has elements {"{"}{result.join(", ")}{"}"}.</p></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Truth tables
export function TruthTableSim({ preset }: SimProps) {
  const init = preset === "contrapositive" ? ["P -> Q", "~Q -> ~P"] : preset === "de-morgan" ? ["~(P & Q)", "~P | ~Q"] : ["P -> Q", "~P | Q"];
  const [f, setF] = useState(init[0]);
  const [g, setG] = useState(init[1]);
  const res = useMemo(() => {
    try {
      const tf = truthTable(f);
      let tg: ReturnType<typeof truthTable> | null = null;
      let eq: boolean | null = null;
      if (g.trim()) {
        tg = truthTable(g, tf.vars);
        const tf2 = truthTable(f, tg.vars);
        eq = equivalentProps(f, g);
        return { tf: tf2, tg, eq, err: null };
      }
      return { tf, tg, eq, err: null };
    } catch (e) {
      return { err: (e as Error).message, tf: null, tg: null, eq: null };
    }
  }, [f, g]);
  return (
    <Panel>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm text-muted">Formula 1<input value={f} onChange={(e) => setF(e.target.value)} className="mt-1 w-full rounded-md border border-line bg-bg px-2 py-1 font-mono text-fg" spellCheck={false} /></label>
        <label className="text-sm text-muted">Formula 2 (optional, to compare)<input value={g} onChange={(e) => setG(e.target.value)} className="mt-1 w-full rounded-md border border-line bg-bg px-2 py-1 font-mono text-fg" spellCheck={false} /></label>
      </div>
      <p className="text-xs text-muted">Letters P, Q, R, S… · not: ~ · and: &amp; · or: | · implies: -&gt; · iff: &lt;-&gt; · xor: xor · constants T, F</p>
      {res.err && <p role="alert" className="text-warn">{res.err}</p>}
      {res.tf && (
        <div className="overflow-x-auto">
          <table className="border-collapse font-mono text-sm">
            <caption className="mb-2 text-left font-sans text-muted">Rows ordered with T before F; first letter changes slowest.</caption>
            <thead>
              <tr>
                {res.tf.vars.map((v) => <th key={v} scope="col" className="border border-line px-3 py-1">{v}</th>)}
                <th scope="col" className="border border-line bg-card-2 px-3 py-1">{propToString(res.tf.ast)}</th>
                {res.tg && <th scope="col" className="border border-line bg-card-2 px-3 py-1">{propToString(res.tg.ast)}</th>}
              </tr>
            </thead>
            <tbody>
              {res.tf.rows.map((r, i) => (
                <tr key={i}>
                  {res.tf!.vars.map((v) => <td key={v} className="border border-line px-3 py-1 text-center">{r.env[v] ? "T" : "F"}</td>)}
                  <td className={`border border-line px-3 py-1 text-center font-bold ${r.value ? "text-ok" : "text-bad"}`}>{r.value ? "T" : "F"}</td>
                  {res.tg && <td className={`border border-line px-3 py-1 text-center font-bold ${res.tg.rows[i].value ? "text-ok" : "text-bad"} ${res.tg.rows[i].value !== r.value ? "bg-bad/15" : ""}`}>{res.tg.rows[i].value ? "T" : "F"}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {res.tf && (
        <Readouts items={[
          { label: "Formula 1 is", value: res.tf.tautology ? "a tautology (always T)" : res.tf.contradiction ? "a contradiction (always F)" : "a contingency" },
          ...(res.eq !== null ? [{ label: "Equivalent?", value: res.eq ? "✓ yes — identical columns" : "✗ no — rows differ (highlighted)" }] : []),
        ]} />
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------- Modular clock
export function ModularClockSim({ preset }: SimProps) {
  const [m, setM] = useState(preset === "mod-4" ? 4 : preset === "mod-17" ? 17 : 12);
  const [a, setA] = useState(preset === "mod-17" ? 7 : 17);
  const [step, setStep] = useState(preset === "mod-17" ? 7 : 5);
  const [b, setB] = useState(11);
  const r = mod(a, m);
  const sols = solveLinearCongruence(step, b, m);
  const R = 120, C = 150;
  const pt = (k: number) => [C + R * Math.sin((2 * Math.PI * k) / m), C - R * Math.cos((2 * Math.PI * k) / m)];
  const visits = Array.from({ length: m + 1 }, (_, i) => mod(i * step, m));
  return (
    <Panel>
      <div className="flex flex-wrap items-end gap-4">
        <Slider label="Modulus m" value={m} min={2} max={24} step={1} onChange={setM} />
        <NumberField label="Number a" value={a} min={-999} max={9999} onChange={setA} />
        <NumberField label="Step size (a in ax ≡ b)" value={step} min={1} max={50} onChange={setStep} />
        <NumberField label="Target b" value={b} min={0} max={99} onChange={setB} />
      </div>
      <div className="grid gap-4 md:grid-cols-[300px_1fr]">
        <svg viewBox="0 0 300 300" className="w-full max-w-[300px] rounded-lg border border-line bg-bg" role="img" aria-label={`${a} lands on ${r} on a clock of size ${m}`}>
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--muted)" />
          {visits.slice(0, -1).map((v, i) => {
            const [x1, y1] = pt(v), [x2, y2] = pt(visits[i + 1]);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--info)" strokeOpacity={0.5} />;
          })}
          {Array.from({ length: m }, (_, k) => {
            const [x, y] = pt(k);
            return (
              <g key={k}>
                <circle cx={x} cy={y} r={13} fill={k === r ? "var(--accent)" : k === mod(b, m) ? "var(--ok)" : "var(--card-2)"} stroke="var(--line)" />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fill={k === r ? "var(--accent-fg)" : "var(--fg)"}>{k}</text>
              </g>
            );
          })}
          <line x1={C} y1={C} x2={pt(r)[0]} y2={pt(r)[1]} stroke="var(--accent)" strokeWidth={3} />
        </svg>
        <div className="space-y-2 text-sm">
          <p><TeX tex={`${a} = ${Math.floor(a / m)}\\times ${m} + ${r}\\quad\\Rightarrow\\quad ${a} \\equiv ${r} \\pmod{${m}}`} /></p>
          <p className="text-muted">Numbers in the same class as {r}: {[-2, -1, 0, 1, 2, 3].map((k) => r + k * m).join(", ")}, … (they differ by multiples of {m}).</p>
          <p>Stepping by {step} from 0 visits: {[...new Set(visits)].sort((x, y) => x - y).join(", ")} {new Set(visits).size === m ? "(every class — gcd(step, m) = 1)" : `(only ${new Set(visits).size} classes — gcd(${step}, ${m}) > 1)`}</p>
          <p><TeX tex={`${step}x \\equiv ${b} \\pmod{${m}}`} />: {sols.length ? `x = ${sols.join(", ")}` : "no solution (gcd doesn't divide b)"}</p>
        </div>
      </div>
      <Readouts items={[{ label: `${a} mod ${m}`, value: r }, { label: "Solutions of ax ≡ b", value: sols.length ? sols.join(", ") : "none" }, { label: "Check", value: sols.length ? `${step}×${sols[0]} = ${step * sols[0]} ≡ ${mod(step * sols[0], m)}` : "—" }]} />
      <TextAlternative><p>On a clock with {m} positions (0 to {m - 1}), the number {a} lands on {r}. The congruence {step}x ≡ {b} (mod {m}) has solutions {sols.join(", ") || "none"}.</p></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Counting lab
export function CountingLabSim({ preset }: SimProps) {
  const [n, setN] = useState(preset === "committee" ? 5 : 4);
  const [r, setR] = useState(preset === "committee" ? 3 : 2);
  const [ordered, setOrdered] = useState(preset !== "committee");
  const items = "ABCDEFG".slice(0, n).split("");
  const rr = Math.min(r, n);
  const list = useMemo(() => (ordered ? enumeratePermutations(items, rr) : enumerateCombinations(items, rr)), [n, rr, ordered]); // eslint-disable-line react-hooks/exhaustive-deps
  const count = ordered ? permutations(n, rr) : combinations(n, rr);
  return (
    <Panel>
      <div className="flex flex-wrap items-end gap-4">
        <Slider label="n objects" value={n} min={1} max={7} step={1} onChange={(v) => { setN(v); if (r > v) setR(v); }} />
        <Slider label="choose r" value={rr} min={0} max={n} step={1} onChange={setR} />
        <Seg label="Does order matter?" value={ordered ? "yes" : "no"} onChange={(v) => setOrdered(v === "yes")} options={[{ id: "yes", label: "order matters (nPr)" }, { id: "no", label: "order doesn't matter (nCr)" }]} />
      </div>
      <p className="text-lg">{ordered
        ? <TeX tex={`{}^{${n}}P_{${rr}} = \\frac{${n}!}{(${n}-${rr})!} = ${Array.from({ length: rr }, (_, i) => n - i).join("\\times") || "1"} = ${count}`} />
        : <TeX tex={`\\binom{${n}}{${rr}} = \\frac{${n}!}{${rr}!\\,(${n}-${rr})!} = \\frac{${permutations(n, rr)}}{${factorial(rr)}} = ${count}`} />}</p>
      <div className="max-h-64 overflow-y-auto rounded-lg border border-line bg-bg p-2" aria-label={`All ${count} ${ordered ? "arrangements" : "selections"}`}>
        <ul className="flex flex-wrap gap-1 font-mono text-sm">
          {list.slice(0, 840).map((l, i) => <li key={i} className="rounded bg-card-2 px-2 py-0.5">{l.join("") || "∅"}</li>)}
        </ul>
      </div>
      {!ordered && rr > 1 && <p className="text-sm text-muted">Each group above appears {factorial(rr)} times among the ordered arrangements (its {rr}! internal orders) — that is why we divide by {rr}!.</p>}
      <Readouts items={[{ label: ordered ? "nPr" : "nCr", value: count }, { label: "Listed", value: list.length }, { label: "Ordered / unordered", value: `${permutations(n, rr)} / ${combinations(n, rr)}` }]} />
    </Panel>
  );
}

