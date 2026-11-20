"use client";
import { useMemo } from "react";
import { parseExpression, compileFn, fmt, ExpressionError } from "@mcc/math-engine";
import { Plot, FnPath } from "@mcc/visualizers";
import { useStore, actions, type State } from "@/lib/store";
import { PageHeader } from "@/components/ui";
import { Rich, Tex } from "@/components/Rich";
import { SavedVisualNotes } from '@/components/SavedVisualNotes';

type Cell = State["notebook"][number];
const uid = () => Math.random().toString(36).slice(2, 10);

/** Evaluate math cells top to bottom. "name = expression" defines a variable for later cells. No code execution. */
function evaluate(cells: Cell[]) {
  const scope: Record<string, number> = {};
  return cells.map((c) => {
    if (c.kind !== "math") return null;
    const lines = c.src.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.map((line) => {
      const m = line.match(/^([a-zA-Z][a-zA-Z0-9_]{0,15})\s*=\s*(.+)$/);
      const name = m?.[1];
      const expr = m ? m[2] : line;
      if (name && ["pi", "e", "sin", "cos", "tan", "exp", "log", "sqrt"].includes(name)) return { line, error: `“${name}” is reserved.` };
      try {
        const e = parseExpression(expr, Object.keys(scope));
        const v = e.evaluate(scope);
        if (name) scope[name] = v;
        return { line, tex: `${name ? `${name} = ` : ""}${e.toTex()}`, value: v };
      } catch (err) {
        return { line, error: err instanceof ExpressionError ? err.message : "Could not evaluate." };
      }
    });
  });
}

export function Notebook() {
  const stored = useStore((s) => s.notebook);
  const cells: Cell[] = stored.length ? stored : [
    { id: "intro", kind: "note", src: "**Welcome to your notebook.** Math cells evaluate safely (no code runs). Define variables with `name = expression` and reuse them below." },
    { id: "m1", kind: "math", src: "r = 1/2 + 1/3\nr * 6\nsqrt(2)^2" },
    { id: "p1", kind: "plot", src: "x^2 - 2" },
  ];
  const results = useMemo(() => evaluate(cells), [cells]);
  const set = (next: Cell[]) => actions.setNotebook(next);
  const edit = (id: string, src: string) => set(cells.map((c) => (c.id === id ? { ...c, src } : c)));
  const add = (kind: Cell["kind"]) => set([...cells, { id: uid(), kind, src: kind === "plot" ? "sin(x)" : kind === "math" ? "" : "" }]);
  const remove = (id: string) => set(cells.filter((c) => c.id !== id));
  const move = (i: number, d: number) => { const c = cells.slice(); const [x] = c.splice(i, 1); c.splice(i + d, 0, x); set(c); };
  const exportMd = () => {
    const md = cells.map((c, i) => c.kind === "note" ? c.src : c.kind === "plot" ? `Plot: y = ${c.src}` : (results[i] ?? []).map((r) => ("error" in r ? `${r.line}  → error: ${r.error}` : `${r.line}  → ${fmt(r.value!, 12)}`)).join("\n")).join("\n\n");
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcc-notebook.md";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader title="Notebook" kicker="Safe math cells, notes and graphs">
        Saved in this browser. Python/R execution is not available here (it needs a sandbox and is on the backlog); math cells use MCC’s whitelisted expression evaluator.
      </PageHeader>
      <SavedVisualNotes />
      <h2 className="text-xl font-semibold">Scratchpad: calculate and explore</h2>
      {cells.map((c, i) => (
        <section key={c.id} className="rounded-xl border border-line bg-card p-3" aria-label={`${c.kind} cell ${i + 1}`}>
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span className="uppercase">{c.kind}</span>
            <span className="flex gap-2">
              <button disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move cell up">↑</button>
              <button disabled={i === cells.length - 1} onClick={() => move(i, 1)} aria-label="Move cell down">↓</button>
              <button onClick={() => remove(c.id)} aria-label="Delete cell">✕</button>
            </span>
          </div>
          <textarea value={c.src} onChange={(e) => edit(c.id, e.target.value)} rows={c.kind === "note" ? 3 : Math.max(2, c.src.split("\n").length)} className="w-full rounded-md border border-line bg-bg p-2 font-mono text-sm" aria-label="Cell source" spellCheck={c.kind === "note"} />
          <div className="mt-2">
            {c.kind === "note" && <Rich md={c.src} />}
            {c.kind === "math" && (results[i] ?? []).map((r, k) => (
              <div key={k} className="flex flex-wrap items-baseline gap-2 font-mono text-sm">
                {"error" in r ? <span className="text-warn">{r.line} — {r.error}</span> : <><Tex tex={r.tex!} /> <span className="text-muted">=</span> <strong>{fmt(r.value!, 12)}</strong> {Number.isFinite(r.value!) && !Number.isInteger(r.value!) && <span className="text-xs text-muted">(decimal approximation)</span>}</>}
              </div>
            ))}
            {c.kind === "plot" && <PlotCell src={c.src} />}
          </div>
        </section>
      ))}
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg border border-line px-3 py-2" onClick={() => add("math")}>+ Math cell</button>
        <button className="rounded-lg border border-line px-3 py-2" onClick={() => add("note")}>+ Note</button>
        <button className="rounded-lg border border-line px-3 py-2" onClick={() => add("plot")}>+ Graph</button>
        <button className="ml-auto rounded-lg border border-line px-3 py-2" onClick={exportMd}>Export as Markdown</button>
      </div>
    </div>
  );
}

function PlotCell({ src }: { src: string }) {
  const r = useMemo(() => { try { return { f: compileFn(src), err: null }; } catch (e) { return { f: null, err: (e as Error).message }; } }, [src]);
  if (!r.f) return <p className="text-warn">{r.err}</p>;
  return <Plot view={{ xmin: -6, xmax: 6, ymin: -5, ymax: 5 }} height={260} zoomable label={`Graph of y = ${src}`}>{(s) => <FnPath s={s} f={r.f!} />}</Plot>;
}
