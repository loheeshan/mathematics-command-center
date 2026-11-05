"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { STAGE_ORDER, STAGE_TITLES, lessonBySlug, topicById, chapterById, simulationBySlug, type Block, type Lesson, type StageId } from "@mcc/curriculum";
import type { QuestionInstance } from "@mcc/question-engine";
import { parseRational } from "@mcc/math-engine";
import { SIM_COMPONENTS } from "@mcc/visualizers";
import { Rich, Tex } from "./Rich";
import { QuestionView } from "./QuestionView";
import { PracticeSession } from "./PracticeSession";
import { actions, useStore } from "@/lib/store";
import { Seg } from "./Seg";

function BlockView({ b, lesson, idx, mode }: { b: Block; lesson: Lesson; idx: string; mode: string }) {
  switch (b.t) {
    case "text":
      if (b.mode && b.mode !== mode) return null;
      return (
        <div className="relative">
          {b.mode && <span className="mb-1 inline-block rounded bg-card-2 px-2 py-0.5 text-xs text-muted">{b.mode === "simple" ? "Simple explanation" : b.mode === "formal" ? "Formal mathematics" : "University style"}</span>}
          <Rich md={b.md} className="text-[1.05rem] leading-relaxed" />
        </div>
      );
    case "math":
      return (
        <figure className="rounded-lg bg-card-2 px-4 py-2">
          <Tex tex={b.tex} display />
          {b.caption && <figcaption className="text-sm text-muted">{b.caption}</figcaption>}
        </figure>
      );
    case "callout": {
      const tone = { note: "border-info", warning: "border-bad", analogy: "border-warn", exact: "border-ok" }[b.kind];
      const icon = { note: "ℹ Note", warning: "⚠ Watch out", analogy: "≈ Analogy", exact: "✓ Exact vs approximate" }[b.kind];
      return (
        <aside className={`rounded-lg border-l-4 ${tone} bg-card-2 px-4 py-3`}>
          <div className="mb-1 text-sm font-semibold">{icon}</div>
          <Rich md={b.md} />
        </aside>
      );
    }
    case "sim": {
      const C = SIM_COMPONENTS[b.slug];
      const meta = simulationBySlug(b.slug);
      if (!C || !meta) return <p className="text-bad">Missing simulation {b.slug}</p>;
      return (
        <figure className="space-y-2 rounded-xl border border-line bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <figcaption className="font-semibold">{meta.title}{b.caption ? <span className="font-normal text-muted"> — {b.caption}</span> : null}</figcaption>
            <Link href={`/simulations/${b.slug}${b.preset ? `?preset=${b.preset}` : ""}`} className="text-sm text-accent">Open full lab ↗</Link>
          </div>
          <C preset={b.preset} />
        </figure>
      );
    }
    case "steps":
      return <StepsView b={b} />;
    case "try": {
      const q: QuestionInstance = {
        templateId: `lesson:${lesson.slug}:${idx}`,
        seed: 0,
        skill: lesson.topic,
        prompt: b.prompt,
        answer: b.answer,
        hints: b.hints,
        solution: b.solution.map((s) => ({ text: s.md, tex: s.tex })),
        answerDisplay: b.answerDisplay,
        misconceptions: b.misconceptions?.map((m) => ({ id: m.id, feedback: m.feedback, detect: (s: string) => m.values.some((v) => { const a = parseRational(s), t = parseRational(v); return a && t ? a.equals(t) : s.trim() === v; }) })),
        exactness: "exact",
      };
      return <QuestionView q={q} label="Try it yourself" />;
    }
    case "symbols":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="mb-2 text-left text-muted">Every symbol, what it means, and what values it may take</caption>
            <thead><tr className="border-b border-line text-left"><th scope="col" className="py-1 pr-3">Symbol</th><th scope="col" className="pr-3">Name</th><th scope="col" className="pr-3">Meaning</th><th scope="col">Allowed values</th></tr></thead>
            <tbody>
              {b.items.map((it, i) => (
                <tr key={i} className="border-b border-line/50 align-top">
                  <td className="py-2 pr-3"><Tex tex={it.symbol} /></td>
                  <td className="py-2 pr-3 font-medium">{it.name}</td>
                  <td className="py-2 pr-3"><Rich md={it.meaning} /></td>
                  <td className="py-2 text-muted"><Rich md={it.values ?? ""} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return (
        <div className="space-y-2 rounded-lg border border-line bg-card-2 p-3">
          <div className="text-xs font-semibold uppercase text-muted">{b.lang === "python" ? "Python" : "R"} — run in your own environment</div>
          <pre className="overflow-x-auto rounded bg-bg p-3 font-mono text-sm"><code>{b.code}</code></pre>
          <Rich md={b.note} className="text-sm" />
          {b.computed && (
            <ul className="space-y-1 font-mono text-sm">
              {b.computed.map((c, i) => <li key={i}><span className="text-muted">{c.label} →</span> {c.value}</li>)}
            </ul>
          )}
        </div>
      );
    case "practice":
      return <PracticeSession templates={b.templates} count={b.count} seedKey={`lesson:${lesson.slug}:practice`} />;
    case "mastery":
      return <PracticeSession templates={b.templates} count={b.templates.length} seedKey={`lesson:${lesson.slug}:mastery`} mode="mastery" title="Mastery check" />;
    case "links":
      return (
        <ul className="grid gap-3 sm:grid-cols-2">
          {b.items.map((it, i) => {
            const href = it.kind === "lesson" ? (lessonBySlug(it.id) ? `/lesson/${it.id}` : `/learn`) : it.kind === "topic" ? `/learn/${it.id}` : it.kind === "sim" ? `/simulations/${it.id}` : `/academy/${it.id}`;
            const missing = it.kind === "lesson" && !lessonBySlug(it.id);
            return (
              <li key={i}>
                <Link href={missing ? `/learn` : href} className="block h-full rounded-xl border border-line bg-card p-4 no-underline hover:border-accent">
                  <div className="font-semibold">{it.label}{missing && <span className="ml-2 text-xs text-muted">(lesson not yet authored — opens the map)</span>}</div>
                  {it.why && <div className="mt-1 text-sm text-muted">{it.why}</div>}
                </Link>
              </li>
            );
          })}
        </ul>
      );
    case "table":
      return (
        <table className="w-full text-sm">
          <caption className="mb-1 text-left text-muted">{b.caption}</caption>
          <thead><tr>{b.head.map((h, i) => <th key={i} scope="col" className="border-b border-line px-2 py-1 text-left">{h}</th>)}</tr></thead>
          <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-line/50 px-2 py-1"><Rich md={c} /></td>)}</tr>)}</tbody>
        </table>
      );
  }
}

function StepsView({ b }: { b: Extract<Block, { t: "steps" }> }) {
  const [shown, setShown] = useState(1);
  const all = shown >= b.steps.length;
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      {b.title && <h3 className="mb-2 font-semibold">{b.title}</h3>}
      <ol className="space-y-3">
        {b.steps.slice(0, shown).map((s, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-fg">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <Rich md={s.md} />
              {s.tex && <Tex tex={s.tex} display />}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex gap-2 no-print">
        {!all && <button className="rounded-lg border border-line px-3 py-1.5 text-sm" onClick={() => setShown((n) => n + 1)}>Reveal next step ({shown}/{b.steps.length})</button>}
        {!all && <button className="rounded-lg px-3 py-1.5 text-sm text-muted underline" onClick={() => setShown(b.steps.length)}>Show all steps</button>}
        {all && b.steps.length > 1 && <button className="rounded-lg px-3 py-1.5 text-sm text-muted underline" onClick={() => setShown(1)}>Hide steps</button>}
      </div>
    </div>
  );
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const progress = useStore((s) => s.lessons[lesson.slug]);
  const mode = useStore((s) => s.settings.explanationMode);
  const bookmarks = useStore((s) => s.bookmarks);
  const note = useStore((s) => s.notes[`lesson:${lesson.slug}`]?.text ?? "");
  const returnTo = useStore((s) => s.returnTo);
  const stages = useMemo(() => STAGE_ORDER.map((id) => lesson.stages.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s), [lesson]);
  const [current, setCurrent] = useState<StageId>(stages[0].id);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (!restored && progress) {
      setCurrent(progress.stage);
      setRestored(true);
    }
  }, [progress, restored]);
  useEffect(() => {
    actions.setLastVisited(`/lesson/${lesson.slug}`, lesson.title);
  }, [lesson]);
  const go = (id: StageId, completePrev = true) => {
    actions.setLessonStage(lesson.slug, id, completePrev ? current : undefined);
    setCurrent(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const idx = stages.findIndex((s) => s.id === current);
  const stage = stages[idx] ?? stages[0];
  const completed = progress?.completed ?? [];
  const href = `/lesson/${lesson.slug}`;
  const bookmarked = bookmarks.some((b) => b.href === href);
  const topic = topicById(lesson.topic);

  return (
    <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)_260px]">
      <nav aria-label="Lesson stages" className="no-print lg:sticky lg:top-20 lg:self-start">
        <ol className="flex gap-1 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible">
          {stages.map((s, i) => {
            const done = completed.includes(s.id);
            return (
              <li key={s.id} className="shrink-0">
                <button onClick={() => go(s.id, false)} aria-current={s.id === current ? "step" : undefined} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${s.id === current ? "bg-card-2 font-semibold text-fg" : "text-muted hover:text-fg"}`}>
                  <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${done ? "border-ok text-ok" : "border-line"}`}>{done ? "✓" : i + 1}</span>
                  <span className="whitespace-nowrap lg:whitespace-normal">{STAGE_TITLES[s.id]}</span>
                  {done && <span className="sr-only">(completed)</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <article className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <Seg label="Explanation style" value={mode} onChange={(v) => actions.setExplanationMode(v as "simple" | "formal" | "university")} options={[{ id: "simple", label: "Simple" }, { id: "formal", label: "Formal" }, { id: "university", label: "University" }]} />
          <div className="flex gap-2 text-sm">
            <button className="rounded-lg border border-line px-3 py-1.5" aria-pressed={bookmarked} onClick={() => actions.toggleBookmark(href, lesson.title)}>{bookmarked ? "★ Bookmarked" : "☆ Bookmark"}</button>
            <button className="rounded-lg border border-line px-3 py-1.5" onClick={() => window.print()}>Print</button>
          </div>
        </div>
        <h2 className="text-xl font-bold">
          <span className="text-muted">Stage {idx + 1} of {stages.length} · </span>
          {STAGE_TITLES[stage.id]}
        </h2>
        <div className="space-y-5">
          {stage.blocks.map((b, i) => <BlockView key={`${stage.id}-${i}`} b={b} lesson={lesson} idx={`${stage.id}-${i}`} mode={mode} />)}
        </div>
        <div className="flex justify-between gap-3 border-t border-line pt-4 no-print">
          {idx > 0 ? <button className="rounded-lg border border-line px-4 py-2" onClick={() => go(stages[idx - 1].id, false)}>← {STAGE_TITLES[stages[idx - 1].id]}</button> : <span />}
          {idx < stages.length - 1 ? (
            <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg" onClick={() => go(stages[idx + 1].id)}>{STAGE_TITLES[stages[idx + 1].id]} →</button>
          ) : (
            <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg" onClick={() => actions.setLessonStage(lesson.slug, current, current)}>Mark lesson complete ✓</button>
          )}
        </div>
      </article>

      <aside className="space-y-4 no-print lg:sticky lg:top-20 lg:self-start" aria-label="Lesson tools">
        {returnTo && (
          <div className="rounded-xl border border-accent bg-card p-3 text-sm">
            <p className="text-muted">You came here from</p>
            <Link href={returnTo.href} className="font-semibold text-accent" onClick={() => actions.setReturnTo(null)}>↩ {returnTo.label}</Link>
          </div>
        )}
        <div className="rounded-xl border border-line bg-card p-3 text-sm">
          <p className="font-semibold">Topic</p>
          <Link href={`/learn/${lesson.topic}`} className="underline">{topic?.title}</Link>
          <p className="mt-1 text-muted">Level {lesson.level}: {topic?.level.title}</p>
          {lesson.bridgesFor?.length ? (
            <>
              <p className="mt-3 font-semibold">Prepares you for</p>
              <ul className="mt-1 space-y-1">{lesson.bridgesFor.map((c) => <li key={c}><Link href={`/academy/${c}`} className="underline">{chapterById(c)?.title}</Link></li>)}</ul>
            </>
          ) : null}
        </div>
        <div className="rounded-xl border border-line bg-card p-3">
          <label htmlFor="lesson-note" className="text-sm font-semibold">My notes</label>
          <textarea id="lesson-note" value={note} onChange={(e) => actions.setNote(`lesson:${lesson.slug}`, e.target.value)} rows={6} className="mt-1 w-full rounded-md border border-line bg-bg p-2 text-sm" placeholder="Saved in this browser automatically" />
        </div>
      </aside>
    </div>
  );
}
