"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { allTopics, topicById, prerequisitesOf, dependentsOf, ancestorsOf, topicCoverage } from "@mcc/curriculum";
import { computeMastery, practicedSkills, REVIEW_INTERVALS_DAYS } from "@mcc/question-engine";
import { useStore } from "@/lib/store";
import { Card, MasteryBadge, PageHeader } from "@/components/ui";

type NodeState = "mastered" | "review needed" | "learning" | "available" | "not yet";
const STATE_STYLE: Record<NodeState, { fill: string; icon: string }> = {
  mastered: { fill: "var(--ok)", icon: "●" }, "review needed": { fill: "var(--bad)", icon: "↻" }, learning: { fill: "var(--warn)", icon: "◑" }, available: { fill: "var(--info)", icon: "○" }, "not yet": { fill: "var(--line)", icon: "·" },
};

export function Progress() {
  const attempts = useStore((s) => s.attempts);
  const m = useMemo(() => new Map(allTopics.map((t) => [t.id, computeMastery(t.id, attempts)])), [attempts]);
  const state = (id: string): NodeState => {
    const x = m.get(id)!;
    if (x.level === "mastered") return "mastered";
    if (x.level === "review-needed") return "review needed";
    if (x.attempts > 0) return "learning";
    const pre = prerequisitesOf(id);
    return pre.length === 0 || pre.every((p) => m.get(p)!.level === "mastered" || m.get(p)!.level === "review-needed") ? "available" : "not yet";
  };
  const [focus, setFocus] = useState("fraction-add-sub");
  const anc = ancestorsOf(focus).slice(-10);
  const dep = dependentsOf(focus);
  const cols = [anc, [focus], dep];
  const W = 900, rowH = 46;
  const H = Math.max(...cols.map((c) => c.length)) * rowH + 40;
  const pos = new Map<string, [number, number]>();
  cols.forEach((c, ci) => c.forEach((id, ri) => pos.set(id, [40 + ci * 300, 30 + ri * rowH + (H - 40 - c.length * rowH) / 2])));
  const edges: [string, string][] = [];
  for (const id of [...anc, focus]) for (const d of dependentsOf(id)) if (pos.has(d)) edges.push([id, d]);

  const practiced = practicedSkills().map((s) => m.get(s)!).filter(Boolean);
  return (
    <div className="space-y-6">
      <PageHeader title="Progress & knowledge map" kicker="Transparent mastery">
        Mastery is evidence-based and fully explained below. Nothing is ever locked: “not yet” only means its prerequisites aren’t mastered.
      </PageHeader>
      <Card>
        <h2 className="font-semibold">How mastery is calculated</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Each answered question gives evidence: 1 for correct first try, 0.6 second try, 0.3 later; partial credit for multi-part answers.</li>
          <li>Each hint used multiplies that evidence by 0.8 (minimum 0.4). Viewing the worked solution before answering gives 0.</li>
          <li>Recent answers count more (weight 0.8ᵏ for the k-th most recent).</li>
          <li><strong>Mastered</strong> = score ≥ 85%, at least 3 correct answers, from at least 2 different question types.</li>
          <li>Mastered skills return for review after {REVIEW_INTERVALS_DAYS.join(", ")} days; a wrong review resets the interval to 1 day.</li>
        </ul>
      </Card>

      <section aria-labelledby="kg">
        <h2 id="kg" className="text-lg font-semibold">Knowledge graph</h2>
        <label className="mt-2 block text-sm">Focus topic{" "}
          <select value={focus} onChange={(e) => setFocus(e.target.value)} className="rounded-md border border-line bg-bg px-2 py-1">
            {allTopics.map((t) => <option key={t.id} value={t.id}>L{t.level.number} · {t.title}</option>)}
          </select>
        </label>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-card p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto min-w-[700px] w-full" role="group" aria-label={`Prerequisites and next topics for ${topicById(focus)?.title}. A text version follows.`}>
            {edges.map(([a, b]) => { const [x1, y1] = pos.get(a)!; const [x2, y2] = pos.get(b)!; return <path key={`${a}-${b}`} d={`M ${x1 + 230} ${y1} C ${x1 + 270} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`} fill="none" stroke="var(--muted)" strokeOpacity={0.5} />; })}
            {[...pos.entries()].map(([id, [x, y]]) => {
              const st = state(id);
              return (
                <a key={id} href={`/learn/${id}`} aria-label={`${topicById(id)?.title}: ${st}`}>
                  <rect x={x} y={y - 16} width={230} height={32} rx={8} fill="var(--card-2)" stroke={id === focus ? "var(--accent)" : STATE_STYLE[st].fill} strokeWidth={id === focus ? 3 : 1.5} />
                  <text x={x + 10} y={y + 5} fontSize={12} fill="var(--fg)">{STATE_STYLE[st].icon} {(topicById(id)?.title ?? id).slice(0, 32)}</text>
                </a>
              );
            })}
            <text x={40} y={16} fontSize={11} fill="var(--muted)">prerequisites (nearest 10)</text>
            <text x={340} y={16} fontSize={11} fill="var(--muted)">focus</text>
            <text x={640} y={16} fontSize={11} fill="var(--muted)">leads to</text>
          </svg>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
          {[["Prerequisites", anc], ["Focus", [focus]], ["Leads to", dep]].map(([label, ids]) => (
            <div key={label as string}>
              <h3 className="font-semibold">{label as string}</h3>
              <ul className="mt-1 space-y-1">{(ids as string[]).map((id) => <li key={id}><button className="text-left underline" onClick={() => setFocus(id)}>{topicById(id)?.title}</button> <span className="text-muted">— {state(id)}</span></li>)}</ul>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Legend: ● mastered · ↻ review needed · ◑ learning · ○ available · · not yet (prerequisites not mastered). Colour is never the only signal.</p>
      </section>

      <section aria-labelledby="sk">
        <h2 id="sk" className="text-lg font-semibold">Skills with practice</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line text-left"><th scope="col" className="py-1">Skill</th><th scope="col">Level</th><th scope="col">Mastery</th><th scope="col">Score</th><th scope="col">Attempts</th><th scope="col">Next review</th><th scope="col">Has lesson</th></tr></thead>
            <tbody>
              {practiced.map((x) => (
                <tr key={x.skill} className="border-b border-line/50">
                  <td className="py-2"><Link href={`/practice/${x.skill}`} className="underline">{topicById(x.skill)?.title}</Link></td>
                  <td>L{topicById(x.skill)?.level.number}</td>
                  <td><MasteryBadge level={x.level} /></td>
                  <td>{(x.score * 100).toFixed(0)}%</td>
                  <td>{x.attempts}</td>
                  <td>{x.nextReviewAt ? new Date(x.nextReviewAt).toLocaleDateString() : "—"}</td>
                  <td>{topicCoverage(x.skill).lessons.length ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
