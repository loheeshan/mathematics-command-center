"use client";
import { SIM_COMPONENTS } from "@mcc/visualizers";

export function SimEmbed({ slug, preset }: { slug: string; preset?: string }) {
  const C = SIM_COMPONENTS[slug];
  if (!C) return <p className="text-bad">Unknown simulation.</p>;
  return <C preset={preset} />;
}
