import type { Metadata } from "next";
import Link from "next/link";
import { academy, chaptersForSemester, academyTopicStatus, manifestEntryFor, sourceManifest } from "@mcc/curriculum";
import { PageHeader, AcademyBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Academy Path" };

export default function AcademyPage() {
  return (
    <div>
      <PageHeader title="Academy Path" kicker={academy.university}>
        Your {sourceManifest.totalPdfs} lecture PDFs in their original order ({Object.entries(sourceManifest.countsBySemester).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(" · ")}). Each chapter lists its source file and page ranges, the foundations it assumes, and what MCC has built for it. Status per topic: <AcademyBadge status="implemented" /> lesson or lab+practice for every skill, <AcademyBadge status="partial" /> some support, <AcademyBadge status="missing" /> nothing yet.
      </PageHeader>
      <div className="space-y-8">
        {academy.semesters.map((sem) => (
          <section key={sem.id} aria-labelledby={`sem-${sem.id}`}>
            <h2 id={`sem-${sem.id}`} className="text-xl font-bold">{sem.label}</h2>
            <p className="text-sm text-muted">{sem.course} · folder “{sem.dir}”</p>
            <ol className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {chaptersForSemester(sem.id).map((ch) => {
                const st = ch.topics.map((t) => academyTopicStatus(t.skills));
                const m = manifestEntryFor(ch);
                return (
                  <li key={ch.id}>
                    <Link href={`/academy/${ch.id}`} className="block h-full rounded-xl border border-line bg-card p-4 no-underline hover:border-accent">
                      <div className="text-xs text-muted">Chapter {ch.chapter} · {m?.pageCount} pages{m?.extractionQuality !== "good" ? ` · ${m?.extractionQuality === "image-only" ? "handwritten" : "partly handwritten"}` : ""}</div>
                      <div className="font-semibold">{ch.title}</div>
                      <div className="mt-2 flex flex-wrap gap-1 text-xs">
                        <span className="text-ok">■ {st.filter((s) => s === "implemented").length}</span>
                        <span className="text-warn">◧ {st.filter((s) => s === "partial").length}</span>
                        <span className="text-muted">□ {st.filter((s) => s === "missing").length}</span>
                        <span className="text-muted">of {st.length} topics</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
