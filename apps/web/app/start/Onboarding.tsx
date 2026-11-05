"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { generateQuestion } from "@mcc/question-engine";
import { topicById, lessonsForTopic } from "@mcc/curriculum";
import { QuestionView } from "@/components/QuestionView";
import { PageHeader } from "@/components/ui";
import { actions } from "@/lib/store";

const MODES = [
  { id: "zero", title: "Start from zero", text: "Numbers, the number line and the four operations first. Nothing assumed.", href: "/lesson/number-line-signed-numbers" },
  { id: "find-level", title: "Find my level", text: "Six short questions, about 5 minutes. Optional — every lesson stays open whatever you score.", href: "" },
  { id: "university", title: "Follow my university", text: "Pick a semester and chapter; missing basics are linked as bridges.", href: "/academy" },
  { id: "explore", title: "Explore a topic", text: "Browse the full Master Core map.", href: "/learn" },
  { id: "ai", title: "Math for AI & Data Science", text: "Level 9 and the prerequisites it needs.", href: "/learn?level=9" },
];

/** One question per stepping stone; the first one missed suggests where to begin. */
const DIAGNOSTIC = [
  { template: "signed-subtract", topic: "negative-numbers" },
  { template: "fraction-add-unlike", topic: "fraction-add-sub" },
  { template: "percent-change", topic: "percentages" },
  { template: "linear-one-side", topic: "linear-equations" },
  { template: "slope-two-points", topic: "slope-intercept" },
  { template: "derivative-at-point", topic: "derivative-definition" },
];

export function Onboarding({ initialMode }: { initialMode: string | null }) {
  const [mode, setMode] = useState<string | null>(initialMode);
  const [i, setI] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const qs = useMemo(() => DIAGNOSTIC.map((d, k) => generateQuestion(d.template, 1000 + k)), []);
  const done = results.length === DIAGNOSTIC.length;
  const firstMiss = results.findIndex((r) => !r);
  const suggestion = firstMiss === -1 ? null : DIAGNOSTIC[firstMiss];

  if (mode !== "find-level") {
    return (
      <div>
        <PageHeader title="How would you like to begin?" kicker="Welcome">
          You can switch at any time. Nothing is locked behind a test.
        </PageHeader>
        <ul className="grid gap-3 md:grid-cols-2">
          {MODES.map((m) => (
            <li key={m.id}>
              {m.href ? (
                <Link href={m.href} onClick={() => actions.setProfile({ entryMode: m.id })} className="block h-full rounded-xl border border-line bg-card p-5 no-underline hover:border-accent">
                  <div className="text-lg font-semibold">{m.title}</div>
                  <p className="mt-1 text-muted">{m.text}</p>
                </Link>
              ) : (
                <button onClick={() => { setMode("find-level"); actions.setProfile({ entryMode: m.id }); }} className="block h-full w-full rounded-xl border border-line bg-card p-5 text-left hover:border-accent">
                  <div className="text-lg font-semibold">{m.title}</div>
                  <p className="mt-1 text-muted">{m.text}</p>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Find my level" kicker="Optional check">
        This is not a grade and nothing is locked. Skip any question you haven’t met yet — that is useful information too. Answers here don’t count towards mastery.
      </PageHeader>
      {!done ? (
        <div key={i} className="space-y-3">
          <p className="text-sm text-muted">Question {i + 1} of {DIAGNOSTIC.length} · {topicById(DIAGNOSTIC[i].topic)?.title}</p>
          <QuestionView q={qs[i]} record={false} onDone={(o) => setResults((r) => (r.length > i ? r : [...r, o.correct && !o.revealedSolution]))} />
          <div className="flex justify-between">
            <button className="text-muted underline" onClick={() => { if (results.length <= i) setResults((r) => [...r, false]); setI((x) => Math.min(x + 1, DIAGNOSTIC.length - 1)); }}>I haven’t learned this yet — skip</button>
            {results.length > i && i < DIAGNOSTIC.length - 1 && <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg" onClick={() => setI((x) => x + 1)}>Next →</button>}
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-line bg-card p-5" role="status">
          <h2 className="text-xl font-semibold">Suggested starting point</h2>
          {suggestion ? (
            <>
              <p>A good place to start is <strong>{topicById(suggestion.topic)?.title}</strong>. Everything before it looked comfortable.</p>
              <div className="flex flex-wrap gap-2">
                {lessonsForTopic(suggestion.topic)[0] ? (
                  <Link href={`/lesson/${lessonsForTopic(suggestion.topic)[0].slug}`} className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg no-underline">Open the lesson</Link>
                ) : (
                  <Link href={`/learn/${suggestion.topic}`} className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg no-underline">Open the topic</Link>
                )}
                <Link href="/learn" className="rounded-lg border border-line px-4 py-2 no-underline">See the whole map</Link>
              </div>
            </>
          ) : (
            <p>All six went well. Try the <Link href="/academy" className="underline">Academy Path</Link> or <Link href="/learn?level=5" className="underline">Level 5 calculus</Link>.</p>
          )}
          <ul className="text-sm text-muted">
            {DIAGNOSTIC.map((d, k) => <li key={d.topic}>{results[k] ? "✓" : "○"} {topicById(d.topic)?.title}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
