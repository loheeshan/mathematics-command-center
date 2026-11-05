"use client";
import { useMemo, useState } from "react";
import { Rational, lcm, fmt, gcd, compileFn, ExpressionError, toTex } from "@mcc/math-engine";
import { Plot, FnPath, DragPoint, Slider, NumberField, Readouts, TextAlternative, DataTable, Seg, Panel } from "../kit";
import { TeX } from "../tex";

export interface SimProps {
  preset?: string;
}

// ---------------------------------------------------------------- Number line
export function NumberLineSim({ preset }: SimProps) {
  const init = preset === "subtract-negative" ? { a: 3, b: -5, op: "-" } : preset === "fractions" ? { a: -1.5, b: 2.25, op: "+" } : { a: 4, b: -7, op: "+" };
  const [a, setA] = useState(init.a);
  const [b, setB] = useState(init.b);
  const [op, setOp] = useState<string>(init.op);
  const step = preset === "fractions" ? 0.25 : 1;
  const move = op === "+" ? b : -b;
  const result = a + move;
  const lo = -12, hi = 12;
  return (
    <Panel>
      <div className="flex flex-wrap items-end gap-4">
        <Slider label="Start a" value={a} min={-10} max={10} step={step} onChange={setA} />
        <Seg label="Operation" value={op} onChange={setOp} options={[{ id: "+", label: "add +" }, { id: "-", label: "subtract −" }]} />
        <Slider label="b" value={b} min={-10} max={10} step={step} onChange={setB} />
      </div>
      <Plot view={{ xmin: lo, xmax: hi, ymin: -2, ymax: 3 }} height={200} label={`Number line: start at ${a}, ${op === "+" ? "add" : "subtract"} ${b}, land on ${result}`} yLabel="">
        {(s) => (
          <g>
            <line x1={s.sx(lo)} x2={s.sx(hi)} y1={s.sy(0)} y2={s.sy(0)} stroke="var(--fg)" strokeWidth={2} />
            {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((n) => (
              <g key={n}>
                <line x1={s.sx(n)} x2={s.sx(n)} y1={s.sy(0) - 6} y2={s.sy(0) + 6} stroke="var(--fg)" />
                <text x={s.sx(n)} y={s.sy(0) + 22} textAnchor="middle" fontSize={12} fill={n === 0 ? "var(--fg)" : "var(--muted)"} fontWeight={n === 0 ? 700 : 400}>{n}</text>
              </g>
            ))}
            <defs>
              <marker id="nl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
            </defs>
            <path d={`M ${s.sx(a)} ${s.sy(0.4)} Q ${s.sx(a + move / 2)} ${s.sy(2.4)} ${s.sx(result)} ${s.sy(0.4)}`} fill="none" stroke="var(--accent)" strokeWidth={3} markerEnd="url(#nl-arrow)" />
            <text x={s.sx(a + move / 2)} y={s.sy(1.7)} textAnchor="middle" fill="var(--accent)" fontSize={13}>{move >= 0 ? `${fmt(Math.abs(move))} right` : `${fmt(Math.abs(move))} left`}</text>
            <circle cx={s.sx(a)} cy={s.sy(0)} r={7} fill="var(--info)" />
            <circle cx={s.sx(result)} cy={s.sy(0)} r={8} fill="var(--accent)" stroke="var(--bg)" strokeWidth={2} />
          </g>
        )}
      </Plot>
      <Readouts items={[
        { label: "Expression", value: `${fmt(a)} ${op} ${b < 0 ? `(${fmt(b)})` : fmt(b)}` },
        { label: "Same as", value: `${fmt(a)} + (${fmt(move)})`, note: op === "-" ? "subtracting = adding the opposite" : undefined },
        { label: "Result", value: fmt(result) },
        { label: "Distance from 0", value: `|${fmt(result)}| = ${fmt(Math.abs(result))}` },
      ]} />
      <TextAlternative>
        <p>Start at {fmt(a)} (blue dot). {op === "+" ? "Adding" : "Subtracting"} {fmt(b)} moves {fmt(Math.abs(move))} unit(s) to the {move >= 0 ? "right" : "left"}, landing at {fmt(result)} (orange dot).</p>
      </TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Fraction kitchen
function Bar({ n, d, unit, label, color, y, width, x0 = 0, maxWholes }: { n: number; d: number; unit: number; label: string; color: string; y: number; width: number; x0?: number; maxWholes: number }) {
  // draws |n|/d of a whole of `width` px, cut into pieces of 1/unit (unit = d or common denominator)
  const pieces = Math.abs(n) * (unit / d);
  const wholes = Math.max(1, Math.ceil(Math.abs(n) / d));
  const pw = width / unit;
  return (
    <g aria-label={label}>
      {Array.from({ length: Math.min(maxWholes, wholes) }, (_, w) => (
        <rect key={`w${w}`} x={x0 + w * (width + 12)} y={y} width={width} height={34} fill="none" stroke="var(--muted)" strokeWidth={1.5} rx={4} />
      ))}
      {Array.from({ length: pieces }, (_, i) => {
        const w = Math.floor(i / unit);
        const k = i % unit;
        return <rect key={i} x={x0 + w * (width + 12) + k * pw} y={y} width={pw} height={34} fill={color} stroke="var(--bg)" strokeWidth={1.5} />;
      })}
      {Array.from({ length: Math.min(maxWholes, wholes) }, (_, w) =>
        Array.from({ length: unit - 1 }, (_, k) => <line key={`c${w}-${k}`} x1={x0 + w * (width + 12) + (k + 1) * pw} x2={x0 + w * (width + 12) + (k + 1) * pw} y1={y} y2={y + 34} stroke="var(--muted)" strokeWidth={1} strokeDasharray="3 3" />),
      )}
    </g>
  );
}

export function FractionKitchenSim({ preset }: SimProps) {
  const init = preset === "three-quarters-plus-half" ? [3, 4, 1, 2] : preset === "equivalent" ? [2, 3, 4, 6] : [1, 2, 1, 3];
  const [n1, setN1] = useState(init[0]);
  const [d1, setD1] = useState(init[1]);
  const [n2, setN2] = useState(init[2]);
  const [d2, setD2] = useState(init[3]);
  const [recut, setRecut] = useState(false);
  const [sub, setSub] = useState(false);
  const L = lcm(d1, d2);
  const a = new Rational(n1, d1);
  const b = new Rational(n2, d2);
  const total = sub ? a.sub(b) : a.add(b);
  const unit1 = recut ? L : d1;
  const unit2 = recut ? L : d2;
  const W = 220;
  const naive = new Rational(n1 + n2, d1 + d2);
  return (
    <Panel>
      <div className="flex flex-wrap items-end gap-3">
        <NumberField label="top 1" value={n1} min={0} max={12} onChange={setN1} width="w-16" />
        <NumberField label="bottom 1" value={d1} min={1} max={12} onChange={(v) => setD1(Math.max(1, v))} width="w-16" />
        <Seg label="Operation" value={sub ? "-" : "+"} onChange={(v) => setSub(v === "-")} options={[{ id: "+", label: "+" }, { id: "-", label: "−" }]} />
        <NumberField label="top 2" value={n2} min={0} max={12} onChange={setN2} width="w-16" />
        <NumberField label="bottom 2" value={d2} min={1} max={12} onChange={(v) => setD2(Math.max(1, v))} width="w-16" />
        <button type="button" onClick={() => setRecut((r) => !r)} className="rounded-lg bg-accent px-3 py-2 font-semibold text-accent-fg" aria-pressed={recut}>
          {recut ? "Show original cuts" : `Re-cut to common denominator (${L})`}
        </button>
      </div>
      <svg viewBox={`0 0 ${3 * (W + 12) + 20} 210`} className="h-auto w-full rounded-lg border border-line bg-bg" role="img" aria-label={`${n1}/${d1} ${sub ? "minus" : "plus"} ${n2}/${d2} equals ${total.toString()}`}>
        <text x={10} y={22} fill="var(--muted)" fontSize={13}>{`${n1}/${d1}${recut ? ` = ${n1 * (L / d1)}/${L}` : ""}`}</text>
        <Bar n={n1} d={d1} unit={unit1} label="first fraction" color="var(--accent)" y={30} width={W} x0={10} maxWholes={3} />
        <text x={10} y={92} fill="var(--muted)" fontSize={13}>{`${sub ? "−" : "+"} ${n2}/${d2}${recut ? ` = ${n2 * (L / d2)}/${L}` : ""}`}</text>
        <Bar n={n2} d={d2} unit={unit2} label="second fraction" color="var(--info)" y={100} width={W} x0={10} maxWholes={3} />
        <text x={10} y={162} fill="var(--fg)" fontSize={13} fontWeight={700}>{`= ${total.toString()}${Math.abs(total.n) > total.d ? `  (${total.toMixedString()})` : ""}`}</text>
        {recut && total.compare(0) >= 0 && <Bar n={total.n * (L / total.d)} d={L} unit={L} label="total" color="var(--ok)" y={170} width={W} x0={10} maxWholes={3} />}
        {!recut && <text x={10} y={190} fill="var(--muted)" fontSize={12}>Pieces of different sizes can’t be counted together yet — press “Re-cut”.</text>}
        {recut && total.compare(0) < 0 && <text x={10} y={190} fill="var(--warn)" fontSize={12}>The result is negative: you removed more than you had.</text>}
      </svg>
      <Readouts items={[
        { label: "Common denominator", value: `lcm(${d1}, ${d2}) = ${L}` },
        { label: "Rewritten", value: `${n1 * (L / d1)}/${L} ${sub ? "−" : "+"} ${n2 * (L / d2)}/${L}` },
        { label: "Exact result", value: total.toString(), note: Math.abs(total.n) > total.d ? `mixed: ${total.toMixedString()}` : total.d !== 1 && gcd(Math.abs(n1 * (L / d1) + (sub ? -1 : 1) * n2 * (L / d2)), L) > 1 ? "simplified" : undefined },
        { label: "Decimal", value: fmt(total.toNumber(), 6), note: total.terminates() ? "exact" : "approximation (repeats forever)" },
      ]} />
      {!sub && d1 !== d2 && n1 + n2 > 0 && (
        <p className="text-sm text-muted">Common mistake: adding tops and bottoms gives {naive.toString()} ≈ {fmt(naive.toNumber(), 4)}, but the true sum is {fmt(total.toNumber(), 4)}. {naive.compare(a) < 0 ? `It's even smaller than ${n1}/${d1} alone!` : ""}</p>
      )}
      <TextAlternative>
        <DataTable head={["", "fraction", `in ${L}ths`, "decimal"]} rows={[["first", `${n1}/${d1}`, `${n1 * (L / d1)}/${L}`, fmt(a.toNumber(), 6)], ["second", `${sub ? "−" : "+"}${n2}/${d2}`, `${n2 * (L / d2)}/${L}`, fmt(b.toNumber(), 6)], ["result", total.toString(), `${total.n * (L / total.d)}/${L}`, fmt(total.toNumber(), 6)]]} />
      </TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Percent grid
export function PercentGridSim({ preset }: SimProps) {
  const [p, setP] = useState(preset === "quarter" ? 25 : preset === "increase" ? 15 : 30);
  const [price, setPrice] = useState(preset === "quarter" ? 2000 : 4500);
  const [mode, setMode] = useState(preset === "increase" ? "increase" : "discount");
  const f = new Rational(p, 100);
  const change = (price * p) / 100;
  const after = mode === "discount" ? price - change : price + change;
  return (
    <Panel>
      <div className="flex flex-wrap items-end gap-4">
        <Slider label="Percentage p" value={p} min={0} max={100} step={1} onChange={setP} unit="%" />
        <NumberField label="Amount (Rs)" value={price} min={0} max={1000000} step={50} onChange={setPrice} width="w-28" />
        <Seg label="Change" value={mode} onChange={setMode} options={[{ id: "discount", label: "decrease" }, { id: "increase", label: "increase" }]} />
      </div>
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <svg viewBox="0 0 220 220" className="w-full max-w-[240px] rounded-lg border border-line bg-bg" role="img" aria-label={`${p} of 100 squares shaded`}>
          {Array.from({ length: 100 }, (_, i) => (
            <rect key={i} x={10 + (i % 10) * 20} y={10 + Math.floor(i / 10) * 20} width={18} height={18} rx={2} fill={i < p ? "var(--accent)" : "var(--card-2)"} />
          ))}
        </svg>
        <div className="space-y-3">
          <p className="text-lg"><TeX tex={`${p}\\% = \\frac{${p}}{100} = ${f.toTex()} = ${fmt(p / 100)}`} /></p>
          <p><TeX tex={`${p}\\%\\ \\text{of}\\ ${price} = \\frac{${p}}{100}\\times ${price} = ${fmt(change)}`} /></p>
          <p><TeX tex={`${mode === "discount" ? "\\text{new} = " + price + " - " + fmt(change) : "\\text{new} = " + price + " + " + fmt(change)} = ${fmt(after)}`} /></p>
          <p className="text-sm text-muted">Multiplier: ×{fmt(mode === "discount" ? 1 - p / 100 : 1 + p / 100)} — {mode === "discount" ? `you pay ${100 - p}% of the original.` : `the new amount is ${100 + p}% of the original.`}</p>
        </div>
      </div>
      <Readouts items={[{ label: "Fraction", value: f.toString() }, { label: "Decimal", value: fmt(p / 100) }, { label: "Change (Rs)", value: fmt(change) }, { label: "New amount (Rs)", value: fmt(after) }]} />
      <TextAlternative><p>{p} out of 100 squares are shaded. {p}% of Rs {price} is Rs {fmt(change)}; after a {p}% {mode === "discount" ? "decrease" : "increase"} the amount is Rs {fmt(after)}.</p></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Ratio mixer
export function RatioMixerSim({ preset }: SimProps) {
  const [a, setA] = useState(preset === "recipe" ? 2 : 3);
  const [b, setB] = useState(preset === "recipe" ? 5 : 2);
  const [total, setTotal] = useState(preset === "recipe" ? 700 : 500);
  const part = total / (a + b);
  const sa = a * part, sb = b * part;
  const g = gcd(a, b) || 1;
  return (
    <Panel>
      <div className="flex flex-wrap items-end gap-4">
        <Slider label="Parts of A" value={a} min={1} max={10} step={1} onChange={setA} />
        <Slider label="Parts of B" value={b} min={1} max={10} step={1} onChange={setB} />
        <Slider label="Total (ml)" value={total} min={50} max={2000} step={50} onChange={setTotal} />
      </div>
      <svg viewBox="0 0 600 120" className="h-auto w-full rounded-lg border border-line bg-bg" role="img" aria-label={`A:B = ${a}:${b}; ${fmt(sa)} ml of A and ${fmt(sb)} ml of B`}>
        {Array.from({ length: a + b }, (_, i) => (
          <rect key={i} x={10 + (i * 580) / (a + b)} y={20} width={580 / (a + b) - 3} height={60} rx={4} fill={i < a ? "var(--accent)" : "var(--info)"} />
        ))}
        <text x={10} y={105} fill="var(--muted)" fontSize={13}>{`${a + b} equal parts of ${fmt(part)} ml each`}</text>
      </svg>
      <Readouts items={[
        { label: "Ratio A : B", value: `${a} : ${b}`, note: g > 1 ? `simplest form ${a / g} : ${b / g}` : "already in simplest form" },
        { label: "One part", value: `${total} ÷ ${a + b} = ${fmt(part)} ml` },
        { label: "A", value: `${a} × ${fmt(part)} = ${fmt(sa)} ml` },
        { label: "B", value: `${b} × ${fmt(part)} = ${fmt(sb)} ml` },
        { label: "Fraction that is A", value: new Rational(a, a + b).toString() },
      ]} />
      <TextAlternative><p>The total of {total} ml is split into {a + b} equal parts; A gets {a} parts ({fmt(sa)} ml) and B gets {b} parts ({fmt(sb)} ml). Scaling the total scales both shares by the same factor, so A:B stays {a}:{b}.</p></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Balance equation
type Op = { kind: "add" | "mul"; k: number };
export function BalanceEquationSim({ preset }: SimProps) {
  const start = preset === "negative" ? [-3, 7, 0, -8] : preset === "both-sides" ? [5, -4, 2, 11] : [3, 4, 0, 19];
  const [eq, setEq] = useState(start); // a x + b = c x + d
  const [history, setHistory] = useState<string[]>([]);
  const [k, setK] = useState(1);
  const [a, b, c, d] = eq;
  const side = (p: number, q: number) => `${p === 0 ? "" : p === 1 ? "x" : p === -1 ? "−x" : `${p}x`}${p !== 0 && q !== 0 ? (q > 0 ? " + " : " − ") : q < 0 && p === 0 ? "−" : ""}${q === 0 ? (p === 0 ? "0" : "") : Math.abs(q)}`;
  const apply = (op: Op, label: string) => {
    let ne = eq;
    if (op.kind === "add") ne = [a, b + op.k, c, d + op.k];
    else ne = [a * op.k, b * op.k, c * op.k, d * op.k];
    if (op.kind === "mul" && op.k === 0) return;
    setEq(ne);
    setHistory((h) => [...h, `${label}:  ${side(ne[0], ne[1])} = ${side(ne[2], ne[3])}`]);
  };
  const subX = (m: number) => {
    const ne = [a - m, b, c - m, d];
    setEq(ne);
    setHistory((h) => [...h, `subtract ${m}x from both sides:  ${side(ne[0], ne[1])} = ${side(ne[2], ne[3])}`]);
  };
  const solved = (a === 1 && b === 0 && c === 0) || (c === 1 && d === 0 && a === 0);
  const sol = a - c !== 0 ? new Rational(d - b, a - c) : null;
  const tilt = 0; // the balance stays level: both sides are always equal for the solution
  return (
    <Panel>
      <svg viewBox="0 0 600 170" className="h-auto w-full rounded-lg border border-line bg-bg" role="img" aria-label={`Balance: ${side(a, b)} equals ${side(c, d)}`}>
        <polygon points="300,150 285,170 315,170" fill="var(--muted)" />
        <g transform={`rotate(${tilt} 300 150)`}>
          <line x1={60} x2={540} y1={150} y2={150} stroke="var(--muted)" strokeWidth={4} />
          <rect x={70} y={70} width={200} height={70} rx={10} fill="var(--card-2)" stroke="var(--accent)" />
          <rect x={330} y={70} width={200} height={70} rx={10} fill="var(--card-2)" stroke="var(--info)" />
          <text x={170} y={113} textAnchor="middle" fontSize={22} fill="var(--fg)" fontFamily="monospace">{side(a, b)}</text>
          <text x={430} y={113} textAnchor="middle" fontSize={22} fill="var(--fg)" fontFamily="monospace">{side(c, d)}</text>
          <text x={300} y={50} textAnchor="middle" fontSize={26} fill="var(--fg)">=</text>
        </g>
      </svg>
      <div className="flex flex-wrap items-end gap-2">
        <NumberField label="number k" value={k} min={-50} max={50} onChange={setK} width="w-20" />
        <button type="button" className="rounded-lg border border-line px-3 py-2" onClick={() => apply({ kind: "add", k }, `add ${k} to both sides`)}>add k to both sides</button>
        <button type="button" className="rounded-lg border border-line px-3 py-2" onClick={() => apply({ kind: "add", k: -k }, `subtract ${k} from both sides`)}>subtract k from both sides</button>
        <button type="button" className="rounded-lg border border-line px-3 py-2" onClick={() => subX(k)}>subtract k·x from both sides</button>
        <button type="button" className="rounded-lg border border-line px-3 py-2" disabled={k === 0 || ![a, b, c, d].every((v) => Number.isInteger(v / k))} title="Only exact divisions are offered" onClick={() => {
          const ne = [a / k, b / k, c / k, d / k];
          setEq(ne);
          setHistory((h) => [...h, `divide both sides by ${k}:  ${side(ne[0], ne[1])} = ${side(ne[2], ne[3])}`]);
        }}>divide both sides by k</button>
        <button type="button" className="rounded-lg px-3 py-2 text-muted underline" onClick={() => { setEq(start); setHistory([]); }}>reset</button>
      </div>
      <ol className="list-decimal space-y-1 pl-6 font-mono text-sm" aria-label="Steps so far">
        <li>{side(start[0], start[1])} = {side(start[2], start[3])}</li>
        {history.map((h, i) => <li key={i}>{h}</li>)}
      </ol>
      <Readouts items={[
        { label: "Current equation", value: `${side(a, b)} = ${side(c, d)}` },
        { label: "Solution (unchanged by every legal step)", value: sol ? `x = ${sol.toString()}` : a - c === 0 && b === d ? "every x" : "no solution" },
        { label: "Status", value: solved ? "✓ solved — x is alone" : "keep going: isolate x" },
      ]} />
      <TextAlternative><p>The balance shows {side(a, b)} on the left and {side(c, d)} on the right. Every operation is applied to both sides, so the solution x = {sol?.toString() ?? "—"} never changes.</p></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Slope lab
export function SlopeLabSim({ preset }: SimProps) {
  const init = preset === "negative" ? [[-3, 4], [4, -2]] : preset === "vertical" ? [[2, -3], [2, 4]] : [[-2, -1], [3, 3]];
  const [p, setP] = useState(init[0]);
  const [q, setQ] = useState(init[1]);
  const rise = q[1] - p[1];
  const run = q[0] - p[0];
  const m = run !== 0 ? new Rational(rise, run) : null;
  const c = m ? new Rational(p[1]).sub(m.mul(p[0])) : null;
  const eqTex = m && c ? `y = ${m.equals(0) ? "" : m.equals(1) ? "x" : m.equals(-1) ? "-x" : `${m.toTex()}x`}${c.equals(0) ? (m.equals(0) ? "0" : "") : `${c.compare(0) < 0 || m.equals(0) ? "" : "+"}${c.toTex()}`}` : `x = ${p[0]}`;
  return (
    <Panel>
      <Plot view={{ xmin: -8, xmax: 8, ymin: -6, ymax: 6 }} equalAspect label={`Line through (${p[0]}, ${p[1]}) and (${q[0]}, ${q[1]}); slope ${m ? m.toString() : "undefined"}`}>
        {(s) => (
          <g>
            {m ? <FnPath s={s} f={(x) => m.toNumber() * (x - p[0]) + p[1]} /> : <line x1={s.sx(p[0])} x2={s.sx(p[0])} y1={0} y2={s.H} stroke="var(--accent)" strokeWidth={2.5} />}
            <line x1={s.sx(p[0])} y1={s.sy(p[1])} x2={s.sx(q[0])} y2={s.sy(p[1])} stroke="var(--info)" strokeWidth={2} strokeDasharray="6 4" />
            <line x1={s.sx(q[0])} y1={s.sy(p[1])} x2={s.sx(q[0])} y2={s.sy(q[1])} stroke="var(--ok)" strokeWidth={2} strokeDasharray="6 4" />
            <text x={(s.sx(p[0]) + s.sx(q[0])) / 2} y={s.sy(p[1]) + (rise >= 0 ? 18 : -8)} fill="var(--info)" fontSize={13} textAnchor="middle">run {run}</text>
            <text x={s.sx(q[0]) + 8} y={(s.sy(p[1]) + s.sy(q[1])) / 2} fill="var(--ok)" fontSize={13}>rise {rise}</text>
            <DragPoint s={s} x={p[0]} y={p[1]} label="Point A" onChange={(x, y) => setP([x, y])} />
            <DragPoint s={s} x={q[0]} y={q[1]} label="Point B" color="var(--info)" onChange={(x, y) => setQ([x, y])} />
          </g>
        )}
      </Plot>
      <p className="text-sm text-muted">Drag the points, or Tab to a point and use the arrow keys.</p>
      <Readouts items={[
        { label: "A, B", value: `(${p[0]}, ${p[1]}), (${q[0]}, ${q[1]})` },
        { label: "Slope m = rise/run", value: m ? `${rise}/${run} = ${m.toString()}` : `${rise}/0 — undefined`, note: !m ? "vertical line" : m.equals(0) ? "horizontal line" : m.compare(0) > 0 ? "goes up to the right" : "goes down to the right" },
        { label: "y-intercept c", value: c ? c.toString() : "none" },
        { label: "Equation", value: <TeX tex={eqTex} /> },
      ]} />
      <TextAlternative><p>Line through A({p[0]}, {p[1]}) and B({q[0]}, {q[1]}). Rise {rise}, run {run}. {m ? `Slope ${m.toString()}, equation ${eqTex.replace(/\\frac\{(-?\d+)\}\{(\d+)\}/g, "$1/$2")}.` : "Vertical line, slope undefined."}</p></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Quadratic playground
export function QuadraticPlaygroundSim({ preset }: SimProps) {
  const init = preset === "double-root" ? [1, -4, 4] : preset === "no-real-roots" ? [1, 2, 5] : [1, -2, -3];
  const [a, setA] = useState(init[0]);
  const [b, setB] = useState(init[1]);
  const [c, setC] = useState(init[2]);
  const D = b * b - 4 * a * c;
  const vx = -b / (2 * a);
  const vy = a * vx * vx + b * vx + c;
  const roots = a === 0 ? [] : D > 0 ? [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((x, y) => x - y) : D === 0 ? [vx] : [];
  const sq = Math.sqrt(Math.abs(D));
  const exactRoots = Number.isInteger(sq) && a !== 0 ? (D >= 0 ? [new Rational(-b - sq, 2 * a), new Rational(-b + sq, 2 * a)] : null) : null;
  return (
    <Panel>
      <div className="flex flex-wrap gap-4">
        <Slider label="a" value={a} min={-3} max={3} step={0.5} onChange={(v) => setA(v === 0 ? 0.5 : v)} />
        <Slider label="b" value={b} min={-8} max={8} step={1} onChange={setB} />
        <Slider label="c" value={c} min={-8} max={8} step={1} onChange={setC} />
      </div>
      <Plot view={{ xmin: -8, xmax: 8, ymin: -10, ymax: 10 }} zoomable label={`Parabola y = ${a}x² + ${b}x + ${c}`}>
        {(s) => (
          <g>
            <FnPath s={s} f={(x) => a * x * x + b * x + c} />
            <line x1={s.sx(vx)} x2={s.sx(vx)} y1={0} y2={s.H} stroke="var(--muted)" strokeDasharray="4 4" />
            <circle cx={s.sx(vx)} cy={s.sy(vy)} r={6} fill="var(--info)" />
            {roots.map((r, i) => <circle key={i} cx={s.sx(r)} cy={s.sy(0)} r={6} fill="var(--ok)" stroke="var(--bg)" strokeWidth={2} />)}
          </g>
        )}
      </Plot>
      <Readouts items={[
        { label: "Discriminant b² − 4ac", value: fmt(D), note: D > 0 ? "> 0: two real roots" : D === 0 ? "= 0: one repeated root" : "< 0: no real roots" },
        { label: "Roots", value: roots.length === 0 ? "none (real)" : exactRoots && Number.isInteger(2 * a) ? [...new Set(exactRoots.map((r) => r.toString()))].join(", ") : roots.map((r) => fmt(r, 5)).join(", "), note: exactRoots ? "exact" : roots.length ? "decimal approximation (√D irrational)" : undefined },
        { label: "Vertex", value: `(${fmt(vx, 5)}, ${fmt(vy, 5)})`, note: a > 0 ? "minimum" : "maximum" },
        { label: "Axis of symmetry", value: `x = ${fmt(vx, 5)}` },
      ]} />
      <TextAlternative><p>y = {a}x² + {b}x + {c}. Opens {a > 0 ? "upward" : "downward"}. Vertex ({fmt(vx)}, {fmt(vy)}). Discriminant {fmt(D)}. Real roots: {roots.length ? roots.map((r) => fmt(r)).join(" and ") : "none"}.</p></TextAlternative>
    </Panel>
  );
}

// ---------------------------------------------------------------- Graphing studio
const COLORS = ["var(--accent)", "var(--info)", "var(--ok)"];
export function GraphingStudioSim({ preset }: SimProps) {
  const init = preset === "rational" ? ["(x^2 - 1)/(x - 1)", "1/x", ""] : preset === "trig" ? ["sin(x)", "cos(x)", "tan(x)"] : preset === "exp-log" ? ["exp(x)", "ln(x)", "x"] : ["x^2 - 2", "2x + 1", ""];
  const [srcs, setSrcs] = useState(init);
  const [probe, setProbe] = useState(1);
  const fns = useMemo(() => srcs.map((src) => {
    if (!src.trim()) return { f: null, err: null, tex: "" };
    try {
      return { f: compileFn(src), err: null, tex: toTex(src) };
    } catch (e) {
      return { f: null, err: e instanceof ExpressionError ? e.message : "Could not read this.", tex: "" };
    }
  }), [srcs]);
  const inter = useMemo(() => {
    const [f, g] = [fns[0].f, fns[1].f];
    if (!f || !g) return [];
    const out: number[] = [];
    const h = (x: number) => f(x) - g(x);
    for (let x = -10; x < 10; x += 0.05) {
      const y0 = h(x), y1 = h(x + 0.05);
      if (Number.isFinite(y0) && Number.isFinite(y1) && y0 * y1 <= 0 && Math.abs(y0 - y1) < 5) {
        let lo = x, hi = x + 0.05;
        for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (h(lo) * h(mid) <= 0) hi = mid; else lo = mid; }
        const r = (lo + hi) / 2;
        if (!out.some((o) => Math.abs(o - r) < 1e-6)) out.push(r);
      }
    }
    return out.slice(0, 8);
  }, [fns]);
  return (
    <Panel>
      <div className="grid gap-2 sm:grid-cols-3">
        {srcs.map((src, i) => (
          <label key={i} className="text-sm text-muted">
            <span style={{ color: COLORS[i] }}>■</span> f{i + 1}(x) =
            <input value={src} onChange={(e) => setSrcs((s) => s.map((x, j) => (j === i ? e.target.value : x)))} className="mt-1 w-full rounded-md border border-line bg-bg px-2 py-1 font-mono text-fg" spellCheck={false} />
            {fns[i].err && <span className="text-xs text-warn" role="alert">{fns[i].err}</span>}
          </label>
        ))}
      </div>
      <Plot view={{ xmin: -10, xmax: 10, ymin: -7, ymax: 7 }} zoomable label={`Graphs of ${srcs.filter(Boolean).join(", ")}`}>
        {(s) => (
          <g>
            {fns.map((fn, i) => fn.f && <FnPath key={i} s={s} f={fn.f} color={COLORS[i]} />)}
            {inter.map((x, i) => fns[0].f && <circle key={i} cx={s.sx(x)} cy={s.sy(fns[0].f!(x))} r={5} fill="var(--fg)" />)}
            <line x1={s.sx(probe)} x2={s.sx(probe)} y1={0} y2={s.H} stroke="var(--muted)" strokeDasharray="3 3" />
          </g>
        )}
      </Plot>
      <Slider label="Probe x" value={probe} min={-10} max={10} step={0.1} onChange={setProbe} />
      <Readouts items={[
        ...fns.map((fn, i) => ({ label: `f${i + 1}(${fmt(probe)})`, value: fn.f ? (Number.isFinite(fn.f(probe)) ? fmt(fn.f(probe), 6) : "undefined here") : "—", note: fn.f && !Number.isFinite(fn.f(probe)) ? "outside the domain or a singularity" : undefined })),
        { label: "f1 = f2 at x ≈", value: inter.length ? inter.map((x) => fmt(x, 5)).join(", ") : "none in [−10, 10]" },
      ]} />
      <p className="text-xs text-muted">Allowed: numbers, x, + − * / ^, parentheses, pi, e and functions sin cos tan exp ln log10 sqrt abs. Drag the background or use +/− to zoom (focus the graph, Shift+arrows to pan).</p>
      <TextAlternative>
        <DataTable head={["x", ...srcs.map((s, i) => s || `f${i + 1}`)]} rows={[-4, -2, -1, 0, 0.5, 1, 2, 4].map((x) => [String(x), ...fns.map((fn) => (fn.f ? (Number.isFinite(fn.f(x)) ? fmt(fn.f(x), 5) : "undefined") : "—"))])} />
      </TextAlternative>
    </Panel>
  );
}

