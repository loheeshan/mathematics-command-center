"use client";
import Link from "next/link";
import { useState } from "react";
import { SIMULATIONS, type SimDomain } from "@mcc/curriculum";
import { Seg } from "@/components/Seg";

const DOMAINS: { id: SimDomain | "all"; label: string }[] = [
  { id: "all", label: "All" }, { id: "number", label: "Number" }, { id: "algebra", label: "Algebra" }, { id: "geometry-trig", label: "Trig" }, { id: "discrete", label: "Discrete" },
  { id: "calculus", label: "Calculus" }, { id: "linear-algebra", label: "Linear algebra" }, { id: "probability-stats", label: "Prob & stats" }, { id: "numerical", label: "Numerical" }, { id: "ai-ml", label: "AI/ML" },
];

export function Gallery() {
  const [d, setD] = useState<string>("all");
  const [q, setQ] = useState("");
  const list = SIMULATIONS.filter((s) => (d === "all" || s.domain === d) && (s.title + s.summary).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Seg label="Domain" value={d} onChange={setD} options={DOMAINS} />
        <label className="text-sm"><span className="sr-only">Search labs</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search labs" className="rounded-lg border border-line bg-bg px-3 py-1.5" /></label>
      </div>
      <p className="text-sm text-muted" aria-live="polite">{list.length} lab{list.length === 1 ? "" : "s"}</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <li key={s.slug}>
            <Link href={`/simulations/${s.slug}`} className="block h-full rounded-xl border border-line bg-card p-4 no-underline hover:border-accent">
              <div className="text-xs text-muted">Level {s.level} · {s.domain}</div>
              <div className="font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-muted">{s.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
