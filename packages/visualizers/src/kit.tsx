"use client";
import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { sampleFunction, fmt } from "@mcc/math-engine";

export interface View {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}
export interface Scales {
  sx: (x: number) => number;
  sy: (y: number) => number;
  ix: (px: number) => number;
  iy: (py: number) => number;
  view: View;
  W: number;
  H: number;
}

function niceStep(range: number, target = 8) {
  const raw = range / target;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
}

/**
 * Cartesian SVG plot with grid, axes and tick labels. Optional zoom/pan controls
 * (buttons + drag on background + keyboard on the focused plot). Children get scale functions.
 */
export function Plot({
  view: initial,
  width = 640,
  height = 400,
  label,
  children,
  zoomable = false,
  equalAspect = false,
  xLabel = "x",
  yLabel = "y",
  piTicks = false,
}: {
  view: View;
  width?: number;
  height?: number;
  label: string;
  children: (s: Scales) => ReactNode;
  zoomable?: boolean;
  equalAspect?: boolean;
  xLabel?: string;
  yLabel?: string;
  piTicks?: boolean;
}) {
  const [view, setView] = useState(initial);
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial && JSON.stringify(initial) !== JSON.stringify(lastInitial)) {
    setLastInitial(initial);
    setView(initial);
  }
  const W = width, H = height, pad = 28;
  let v = view;
  if (equalAspect) {
    const sx = (W - 2 * pad) / (v.xmax - v.xmin);
    const sy = (H - 2 * pad) / (v.ymax - v.ymin);
    if (sx > sy) {
      const cx = (v.xmin + v.xmax) / 2, half = (W - 2 * pad) / sy / 2;
      v = { ...v, xmin: cx - half, xmax: cx + half };
    } else {
      const cy = (v.ymin + v.ymax) / 2, half = (H - 2 * pad) / sx / 2;
      v = { ...v, ymin: cy - half, ymax: cy + half };
    }
  }
  const s: Scales = useMemo(() => {
    const sx = (x: number) => pad + ((x - v.xmin) / (v.xmax - v.xmin)) * (W - 2 * pad);
    const sy = (y: number) => H - pad - ((y - v.ymin) / (v.ymax - v.ymin)) * (H - 2 * pad);
    const ix = (px: number) => v.xmin + ((px - pad) / (W - 2 * pad)) * (v.xmax - v.xmin);
    const iy = (py: number) => v.ymin + ((H - pad - py) / (H - 2 * pad)) * (v.ymax - v.ymin);
    return { sx, sy, ix, iy, view: v, W, H };
  }, [v, W, H]);

  const xs = piTicks ? Math.PI / 2 : niceStep(v.xmax - v.xmin);
  const ys = niceStep(v.ymax - v.ymin, 6);
  const xt: number[] = [];
  for (let x = Math.ceil(v.xmin / xs) * xs; x <= v.xmax + 1e-9; x += xs) xt.push(+x.toFixed(10));
  const yt: number[] = [];
  for (let y = Math.ceil(v.ymin / ys) * ys; y <= v.ymax + 1e-9; y += ys) yt.push(+y.toFixed(10));
  const piLabel = (x: number) => {
    const k = Math.round(x / (Math.PI / 2));
    if (k === 0) return "0";
    const num = k % 2 === 0 ? k / 2 : k;
    const den = k % 2 === 0 ? "" : "/2";
    return `${num === 1 ? "" : num === -1 ? "−" : num}π${den}`;
  };

  const zoom = (f: number) =>
    setView((o) => {
      const cx = (o.xmin + o.xmax) / 2, cy = (o.ymin + o.ymax) / 2;
      return { xmin: cx - ((cx - o.xmin) * f), xmax: cx + ((o.xmax - cx) * f), ymin: cy - ((cy - o.ymin) * f), ymax: cy + ((o.ymax - cy) * f) };
    });
  const pan = (fx: number, fy: number) => setView((o) => ({ xmin: o.xmin + fx * (o.xmax - o.xmin), xmax: o.xmax + fx * (o.xmax - o.xmin), ymin: o.ymin + fy * (o.ymax - o.ymin), ymax: o.ymax + fy * (o.ymax - o.ymin) }));
  const drag = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="group"
        aria-label={label}
        className="h-auto w-full touch-none select-none rounded-lg border border-line bg-bg"
        tabIndex={zoomable ? 0 : undefined}
        onKeyDown={
          zoomable
            ? (e) => {
                const k = e.key;
                if (k === "+" || k === "=") zoom(0.8);
                else if (k === "-") zoom(1.25);
                else if (k === "ArrowLeft" && e.shiftKey) pan(-0.1, 0);
                else if (k === "ArrowRight" && e.shiftKey) pan(0.1, 0);
                else if (k === "ArrowUp" && e.shiftKey) pan(0, 0.1);
                else if (k === "ArrowDown" && e.shiftKey) pan(0, -0.1);
                else return;
                e.preventDefault();
              }
            : undefined
        }
        onPointerDown={
          zoomable
            ? (e) => {
                if ((e.target as Element).getAttribute("data-bg") !== "1") return;
                drag.current = { x: e.clientX, y: e.clientY };
                (e.currentTarget as Element).setPointerCapture(e.pointerId);
              }
            : undefined
        }
        onPointerMove={
          zoomable
            ? (e) => {
                if (!drag.current || !svgRef.current) return;
                const r = svgRef.current.getBoundingClientRect();
                const dx = ((e.clientX - drag.current.x) / r.width) * W;
                const dy = ((e.clientY - drag.current.y) / r.height) * H;
                drag.current = { x: e.clientX, y: e.clientY };
                setView((o) => {
                  const ux = (dx / (W - 2 * pad)) * (o.xmax - o.xmin);
                  const uy = (dy / (H - 2 * pad)) * (o.ymax - o.ymin);
                  return { xmin: o.xmin - ux, xmax: o.xmax - ux, ymin: o.ymin + uy, ymax: o.ymax + uy };
                });
              }
            : undefined
        }
        onPointerUp={() => (drag.current = null)}
      >
        <rect data-bg="1" x={0} y={0} width={W} height={H} fill="transparent" />
        <g stroke="var(--plot-grid)" strokeWidth={1} pointerEvents="none">
          {xt.map((x) => <line key={`gx${x}`} x1={s.sx(x)} x2={s.sx(x)} y1={pad} y2={H - pad} />)}
          {yt.map((y) => <line key={`gy${y}`} y1={s.sy(y)} y2={s.sy(y)} x1={pad} x2={W - pad} />)}
        </g>
        <g stroke="var(--plot-axis)" strokeWidth={1.5} pointerEvents="none">
          {v.ymin <= 0 && v.ymax >= 0 && <line x1={pad} x2={W - pad} y1={s.sy(0)} y2={s.sy(0)} />}
          {v.xmin <= 0 && v.xmax >= 0 && <line y1={pad} y2={H - pad} x1={s.sx(0)} x2={s.sx(0)} />}
        </g>
        <g fill="var(--muted)" fontSize={11} pointerEvents="none">
          {xt.map((x) => (Math.abs(x) < 1e-12 ? null : <text key={`tx${x}`} x={s.sx(x)} y={Math.min(H - 8, Math.max(pad + 12, s.sy(0) + 14))} textAnchor="middle">{piTicks ? piLabel(x) : fmt(x, 4)}</text>))}
          {yt.map((y) => (Math.abs(y) < 1e-12 ? null : <text key={`ty${y}`} x={Math.min(W - pad - 2, Math.max(pad + 2, s.sx(0) - 4))} y={s.sy(y) + 4} textAnchor="end">{fmt(y, 4)}</text>))}
          <text x={W - pad} y={Math.min(H - pad - 4, Math.max(pad + 10, s.sy(0) - 6))} textAnchor="end" fontStyle="italic">{xLabel}</text>
          <text x={Math.min(W - pad, Math.max(pad + 14, s.sx(0) + 8))} y={pad - 8} fontStyle="italic">{yLabel}</text>
        </g>
        <svg x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} viewBox={`${pad} ${pad} ${W - 2 * pad} ${H - 2 * pad}`} overflow="hidden">
          {children(s)}
        </svg>
      </svg>
      {zoomable && (
        <div className="absolute right-2 top-2 flex gap-1 text-sm" aria-label="Zoom and pan controls">
          <button type="button" className="rounded border border-line bg-card px-2" onClick={() => zoom(0.8)} aria-label="Zoom in">+</button>
          <button type="button" className="rounded border border-line bg-card px-2" onClick={() => zoom(1.25)} aria-label="Zoom out">−</button>
          <button type="button" className="rounded border border-line bg-card px-2" onClick={() => setView(initial)} aria-label="Reset view">⟲</button>
        </div>
      )}
    </div>
  );
}

/** y = f(x) curve, broken at discontinuities / outside the real domain. */
export function FnPath({ f, s, color = "var(--accent)", width = 2.5, dash, samples = 600 }: { f: (x: number) => number; s: Scales; color?: string; width?: number; dash?: string; samples?: number }) {
  const segs = sampleFunction(f, s.view.xmin, s.view.xmax, samples, (s.view.ymax - s.view.ymin) * 2);
  return (
    <g fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinejoin="round">
      {segs.map((seg, i) => (
        <polyline key={i} points={seg.map(([x, y]) => `${s.sx(x)},${s.sy(Math.max(s.view.ymin - 1e3, Math.min(s.view.ymax + 1e3, y)))}`).join(" ")} />
      ))}
    </g>
  );
}

/**
 * A point you can drag with mouse/touch, or focus (Tab) and move with arrow keys
 * (Shift = bigger step). Values are snapped to `step`.
 */
export function DragPoint({ x, y, s, onChange, label, color = "var(--accent)", step = 1, lockX = false, lockY = false, r = 9 }: { x: number; y: number; s: Scales; onChange: (x: number, y: number) => void; label: string; color?: string; step?: number; lockX?: boolean; lockY?: boolean; r?: number }) {
  const ref = useRef<SVGCircleElement>(null);
  const snap = (v: number) => Math.round(v / step) * step;
  const [active, setActive] = useState(false);
  const move = useCallback(
    (e: React.PointerEvent) => {
      const svg = ref.current?.ownerSVGElement?.ownerSVGElement ?? ref.current?.ownerSVGElement;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const m = svg.getScreenCTM();
      if (!m) return;
      const p = pt.matrixTransform(m.inverse());
      const nx = lockX ? x : Math.max(s.view.xmin, Math.min(s.view.xmax, snap(s.ix(p.x))));
      const ny = lockY ? y : Math.max(s.view.ymin, Math.min(s.view.ymax, snap(s.iy(p.y))));
      if (nx !== x || ny !== y) onChange(+nx.toFixed(10), +ny.toFixed(10));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [x, y, s, onChange, lockX, lockY, step],
  );
  return (
    <g>
      <circle cx={s.sx(x)} cy={s.sy(y)} r={r + 10} fill="transparent" style={{ cursor: "grab" }}
        onPointerDown={(e) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); setActive(true); }}
        onPointerMove={(e) => active && move(e)}
        onPointerUp={() => setActive(false)} />
      <circle
        ref={ref}
        cx={s.sx(x)}
        cy={s.sy(y)}
        r={r}
        fill={color}
        stroke="var(--bg)"
        strokeWidth={2}
        tabIndex={0}
        role="slider"
        aria-label={label}
        aria-valuetext={`${label}: (${fmt(x)}, ${fmt(y)})`}
        aria-valuenow={lockY ? x : y}
        style={{ cursor: "grab", outline: "none" }}
        className="focus:stroke-[var(--fg)]"
        onPointerDown={(e) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); setActive(true); }}
        onPointerMove={(e) => active && move(e)}
        onPointerUp={() => setActive(false)}
        onKeyDown={(e) => {
          const big = e.shiftKey ? 5 : 1;
          let nx = x, ny = y;
          if (e.key === "ArrowLeft" && !lockX) nx -= step * big;
          else if (e.key === "ArrowRight" && !lockX) nx += step * big;
          else if (e.key === "ArrowUp" && !lockY) ny += step * big;
          else if (e.key === "ArrowDown" && !lockY) ny -= step * big;
          else return;
          e.preventDefault();
          onChange(+Math.max(s.view.xmin, Math.min(s.view.xmax, nx)).toFixed(10), +Math.max(s.view.ymin, Math.min(s.view.ymax, ny)).toFixed(10));
        }}
      />
    </g>
  );
}

export function Slider({ label, value, min, max, step, onChange, format = (v: number) => fmt(v), unit }: { label: ReactNode; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format?: (v: number) => string; unit?: string }) {
  const id = useId();
  return (
    <div className="min-w-[10rem] flex-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <label htmlFor={id} className="text-muted">{label}</label>
        <output htmlFor={id} className="font-mono">{format(value)}{unit ? ` ${unit}` : ""}</output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function NumberField({ label, value, onChange, min, max, step = 1, width = "w-20" }: { label: ReactNode; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; width?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex flex-col text-sm text-muted">
      {label}
      <input id={id} type="number" value={Number.isFinite(value) ? value : ""} min={min} max={max} step={step}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (e.target.value === "" || !Number.isFinite(v)) return;
          onChange(Math.max(min ?? -Infinity, Math.min(max ?? Infinity, v)));
        }}
        className={`${width} mt-1 rounded-md border border-line bg-bg px-2 py-1 font-mono text-fg`} />
    </label>
  );
}

export function Readouts({ items }: { items: { label: ReactNode; value: ReactNode; note?: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" aria-live="polite">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-line bg-card-2 px-3 py-2">
          <dt className="text-xs text-muted">{it.label}</dt>
          <dd className="font-mono text-base">{it.value}</dd>
          {it.note && <dd className="text-xs text-muted">{it.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** Text/table alternative for every visual — used by screen readers and for printing. */
export function TextAlternative({ title = "Text and data alternative", children }: { title?: string; children: ReactNode }) {
  return (
    <details className="rounded-lg border border-line bg-card-2 px-3 py-2 text-sm">
      <summary className="cursor-pointer font-medium">{title}</summary>
      <div className="mt-2 overflow-x-auto">{children}</div>
    </details>
  );
}

export function DataTable({ head, rows, caption }: { head: ReactNode[]; rows: ReactNode[][]; caption?: string }) {
  return (
    <table className="w-full border-collapse font-mono text-xs">
      {caption && <caption className="mb-1 text-left font-sans text-muted">{caption}</caption>}
      <thead>
        <tr>{head.map((h, i) => <th key={i} scope="col" className="border-b border-line px-2 py-1 text-left font-sans">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-line/50 px-2 py-0.5">{c}</td>)}</tr>)}
      </tbody>
    </table>
  );
}

export function Seg({ options, value, onChange, label }: { options: { id: string; label: ReactNode }[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-lg border border-line p-1">
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)} className={`rounded-md px-3 py-1 text-sm ${value === o.id ? "bg-accent text-accent-fg" : "text-muted hover:text-fg"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const Panel = ({ children, className = "" }: { children: ReactNode; className?: string }) => <div className={`space-y-3 ${className}`}>{children}</div>;
