"use client";
import Link from "next/link";
import { useMemo } from "react";
import { LESSONS, STAGE_ORDER, STAGE_TITLES, simulationBySlug, topicById, lessonsForTopic } from "@mcc/curriculum";
import { computeMastery, practicedSkills } from "@mcc/question-engine";
import { useStore, useHydrated } from "@/lib/store";
import { Card, MasteryBadge, PageHeader } from "@/components/ui";

export function Dashboard() {
  const hydrated = useHydrated();
  const lessons = useStore((s) => s.lessons);
  const attempts = useStore((s) => s.attempts);
  const recent = useStore((s) => s.recentSims);
  const last = useStore((s) => s.lastVisited);
  const bookmarks = useStore((s) => s.bookmarks);
  const exams = useStore((s) => s.exams);
  const mastery = useMemo(() => practicedSkills().map((s) => computeMastery(s, attempts)), [attempts]);
  const due = mastery.filter((m) => m.level === "review-needed");
  const weak = mastery.filter((m) => m.level === "learning" || m.level === "practising").sort((a, b) => a.score - b.score).slice(0, 4);
  const inProgress = LESSONS.filter((l) => lessons[l.slug] && lessons[l.slug].completed.length < STAGE_ORDER.length - 1);
  const next = LESSONS.find((l) => !lessons[l.slug]);
  if (!hydrated) return <p className="text-muted">Loading your progress…</p>;
  const fresh = attempts.length === 0 && Object.keys(lessons).length === 0;
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" kicker="Your command center" />
      {fresh && (
        <Card className="border-accent">
          <p className="text-lg font-semibold">Welcome! Nothing here yet.</p>
          <p className="mt-1 text-muted">Start with the <Link href="/start" className="underline">onboarding</Link>, or jump straight into <Link href="/lesson/fractions-adding-unlike" className="underline">the fractions lesson</Link>.</p>
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Continue</h2>
          {last ? <Link href={last.href} className="mt-2 block rounded-lg bg-accent px-4 py-3 font-semibold text-accent-fg no-underline">↻ {last.label}</Link> : <p className="mt-2 text-sm text-muted">Nothing opened yet.</p>}
          {inProgress.map((l) => {
            const p = lessons[l.slug];
            return <p key={l.slug} className="mt-2 text-sm"><Link href={`/lesson/${l.slug}`} className="underline">{l.title}</Link> <span className="text-muted">— at “{STAGE_TITLES[p.stage]}”, {p.completed.length}/{STAGE_ORDER.length} stages</span></p>;
          })}
        </Card>
        <Card>
          <h2 className="font-semibold">Next step</h2>
          {next ? <p className="mt-2"><Link href={`/lesson/${next.slug}`} className="underline">{next.title}</Link><br /><span className="text-sm text-muted">{next.summary}</span></p> : <p className="mt-2 text-sm text-muted">You’ve opened every lesson so far. Try the <Link href="/academy" className="underline">Academy</Link>.</p>}
        </Card>
        <Card>
          <h2 className="font-semibold">Review due</h2>
          {due.length ? <ul className="mt-2 space-y-1">{due.map((m) => <li key={m.skill} className="flex items-center gap-2"><MasteryBadge level={m.level} /><Link href={`/practice/${m.skill}`} className="underline">{topicById(m.skill)?.title}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted">No reviews due. Mastered skills come back at 1, 3, 7, 14, 30 and 60 days.</p>}
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Needs work</h2>
          {weak.length ? <ul className="mt-2 space-y-2">{weak.map((m) => { const l = lessonsForTopic(m.skill)[0]; return <li key={m.skill}><div className="flex items-center gap-2"><MasteryBadge level={m.level} /><Link href={`/practice/${m.skill}`} className="underline">{topicById(m.skill)?.title}</Link></div>{l && <Link href={`/lesson/${l.slug}`} className="text-sm text-muted underline">revisit lesson</Link>}</li>; })}</ul> : <p className="mt-2 text-sm text-muted">Practise something to see weak spots here.</p>}
        </Card>
        <Card>
          <h2 className="font-semibold">Recent simulations</h2>
          {recent.length ? <ul className="mt-2 space-y-1">{recent.map((r) => <li key={r.slug}><Link href={`/simulations/${r.slug}`} className="underline">{simulationBySlug(r.slug)?.title}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted">None yet — <Link href="/simulations" className="underline">browse labs</Link>.</p>}
        </Card>
        <Card>
          <h2 className="font-semibold">Bookmarks & exams</h2>
          {bookmarks.length ? <ul className="mt-2 space-y-1">{bookmarks.map((b) => <li key={b.href}><Link href={b.href} className="underline">★ {b.label}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted">No bookmarks.</p>}
          {exams.length > 0 && <p className="mt-3 text-sm">Last exam: {exams[exams.length - 1].score}/{exams[exams.length - 1].total} ({exams[exams.length - 1].blueprint})</p>}
        </Card>
      </div>
      <Card>
        <h2 className="font-semibold">Activity</h2>
        <p className="mt-1 text-sm text-muted">{attempts.length} answers recorded · {mastery.filter((m) => m.level === "mastered").length} skills mastered · {Object.keys(lessons).length} lessons opened</p>
      </Card>
    </div>
  );
}
