import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SIMULATIONS, simulationBySlug, topicById, chaptersUsingSkill } from "@mcc/curriculum";
import { SimRunner } from "./SimRunner";

export function generateStaticParams() {
  return SIMULATIONS.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: simulationBySlug(slug)?.title ?? "Simulation" };
}

export default async function SimPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ preset?: string }> }) {
  const { slug } = await params;
  const { preset } = await searchParams;
  const meta = simulationBySlug(slug);
  if (!meta) notFound();
  const chapters = [...new Map(meta.skills.flatMap((s) => chaptersUsingSkill(s)).map((c) => [c.id, c])).values()];
  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/simulations" className="underline">Simulations</Link> › {meta.title}</nav>
      <h1 className="text-2xl font-bold sm:text-3xl">{meta.title}</h1>
      <p className="max-w-3xl text-muted">{meta.summary}</p>
      <SimRunner slug={slug} initialPreset={preset && meta.presets.includes(preset) ? preset : meta.presets[0]} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-card p-4">
          <h2 className="font-semibold">Skills</h2>
          <ul className="mt-1 flex flex-wrap gap-2">{meta.skills.map((s) => <li key={s}><Link href={`/learn/${s}`} className="rounded-full border border-line px-3 py-1 text-sm no-underline">{topicById(s)?.title}</Link></li>)}</ul>
        </div>
        <div className="rounded-xl border border-line bg-card p-4">
          <h2 className="font-semibold">Used in university chapters</h2>
          {chapters.length ? <ul className="mt-1 space-y-1 text-sm">{chapters.map((c) => <li key={c.id}><Link href={`/academy/${c.id}`} className="underline">{c.semesterId.toUpperCase()} Ch {c.chapter} {c.title}</Link></li>)}</ul> : <p className="text-sm text-muted">Master Core only.</p>}
        </div>
      </div>
    </div>
  );
}
