"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { practicedSkills, computeMastery, templatesForSkill } from "@mcc/question-engine";
import { topicById } from "@mcc/curriculum";
import { useStore } from "@/lib/store";
import { MasteryBadge } from "@/components/ui";
import { PracticeSession } from "@/components/PracticeSession";

export function PracticeHub() {
  const attempts = useStore((s) => s.attempts);
  const skills = useMemo(() => practicedSkills().map((s) => ({ s, t: topicById(s), m: computeMastery(s, attempts) })).sort((a, b) => (a.t?.level.number ?? 0) - (b.t?.level.number ?? 0)), [attempts]);
  const due = skills.filter((x) => x.m.level === "review-needed").map((x) => x.s);
  const weak = skills.filter((x) => x.m.level === "learning" || x.m.level === "practising").map((x) => x.s);
  const [mixed, setMixed] = useState<null | { skills: string[]; key: string }>(null);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg disabled:opacity-50" disabled={due.length + weak.length === 0} onClick={() => setMixed({ skills: [...due, ...weak].slice(0, 6), key: `review:${Date.now()}` })}>
          Daily review ({due.length} due, {weak.length} in progress)
        </button>
        <button className="rounded-lg border border-line px-4 py-2" onClick={() => setMixed({ skills: skills.filter((x) => (x.t?.level.number ?? 0) <= 2).map((x) => x.s), key: `mixed-found:${Date.now()}` })}>Mixed foundations (L0–L2)</button>
        <button className="rounded-lg border border-line px-4 py-2" onClick={() => setMixed({ skills: skills.filter((x) => (x.t?.level.number ?? 0) >= 4).map((x) => x.s), key: `mixed-uni:${Date.now()}` })}>Mixed university (L4+)</button>
      </div>
      {due.length + weak.length === 0 && <p className="text-sm text-muted">Daily review becomes available once you’ve practised a skill.</p>}
      {mixed && <PracticeSession skills={mixed.skills} count={8} seedKey={mixed.key} title="Mixed set" />}
      <table className="w-full text-sm">
        <caption className="mb-2 text-left text-muted">Skills with question templates</caption>
        <thead><tr className="border-b border-line text-left"><th scope="col" className="py-1">Skill</th><th scope="col">Level</th><th scope="col">Question types</th><th scope="col">Mastery</th></tr></thead>
        <tbody>
          {skills.map(({ s, t, m }) => (
            <tr key={s} className="border-b border-line/50">
              <td className="py-2"><Link href={`/practice/${s}`} className="underline">{t?.title ?? s}</Link></td>
              <td>L{t?.level.number}</td>
              <td>{templatesForSkill(s).length}</td>
              <td><MasteryBadge level={m.level} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
