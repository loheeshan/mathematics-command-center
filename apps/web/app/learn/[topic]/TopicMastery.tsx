"use client";
import { useMemo } from "react";
import { computeMastery } from "@mcc/question-engine";
import { useStore } from "@/lib/store";
import { MasteryBadge } from "@/components/ui";

export function TopicMastery({ skill }: { skill: string }) {
  const attempts = useStore((s) => s.attempts);
  const m = useMemo(() => computeMastery(skill, attempts), [skill, attempts]);
  return <p className="mt-2 flex items-center gap-2 text-sm"><MasteryBadge level={m.level} /> <span className="text-muted">{m.attempts} attempts</span></p>;
}
