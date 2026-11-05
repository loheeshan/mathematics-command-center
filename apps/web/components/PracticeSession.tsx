"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { buildPracticeSet, computeMastery, type QuestionInstance } from "@mcc/question-engine";
import { topicById } from "@mcc/curriculum";
import { QuestionView, type QuestionOutcome } from "./QuestionView";
import { useStore } from "@/lib/store";
import { MasteryBadge } from "./ui";

/**
 * A run of questions. `skills` + `templates` choose the pool; `seed` makes it reproducible;
 * "New set" draws a fresh seed so retakes never repeat the same numbers.
 */
export function PracticeSession({ templates, skills, count, seedKey, title, mode = "practice" }: { templates?: string[]; skills?: string[]; count: number; seedKey: string; title?: string; mode?: "practice" | "mastery" }) {
  const [round, setRound] = useState(0);
  const questions = useMemo<QuestionInstance[]>(() => {
    const seed = `${seedKey}:${round}`;
    if (templates?.length) {
      // explicit templates in order (mastery checks use one per representation)
      const set = templates.map((t, i) => buildPracticeSetForTemplate(t, `${seed}:${i}`));
      const out: QuestionInstance[] = [];
      for (let i = 0; i < count; i++) out.push(set[i % set.length][Math.floor(i / set.length)]);
      return out;
    }
    return buildPracticeSet(skills ?? [], count, seed);
  }, [templates, skills, count, seedKey, round]);
  const [idx, setIdx] = useState(0);
  const [outcomes, setOutcomes] = useState<QuestionOutcome[]>([]);
  const attempts = useStore((s) => s.attempts);
  const finished = outcomes.length === questions.length && questions.length > 0;
  const touched = useMemo(() => [...new Set(questions.map((q) => q.skill))], [questions]);

  if (questions.length === 0) return <p className="text-muted">No question templates exist for this topic yet.</p>;

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <div className="flex items-center gap-3 text-sm text-muted">
        <span>Question {Math.min(idx + 1, questions.length)} of {questions.length}</span>
        <div className="h-2 flex-1 overflow-hidden rounded bg-card-2" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={outcomes.length} aria-label="Progress through this set">
          <div className="h-full bg-accent" style={{ width: `${(outcomes.length / questions.length) * 100}%` }} />
        </div>
      </div>
      {!finished && (
        <div key={`${round}-${idx}`}>
          <QuestionView
            q={questions[idx]}
            label={`${topicById(questions[idx].skill)?.title ?? questions[idx].skill}${mode === "mastery" ? " · mastery check" : ""}`}
            onDone={(o) => setOutcomes((prev) => (prev.length > idx ? prev : [...prev, o]))}
          />
          {outcomes.length > idx && (
            <div className="mt-3 flex justify-end">
              <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg" onClick={() => setIdx((i) => i + 1)} autoFocus>
                {idx + 1 < questions.length ? "Next question →" : "See results"}
              </button>
            </div>
          )}
        </div>
      )}
      {finished && (
        <div className="rounded-xl border border-line bg-card p-5" role="status">
          <h3 className="text-lg font-semibold">Set complete</h3>
          <p className="mt-1">
            {outcomes.filter((o) => o.correct).length} of {outcomes.length} correct
            {" · "}
            {outcomes.filter((o) => o.firstTry && o.hintsUsed === 0).length} first-try without hints
          </p>
          <ul className="mt-3 space-y-2">
            {touched.map((s) => {
              const m = computeMastery(s, attempts);
              return (
                <li key={s} className="flex flex-wrap items-center gap-2">
                  <MasteryBadge level={m.level} />
                  <Link href={`/practice/${s}`} className="underline">{topicById(s)?.title ?? s}</Link>
                  <span className="text-sm text-muted">score {(m.score * 100).toFixed(0)}% · {m.correct} correct across {m.templatesCorrect} question type{m.templatesCorrect === 1 ? "" : "s"}</span>
                </li>
              );
            })}
          </ul>
          <button
            className="mt-4 rounded-lg border border-line px-4 py-2"
            onClick={() => {
              setRound((r) => r + 1);
              setIdx(0);
              setOutcomes([]);
            }}
          >
            New set with fresh numbers
          </button>
        </div>
      )}
    </div>
  );
}

import { generateQuestion } from "@mcc/question-engine";
import { hashSeed } from "@mcc/math-engine";
function buildPracticeSetForTemplate(templateId: string, seed: string) {
  return Array.from({ length: 6 }, (_, i) => generateQuestion(templateId, hashSeed(`${seed}:${i}`)));
}
