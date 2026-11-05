"use client";
import type { ReactNode } from "react";

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
