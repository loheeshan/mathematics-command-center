import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { academy, chapterById, manifestEntryFor, topicById, topicCoverage, academyTopicStatus, chaptersForSemester } from "@mcc/curriculum";
import { templatesForSkill } from "@mcc/question-engine";
import { PageHeader, Card, AcademyBadge, StatusBadge } from "@/components/ui";
import { BridgeLink } from "./BridgeLink";
import { ChapterPractice } from "./ChapterPractice";

export function generateStaticParams() {
  return academy.chapters.map((c) => ({ chapter: c.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter } = await params;
  return { title: chapterById(chapter)?.title ?? "Chapter" };
}

export default async function ChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter } = await params;
  const ch = chapterById(chapter);
  if (!ch) notFound();
  const sem = academy.semesters.find((s) => s.id === ch.semesterId)!;
  const m = manifestEntryFor(ch);
  const skills = [...new Set(ch.topics.flatMap((t) => t.skills))];
  const practiceSkills = skills.filter((s) => templatesForSkill(s).length > 0);
  const labs = [...new Map(skills.flatMap((s) => topicCoverage(s).sims).map((x) => [x.slug, x])).values()];
  const siblings = chaptersForSemester(ch.semesterId);
  const pos = siblings.findIndex((c) => c.id === ch.id);
  const self = `/academy/${ch.id}`;
  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/academy" className="underline">Academy</Link> › {sem.label}</nav>
      <PageHeader title={`Chapter ${ch.chapter}: ${ch.title}`} kicker={sem.course} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Original university chapter</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div><dt className="inline text-muted">PDF: </dt><dd className="inline break-all font-mono">{sem.dir}/{ch.file}</dd></div>
            <div><dt className="inline text-muted">Pages: </dt><dd className="inline">{m?.pageCount}</dd></div>
            <div><dt className="inline text-muted">Text extraction: </dt><dd className="inline">{m?.extractionQuality}{m && m.lowTextPages.length > 0 ? ` (pages ${m.lowTextPages.join(", ")} are handwritten/image-only and were read visually)` : ""}</dd></div>
            <div><dt className="inline text-muted">SHA-256: </dt><dd className="inline break-all font-mono text-xs">{m?.sha256.slice(0, 16)}…</dd></div>
          </dl>
          <p className="mt-2 text-xs text-muted">Open your own copy of the PDF at these pages. MCC does not redistribute lecture files.</p>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Learning objectives</h2>
          <p className="text-xs text-muted">{ch.objectivesSource === "stated" ? `As stated in the PDF (page ${ch.objectivesPage}).` : "Summarised by MCC from the chapter’s section headings — not quoted from the PDF."}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">{ch.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold">Required foundational concepts</h2>
        <p className="text-sm text-muted">The lectures assume these. Use <strong>I need the basics</strong> to open a bridge; a banner will bring you back here.</p>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {ch.foundations.map((f) => {
            const c = topicCoverage(f);
            return (
              <li key={f} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2">
                <span>{topicById(f)?.title} <StatusBadge status={c.status} /></span>
                <BridgeLink href={c.lessons[0] ? `/lesson/${c.lessons[0].slug}` : `/learn/${f}`} returnHref={self} returnLabel={`Ch ${ch.chapter} ${ch.title}`} />
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold">Topics in lecture order</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line text-left"><th scope="col" className="py-1 pr-3">Topic</th><th scope="col" className="pr-3">PDF pages</th><th scope="col" className="pr-3">Master Core skills</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {ch.topics.map((t) => (
                <tr key={t.id} id={t.id} className="border-b border-line/50 align-top">
                  <td className="py-2 pr-3">{t.title}</td>
                  <td className="py-2 pr-3 font-mono">{t.pages[0] === t.pages[1] ? `p. ${t.pages[0]}` : `pp. ${t.pages[0]}–${t.pages[1]}`}</td>
                  <td className="py-2 pr-3">{t.skills.map((s, i) => <span key={s}>{i > 0 && ", "}<Link href={`/learn/${s}`} className="underline">{topicById(s)?.title}</Link></span>)}</td>
                  <td className="py-2"><AcademyBadge status={academyTopicStatus(t.skills)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Visual labs</h2>
          {labs.length ? <ul className="mt-2 space-y-1">{labs.map((l) => <li key={l.slug}><Link href={`/simulations/${l.slug}`} className="underline">{l.title}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted">No lab built for this chapter yet.</p>}
        </Card>
        <Card>
          <h2 className="font-semibold">Exam readiness</h2>
          <p className="mt-2 text-sm text-muted">MCC does not have your past papers and does not claim alignment with them. The practice below is generated from MCC templates that cover this chapter’s skills{practiceSkills.length < skills.length ? ` (${practiceSkills.length} of ${skills.length} skills have templates so far)` : ""}.</p>
        </Card>
      </div>

      <section aria-labelledby="pr">
        <h2 id="pr" className="mb-2 text-lg font-semibold">Practice set</h2>
        {practiceSkills.length ? <ChapterPractice skills={practiceSkills} chapterId={ch.id} /> : <Card><p className="text-muted">No question templates exist for this chapter’s skills yet ({skills.map((s) => topicById(s)?.title).join(", ")}). This is listed as missing in the coverage report.</p></Card>}
      </section>
      <section aria-labelledby="lm">
        <h2 id="lm" className="mb-2 text-lg font-semibold">Lecture-matched questions</h2>
        <Card><p className="text-sm text-muted">Not yet authored: questions reproducing the style of specific lecture examples (with page references) are on the backlog. MCC will not invent lecture-specific questions it has not verified.</p></Card>
      </section>

      <nav aria-label="Chapter navigation" className="flex justify-between border-t border-line pt-4">
        {pos > 0 ? <Link href={`/academy/${siblings[pos - 1].id}`} className="underline">← Ch {siblings[pos - 1].chapter} {siblings[pos - 1].title}</Link> : <span />}
        {pos < siblings.length - 1 ? <Link href={`/academy/${siblings[pos + 1].id}`} className="underline">Ch {siblings[pos + 1].chapter} {siblings[pos + 1].title} →</Link> : <span />}
      </nav>
    </div>
  );
}
