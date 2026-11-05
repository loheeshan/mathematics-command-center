import type { Metadata } from "next";
import Link from "next/link";
import { masterCore, topicCoverage } from "@mcc/curriculum";
import { PageHeader, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Master Core map" };

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const { level } = await searchParams;
  const focus = level !== undefined ? Number(level) : null;
  return (
    <div>
      <PageHeader title="Master Core" kicker="Levels 0 – 10">
        The complete roadmap, independent of any university. Each topic shows honestly what exists: a full lesson, a lab with practice, or nothing yet.
      </PageHeader>
      <nav aria-label="Jump to level" className="mb-6 flex flex-wrap gap-2">
        {masterCore.levels.map((l) => <a key={l.id} href={`#level-${l.number}`} className={`rounded-full border px-3 py-1 text-sm no-underline ${focus === l.number ? "border-accent text-accent" : "border-line text-muted"}`}>L{l.number}</a>)}
      </nav>
      <div className="space-y-8">
        {masterCore.levels.map((l) => (
          <section key={l.id} id={`level-${l.number}`} aria-labelledby={`h-${l.id}`} className={`scroll-mt-24 rounded-2xl border p-5 ${focus === l.number ? "border-accent" : "border-line"} bg-card`}>
            <h2 id={`h-${l.id}`} className="text-xl font-bold"><span className="text-accent">Level {l.number}</span> · {l.title}</h2>
            <p className="mt-1 text-muted">{l.summary}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {l.units.map((u) => (
                <div key={u.id} className="rounded-xl border border-line bg-bg p-4">
                  <h3 className="font-semibold">{u.title}</h3>
                  <ul className="mt-2 space-y-2">
                    {u.topics.map((t) => {
                      const c = topicCoverage(t.id);
                      return (
                        <li key={t.id} className="flex flex-wrap items-center justify-between gap-2">
                          <Link href={c.lessons[0] ? `/lesson/${c.lessons[0].slug}` : `/learn/${t.id}`} className="underline-offset-2 hover:underline">{t.title}</Link>
                          <StatusBadge status={c.status} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
