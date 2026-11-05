"use client";
import { useId, useMemo, useState } from "react";
import { checkAnswer, type CheckResult, type QuestionInstance } from "@mcc/question-engine";
import { toTex } from "@mcc/math-engine";
import { Rich, Tex } from "./Rich";
import { actions } from "@/lib/store";

export interface QuestionOutcome {
  correct: boolean;
  firstTry: boolean;
  hintsUsed: number;
  revealedSolution: boolean;
}

/**
 * One question with: answer input appropriate to its type, progressive hints
 * (concept → setup → next step), checking with misconception-aware feedback, and a
 * worked solution that is only shown when the learner asks.
 * Records exactly one mastery attempt per question.
 */
export function QuestionView({ q, onDone, record = true, label, examMode = false }: { q: QuestionInstance; onDone?: (o: QuestionOutcome) => void; record?: boolean; label?: string; examMode?: boolean }) {
  const id = useId();
  const [input, setInput] = useState("");
  const [parts, setParts] = useState<string[]>(() => (q.answer.kind === "tuple" ? q.answer.values.map(() => "") : q.answer.kind === "boolean-list" ? q.answer.values.map(() => "") : []));
  const [chosen, setChosen] = useState<string[]>([]);
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [tries, setTries] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [done, setDone] = useState(false);
  const [bestCredit, setBestCredit] = useState(0);

  const multi = q.answer.kind === "choice" && q.answer.correct.length > 1;
  const raw = () => {
    if (q.answer.kind === "choice") return chosen.join(",");
    if (q.answer.kind === "tuple") return parts.join("|");
    if (q.answer.kind === "boolean-list") return parts.join(",");
    return input;
  };

  const finalize = (correct: boolean, credit: number, revealed: boolean) => {
    if (done) return;
    setDone(true);
    if (record) {
      actions.recordAttempt({ skill: q.skill, templateId: q.templateId, correct, partialCredit: correct ? (tries === 0 ? 1 : tries === 1 ? 0.6 : 0.3) : credit, hintsUsed: hints, revealedSolution: revealed, at: Date.now() });
    }
    onDone?.({ correct, firstTry: correct && tries === 0, hintsUsed: hints, revealedSolution: revealed });
  };

  const check = () => {
    const r = checkAnswer(q, raw());
    if (examMode) {
      if (r.verdict === "invalid") {
        setResult(r);
        return;
      }
      setResult({ ...r, feedback: "Answer recorded. Results and worked solutions appear at the end.", verdict: "close" });
      finalize(r.correct, r.partialCredit, false);
      return;
    }
    setResult(r);
    if (r.verdict === "invalid") return;
    setBestCredit((b) => Math.max(b, r.partialCredit));
    if (r.correct) finalize(true, 1, showSolution);
    setTries((t) => t + 1);
  };

  const exprPreview = useMemo(() => {
    if (q.answer.kind !== "expression" || !input.trim()) return null;
    try {
      return toTex(input, q.answer.variables);
    } catch {
      return null;
    }
  }, [input, q.answer]);

  const feedbackTone = !result ? "" : examMode && result.verdict !== "invalid" ? "border-info text-info" : result.correct ? "border-ok text-ok" : result.verdict === "invalid" ? "border-warn text-warn" : result.verdict === "close" ? "border-info text-info" : "border-bad text-bad";
  const feedbackIcon = !result ? "" : examMode && result.verdict !== "invalid" ? "Saved" : result.correct ? "✓ Correct" : result.verdict === "invalid" ? "⚠ Check your input" : result.verdict === "close" ? "≈ Nearly" : "✗ Not yet";

  return (
    <section aria-labelledby={`${id}-p`} className="rounded-xl border border-line bg-card p-4 sm:p-5">
      {label && <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">{label}</div>}
      <div id={`${id}-p`} className="text-[1.05rem]"><Rich md={q.prompt} /></div>

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!done) check();
        }}
      >
        {(q.answer.kind === "rational" || q.answer.kind === "numeric" || q.answer.kind === "integer" || q.answer.kind === "expression") && (
          <div>
            <label htmlFor={`${id}-in`} className="sr-only">Your answer</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id={`${id}-in`}
                value={input}
                disabled={done}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                inputMode={q.answer.kind === "expression" ? "text" : "decimal"}
                placeholder={q.answer.kind === "rational" ? "e.g. 5/6 or 1 1/2" : q.answer.kind === "expression" ? "e.g. 2x + 3" : "Your answer"}
                className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 font-mono text-fg disabled:opacity-70"
                aria-describedby={`${id}-help`}
              />
              {q.answer.kind === "numeric" && q.answer.unit && <span className="text-muted">{q.answer.unit}</span>}
            </div>
            <p id={`${id}-help`} className="mt-1 text-xs text-muted">
              {q.inputHelp ?? (q.answer.kind === "numeric" && q.answer.dp !== undefined ? `Round to ${q.answer.dp} decimal place${q.answer.dp === 1 ? "" : "s"}.` : q.answer.kind === "rational" ? "Fractions (5/6), mixed numbers (1 1/2), integers or exact decimals." : "")}
            </p>
            {exprPreview && (
              <p className="mt-1 text-sm text-muted" aria-live="polite">
                Reads as: <Tex tex={exprPreview} />
              </p>
            )}
          </div>
        )}

        {q.answer.kind === "choice" && (
          <fieldset>
            <legend className="sr-only">{multi ? "Choose all that apply" : "Choose one"}</legend>
            <div className="grid gap-2">
              {q.answer.options.map((o) => (
                <label key={o.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 ${chosen.includes(o.id) ? "border-accent bg-card-2" : "border-line"}`}>
                  <input
                    type={multi ? "checkbox" : "radio"}
                    name={`${id}-c`}
                    disabled={done}
                    checked={chosen.includes(o.id)}
                    onChange={() => setChosen((c) => (multi ? (c.includes(o.id) ? c.filter((x) => x !== o.id) : [...c, o.id]) : [o.id]))}
                    className="mt-1.5 accent-[var(--accent)]"
                  />
                  <Rich md={o.label} />
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {q.answer.kind === "tuple" && (
          <div className="flex flex-wrap gap-3">
            {q.answer.labels.map((l, i) => (
              <label key={i} className="flex flex-col text-sm text-muted">
                {l}
                <input value={parts[i]} disabled={done} onChange={(e) => setParts((p) => p.map((x, j) => (j === i ? e.target.value : x)))} className="mt-1 w-28 rounded-lg border border-line bg-bg px-3 py-2 font-mono text-fg" autoComplete="off" />
              </label>
            ))}
          </div>
        )}

        {q.answer.kind === "boolean-list" && (
          <table className="text-sm">
            <caption className="sr-only">Mark each row true or false</caption>
            <tbody>
              {q.answer.labels.map((l, i) => (
                <tr key={i}>
                  <th scope="row" className="pr-4 text-left font-mono font-normal text-muted">{l}</th>
                  <td className="py-1">
                    <div role="radiogroup" aria-label={`Row ${i + 1}: ${l}`} className="flex gap-1">
                      {(["T", "F"] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          role="radio"
                          aria-checked={parts[i] === v}
                          disabled={done}
                          onClick={() => setParts((p) => p.map((x, j) => (j === i ? v : x)))}
                          className={`w-10 rounded border px-2 py-1 font-mono ${parts[i] === v ? "border-accent bg-accent text-accent-fg" : "border-line"}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex flex-wrap gap-2">
          {!done && (
            <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg">
              Check
            </button>
          )}
          {!done && !examMode && hints < 3 && (
            <button type="button" onClick={() => setHints((h) => h + 1)} className="rounded-lg border border-line px-4 py-2">
              {hints === 0 ? "Hint 1: concept" : hints === 1 ? "Hint 2: set-up" : "Hint 3: next step"}
            </button>
          )}
          {!showSolution && !examMode && (
            <button
              type="button"
              onClick={() => {
                setShowSolution(true);
                if (!done) finalize(false, bestCredit, true);
              }}
              className="rounded-lg border border-line px-4 py-2 text-muted"
              title={done ? "" : "Revealing the solution means this question won't count towards mastery"}
            >
              Show worked solution{!done && <span className="sr-only"> (won’t count towards mastery)</span>}
            </button>
          )}
          {!done && !examMode && tries > 0 && (
            <button type="button" onClick={() => finalize(false, bestCredit, false)} className="rounded-lg px-3 py-2 text-sm text-muted underline">
              Skip
            </button>
          )}
        </div>
      </form>

      <div aria-live="polite" className="mt-3 space-y-2">
        {result && (
          <div className={`rounded-lg border-l-4 bg-card-2 px-3 py-2 ${feedbackTone}`}>
            <div className="font-semibold">{feedbackIcon}</div>
            <div className="text-fg"><Rich md={result.feedback} /></div>
          </div>
        )}
        {hints > 0 && (
          <ol className="space-y-2">
            {q.hints.slice(0, hints).map((h, i) => (
              <li key={i} className="rounded-lg border border-line bg-card-2 px-3 py-2 text-sm">
                <span className="font-semibold text-info">Hint {i + 1}. </span>
                <Rich md={h} className="inline" />
              </li>
            ))}
          </ol>
        )}
        {showSolution && (
          <div className="rounded-lg border border-line bg-card-2 p-3">
            <div className="mb-1 font-semibold">Worked solution {q.exactness === "approximate" && <span className="ml-2 rounded bg-card px-1.5 py-0.5 text-xs text-muted">rounded answer</span>}</div>
            <ol className="list-decimal space-y-2 pl-5">
              {q.solution.map((s, i) => (
                <li key={i}>
                  {s.text && <Rich md={s.text} />}
                  {s.tex && <Tex tex={s.tex} display />}
                </li>
              ))}
            </ol>
            <div className="mt-2 text-sm">
              Answer: <Rich md={q.answerDisplay} className="inline" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
