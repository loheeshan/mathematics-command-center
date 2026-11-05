"use client";
import { useMemo, useState } from "react";
import { computeMastery } from "@mcc/question-engine";
import { PracticeSession } from "@/components/PracticeSession";
import { useStore } from "@/lib/store";
import { MasteryBadge } from "@/components/ui";

export function SkillPractice({ skill }: { skill: string }) {
  const attempts = useStore((s) => s.attempts);
  const m = useMemo(() => computeMastery(skill, attempts), [skill, attempts]);
  const [seed] = useState(() => `skill:${skill}:${Date.now()}`);
  return (
    <div className="space-y-4">
      <p className="flex flex-wrap items-center gap-2 text-sm"><MasteryBadge level={m.level} /> <span className="text-muted">score {(m.score * 100).toFixed(0)}% · {m.correct} correct · {m.templatesCorrect} question types</span>{m.nextReviewAt && <span className="text-muted">· next review {new Date(m.nextReviewAt).toLocaleDateString()}</span>}</p>
      <PracticeSession skills={[skill]} count={6} seedKey={seed} />
    </div>
  );
}
