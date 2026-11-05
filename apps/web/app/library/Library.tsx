"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { GLOSSARY, LESSONS, SIMULATIONS, academy, allTopics, topicById } from "@mcc/curriculum";
import { TEMPLATES, generateQuestion } from "@mcc/question-engine";
import { PageHeader } from "@/components/ui";
import { Rich, Tex } from "@/components/Rich";

interface Entry { kind: string; title: string; text: string; href: string; source: "Master Core" | "University (source-bound)" | "MCC lab" | "Misconception" | "Glossary"; extra?: string }

function buildIndex(): Entry[] {
  const out: Entry[] = [];
  for (const t of allTopics) out.push({ kind: "Topic", title: t.title, text: `${t.level.title} ${t.unit.title} ${t.id}`, href: `/learn/${t.id}`, source: "Master Core" });
  for (const l of LESSONS) out.push({ kind: "Lesson", title: l.title, text: l.summary, href: `/lesson/${l.slug}`, source: "Master Core" });
  for (const s of SIMULATIONS) out.push({ kind: "Simulation", title: s.title, text: s.summary, href: `/simulations/${s.slug}`, source: "MCC lab" });
  for (const c of academy.chapters) {
    out.push({ kind: "Lecture chapter", title: `${c.semesterId.toUpperCase()} Ch ${c.chapter} ${c.title}`, text: c.objectives.join(" ") + " " + c.file, href: `/academy/${c.id}`, source: "University (source-bound)", extra: c.file });
    for (const t of c.topics) out.push({ kind: "Lecture topic", title: t.title, text: `${c.title} ${t.skills.join(" ")}`, href: `/academy/${c.id}#${t.id}`, source: "University (source-bound)", extra: `${c.file}, pp. ${t.pages[0]}–${t.pages[1]}` });
  }
  for (const g of GLOSSARY) out.push({ kind: "Glossary", title: g.term, text: g.plain + " " + (g.tex ?? ""), href: `/learn/${g.topic}`, source: "Glossary", extra: g.tex });
  const seen = new Set<string>();
  for (const t of TEMPLATES) {
    const q = generateQuestion(t.id, 1);
    for (const m of q.misconceptions ?? []) {
      if (seen.has(m.id + t.skill)) continue;
      seen.add(m.id + t.skill);
      out.push({ kind: "Common mistake", title: `${topicById(t.skill)?.title}: ${m.id.replace(/-/g, " ")}`, text: m.feedback, href: `/practice/${t.skill}`, source: "Misconception" });
    }
  }
  return out;
}

export function Library() {
  const index = useMemo(buildIndex, []);
  const [q, setQ] = useState("");
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = terms.length ? index.map((e) => {
    const hay = `${e.title} ${e.text} ${e.extra ?? ""}`.toLowerCase();
    const score = terms.reduce((s, t) => s + (e.title.toLowerCase().includes(t) ? 3 : hay.includes(t) ? 1 : -100), 0);
    return { e, score };
  }).filter((h) => h.score > 0).sort((a, b) => b.score - a.score).slice(0, 60) : [];
  return (
    <div className="space-y-6">
      <PageHeader title="Library" kicker="Search everything">
        Search topics, lessons, labs, lecture chapters (with PDF pages), the glossary and common mistakes. Results from your university PDFs are labelled <strong>source-bound</strong>; everything else is MCC’s own material.
      </PageHeader>
      <label className="block"><span className="sr-only">Search</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try: derivative, ∩, Bayes, determinant, adding denominators…" className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-lg" autoFocus />
      </label>
      {terms.length > 0 && (
        <section aria-live="polite">
          <p className="text-sm text-muted">{hits.length} result{hits.length === 1 ? "" : "s"}{hits.length === 60 ? " (first 60)" : ""}. Matches are by keyword, so some results are approximate.</p>
          <ul className="mt-2 space-y-2">
            {hits.map(({ e }, i) => (
              <li key={i} className="rounded-xl border border-line bg-card p-3">
                <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded bg-card-2 px-2 py-0.5">{e.kind}</span><span className={e.source.startsWith("University") ? "text-accent" : "text-muted"}>{e.source}</span>{e.extra && e.kind !== "Glossary" && <span className="font-mono text-muted">{e.extra}</span>}</div>
                <Link href={e.href} className="font-semibold underline">{e.title}</Link>
                <div className="text-sm text-muted"><Rich md={e.text.slice(0, 240)} /></div>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section aria-labelledby="gl">
        <h2 id="gl" className="text-lg font-semibold">Glossary</h2>
        <dl className="mt-2 grid gap-2 md:grid-cols-2">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="rounded-lg border border-line bg-card p-3">
              <dt className="font-semibold">{g.term} {g.tex && <Tex tex={g.tex} />}</dt>
              <dd className="text-sm text-muted">{g.plain} <Link href={`/learn/${g.topic}`} className="underline">topic</Link></dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-muted">Bilingual (Tamil/Sinhala) glossary entries are planned and will be added only with human-reviewed translations of mathematical terms.</p>
      </section>
    </div>
  );
}
