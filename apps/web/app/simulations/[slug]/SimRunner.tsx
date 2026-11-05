"use client";
import { useEffect, useState } from "react";
import { simulationBySlug } from "@mcc/curriculum";
import { SIM_COMPONENTS } from "@mcc/visualizers";
import { PracticeSession } from "@/components/PracticeSession";
import { actions } from "@/lib/store";
import { Seg } from "@/components/Seg";

export function SimRunner({ slug, initialPreset }: { slug: string; initialPreset: string }) {
  const meta = simulationBySlug(slug)!;
  const C = SIM_COMPONENTS[slug];
  const [preset, setPreset] = useState(initialPreset);
  const [run, setRun] = useState(0);
  const [practice, setPractice] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    actions.visitSim(slug);
    actions.setLastVisited(`/simulations/${slug}`, meta.title);
  }, [slug, meta.title]);
  const link = typeof window !== "undefined" ? `${window.location.origin}/simulations/${slug}?preset=${preset}` : "";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-3">
        <span className="text-sm text-muted">Challenge presets:</span>
        <Seg label="Preset" value={preset} onChange={(p) => { setPreset(p); setRun((r) => r + 1); window.history.replaceState(null, "", `?preset=${p}`); }} options={meta.presets.map((p) => ({ id: p, label: p.replace(/-/g, " ") }))} />
        <button className="rounded-lg border border-line px-3 py-1.5 text-sm" onClick={() => setRun((r) => r + 1)}>⟲ Reset</button>
        <button className="rounded-lg border border-line px-3 py-1.5 text-sm" onClick={() => { void navigator.clipboard?.writeText(link).then(() => setCopied(true)); }}>{copied ? "Link copied ✓" : "Copy deep link"}</button>
      </div>
      <div className="rounded-xl border border-line bg-card p-3 sm:p-4">
        <C key={`${preset}-${run}`} preset={preset} />
      </div>
      <section aria-labelledby="sim-practice" className="rounded-xl border border-line bg-card p-4">
        <h2 id="sim-practice" className="font-semibold">3-question practice</h2>
        {practice ? <PracticeSession templates={meta.practice} count={3} seedKey={`sim:${slug}`} /> : <button className="mt-2 rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg" onClick={() => setPractice(true)}>Start practice</button>}
      </section>
    </div>
  );
}
