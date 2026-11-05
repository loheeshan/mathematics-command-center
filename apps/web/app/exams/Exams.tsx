"use client";
import { useEffect, useMemo, useState } from "react";
import { academy, topicById } from "@mcc/curriculum";
import { buildPracticeSet, practicedSkills, type QuestionInstance } from "@mcc/question-engine";
import { QuestionView, type QuestionOutcome } from "@/components/QuestionView";
import { Card, PageHeader } from "@/components/ui";
import { Rich, Tex } from "@/components/Rich";
import { actions, useStore } from "@/lib/store";

const has = new Set(practicedSkills());
const semesterSkills = (sem: string) => [...new Set(academy.chapters.filter((c) => c.semesterId === sem).flatMap((c) => c.topics.flatMap((t) => t.skills)))].filter((s) => has.has(s));
const BLUEPRINTS = [
  { id: "foundations", title: "Foundations check (Levels 0–2)", skills: [...has].filter((s) => (topicById(s)?.level.number ?? 9) <= 2), count: 10 },
  { id: "fy-s1", title: "First Year S1 mock (MCC templates)", skills: semesterSkills("fy-s1"), count: 12 },
  { id: "fy-s2", title: "First Year S2 mock (MCC templates)", skills: semesterSkills("fy-s2"), count: 8 },
  { id: "sy-s1", title: "Second Year S1 mock (MCC templates)", skills: semesterSkills("sy-s1"), count: 8 },
];

export function Exams() {
  const history = useStore((s) => s.exams);
  const [active, setActive] = useState<null | { bp: (typeof BLUEPRINTS)[number]; seed: number; timed: boolean; start: number }>(null);
  const [outcomes, setOutcomes] = useState<(QuestionOutcome | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const qs = useMemo<QuestionInstance[]>(() => (active ? buildPracticeSet(active.bp.skills, active.bp.count, active.seed) : []), [active]);
  const limit = active ? active.bp.count * 2.5 * 60_000 : 0;
  useEffect(() => {
    if (!active || !active.timed || finished) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active, finished]);
  const remaining = active ? Math.max(0, limit - (now - active.start)) : 0;
  const finish = () => {
    if (!active || finished) return;
    setFinished(true);
    const score = outcomes.filter((o) => o?.correct).length;
    const weak = [...new Set(qs.filter((_, i) => !outcomes[i]?.correct).map((q) => q.skill))];
    actions.recordExam({ id: `${active.bp.id}-${active.seed}`, blueprint: active.bp.title, seed: active.seed, startedAt: active.start, finishedAt: Date.now(), score, total: qs.length, timed: active.timed, weakSkills: weak });
  };
  useEffect(() => {
    if (active?.timed && remaining === 0 && !finished) finish();
  });

  if (!active) {
    return (
      <div className="space-y-6">
        <PageHeader title="Exam center" kicker="Mock papers from verified templates">
          Mocks draw fresh, seeded questions from MCC’s templates for the skills in each blueprint. They are <strong>not</strong> your university’s past papers and make no claim to match them. No hints during the exam; full worked solutions afterwards.
        </PageHeader>
        <div className="grid gap-4 md:grid-cols-2">
          {BLUEPRINTS.map((bp) => (
            <Card key={bp.id}>
              <h2 className="font-semibold">{bp.title}</h2>
              <p className="mt-1 text-sm text-muted">{bp.count} questions · {bp.skills.length} skills · timed: {bp.count * 2.5} min</p>
              <details className="mt-1 text-sm"><summary className="cursor-pointer text-muted">Blueprint</summary><ul className="mt-1 list-disc pl-5">{bp.skills.map((s) => <li key={s}>{topicById(s)?.title}</li>)}</ul></details>
              <div className="mt-3 flex gap-2">
                <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg" onClick={() => { setOutcomes([]); setFinished(false); setActive({ bp, seed: Math.floor(Math.random() * 2 ** 31), timed: true, start: Date.now() }); }}>Start timed</button>
                <button className="rounded-lg border border-line px-4 py-2" onClick={() => { setOutcomes([]); setFinished(false); setActive({ bp, seed: Math.floor(Math.random() * 2 ** 31), timed: false, start: Date.now() }); }}>Untimed (accessibility)</button>
              </div>
            </Card>
          ))}
        </div>
        {history.length > 0 && (
          <Card>
            <h2 className="font-semibold">History</h2>
            <ul className="mt-2 space-y-1 text-sm">{history.slice().reverse().map((e) => <li key={e.id + e.finishedAt}>{new Date(e.finishedAt).toLocaleString()} — {e.blueprint}: <strong>{e.score}/{e.total}</strong>{e.weakSkills.length ? ` · review: ${e.weakSkills.map((s) => topicById(s)?.title).join(", ")}` : ""}</li>)}</ul>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-2">
        <strong>{active.bp.title}</strong>
        <span className="text-sm">{outcomes.filter(Boolean).length}/{qs.length} answered</span>
        {active.timed && !finished && <span role="timer" aria-live="off" className="font-mono">{Math.floor(remaining / 60000)}:{String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0")} left</span>}
        {!finished ? <button className="rounded-lg bg-accent px-4 py-1.5 font-semibold text-accent-fg" onClick={finish}>Finish & grade</button> : <button className="rounded-lg border border-line px-4 py-1.5" onClick={() => setActive(null)}>Back to exams</button>}
      </div>
      {!finished && qs.map((q, i) => (
        <QuestionView key={`${active.seed}-${i}`} q={q} examMode label={`Q${i + 1} · ${topicById(q.skill)?.title}`} onDone={(o) => setOutcomes((arr) => { const c = arr.slice(); c[i] = o; return c; })} />
      ))}
      {finished && (
        <div className="space-y-4">
          <Card className="border-accent">
            <h2 className="text-xl font-semibold">Score: {outcomes.filter((o) => o?.correct).length} / {qs.length}</h2>
            <p className="text-sm text-muted">Grading: one mark per fully correct answer; unanswered = 0. Failed skills are listed for review; retakes use new seeds.</p>
          </Card>
          {qs.map((q, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between"><span className="text-sm text-muted">Q{i + 1} · {topicById(q.skill)?.title}</span><span className={outcomes[i]?.correct ? "text-ok" : "text-bad"}>{outcomes[i]?.correct ? "✓ correct" : outcomes[i] ? "✗ incorrect" : "— unanswered"}</span></div>
              <Rich md={q.prompt} />
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{q.solution.map((s, k) => <li key={k}>{s.text && <Rich md={s.text} />}{s.tex && <Tex tex={s.tex} display />}</li>)}</ol>
              <p className="mt-1 text-sm">Answer: <Rich md={q.answerDisplay} /></p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
