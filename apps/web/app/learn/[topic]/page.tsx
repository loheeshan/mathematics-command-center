import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allTopics, topicById, topicCoverage, prerequisitesOf, dependentsOf, chaptersUsingSkill, STATUS_LABEL, prerequisites } from "@mcc/curriculum";
import { PageHeader, StatusBadge, Card } from "@/components/ui";
import { TopicMastery } from "./TopicMastery";

export function generateStaticParams() {
  return allTopics.map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  return { title: topicById(topic)?.title ?? "Topic" };
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const t = topicById(topic);
  if (!t) notFound();
  const c = topicCoverage(topic);
  const pre = prerequisitesOf(topic);
  const dep = dependentsOf(topic);
  const chapters = chaptersUsingSkill(topic);
  const remediation = prerequisites.remediation[topic] ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title={t.title} kicker={`Level ${t.level.number} · ${t.level.title} · ${t.unit.title}`}>
        <span className="inline-flex items-center gap-2"><StatusBadge status={c.status} /> {STATUS_LABEL[c.status]}</span>
      </PageHeader>
      {c.status === "not-yet-authored" && (
        <Card className="border-warn">
          <p><strong>Not yet built.</strong> This topic is part of the Master Core roadmap, but MCC does not yet have a lesson, lab or practice set for it. Its prerequisites and the university chapters that use it are listed below so you can still plan your study.</p>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Lessons</h2>
          {c.lessons.length ? <ul className="mt-2 space-y-1">{c.lessons.map((l) => <li key={l.slug}><Link href={`/lesson/${l.slug}`} className="underline">{l.title}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted">None yet.</p>}
        </Card>
        <Card>
          <h2 className="font-semibold">Labs</h2>
          {c.sims.length ? <ul className="mt-2 space-y-1">{c.sims.map((s) => <li key={s.slug}><Link href={`/simulations/${s.slug}`} className="underline">{s.title}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted">None yet.</p>}
        </Card>
        <Card>
          <h2 className="font-semibold">Practice</h2>
          {c.templates.length ? (
            <>
              <p className="mt-2 text-sm text-muted">{c.templates.length} question type{c.templates.length > 1 ? "s" : ""}: {c.templates.map((x) => x.title).join(", ")}.</p>
              <Link href={`/practice/${topic}`} className="mt-2 inline-block rounded-lg bg-accent px-3 py-1.5 font-semibold text-accent-fg no-underline">Practise</Link>
              <TopicMastery skill={topic} />
            </>
          ) : <p className="mt-2 text-sm text-muted">None yet.</p>}
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Builds on</h2>
          {pre.length ? <ul className="mt-2 flex flex-wrap gap-2">{pre.map((p) => <li key={p}><Link href={`/learn/${p}`} className="rounded-full border border-line px-3 py-1 text-sm no-underline hover:border-accent">{topicById(p)?.title}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted">No prerequisites — a starting point.</p>}
          {remediation.length > 0 && <p className="mt-3 text-sm">Struggling? Go one step back: {remediation.map((r, i) => <span key={r}>{i > 0 && ", "}<Link href={`/learn/${r}`} className="underline">{topicById(r)?.title}</Link></span>)}.</p>}
        </Card>
        <Card>
          <h2 className="font-semibold">Leads to</h2>
          {dep.length ? <ul className="mt-2 flex flex-wrap gap-2">{dep.map((p) => <li key={p}><Link href={`/learn/${p}`} className="rounded-full border border-line px-3 py-1 text-sm no-underline hover:border-accent">{topicById(p)?.title}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted">Nothing depends on this yet.</p>}
        </Card>
      </div>
      <Card>
        <h2 className="font-semibold">Used in your university course</h2>
        {chapters.length ? <ul className="mt-2 space-y-1">{chapters.map((ch) => <li key={ch.id}><Link href={`/academy/${ch.id}`} className="underline">{ch.semesterId.toUpperCase()} · Ch {ch.chapter} {ch.title}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted">Not referenced by the uploaded lecture PDFs — Master Core only.</p>}
      </Card>
    </div>
  );
}
