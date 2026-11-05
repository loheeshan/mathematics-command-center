import { Rational, parseRational, expressionsEquivalent, ExpressionError, parseExpression, fmt } from "@mcc/math-engine";
import type { AnswerSpec, CheckResult, QuestionInstance } from "./types";

const ok = (feedback = "Correct."): CheckResult => ({ verdict: "correct", correct: true, feedback, partialCredit: 1 });
const no = (feedback: string, partialCredit = 0): CheckResult => ({ verdict: "incorrect", correct: false, feedback, partialCredit });
const invalid = (feedback: string): CheckResult => ({ verdict: "invalid", correct: false, feedback, partialCredit: 0 });

/** Parse a plain number (allows −, commas as thousand separators, fractions and simple expressions like 3/4 or 2^10). */
export function parseNumberLoose(raw: string): number | null {
  const s = raw.trim().replace(/[−–]/g, "-").replace(/,(?=\d{3}\b)/g, "");
  if (!s) return null;
  const r = parseRational(s);
  if (r) return r.toNumber();
  try {
    const v = parseExpression(s, []).evaluate();
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function checkRational(spec: Extract<AnswerSpec, { kind: "rational" }>, input: string): CheckResult {
  const target = parseRational(spec.value);
  if (!target) throw new Error(`bad rational spec ${spec.value}`);
  const s = input.trim().replace(/[−–]/g, "-");
  const isDecimal = /^[+-]?\d*\.\d+$/.test(s);
  const r = parseRational(s);
  if (!r) {
    if (/\/\s*0+\s*$/.test(s)) return invalid("A denominator can never be 0 — dividing a whole into 0 equal parts is meaningless.");
    return invalid("Enter a fraction like 5/6, a mixed number like 1 1/2, or an integer.");
  }
  if (r.equals(target)) {
    if (isDecimal && spec.acceptDecimal === false) return { verdict: "close", correct: false, feedback: "That decimal is equal, but this question asks for a fraction.", partialCredit: 0.5 };
    const m = s.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
    if (m) {
      const n = Math.abs(Number(m[1]));
      const d = Math.abs(Number(m[2]));
      if (n !== Math.abs(target.n) || d !== target.d) {
        if (spec.requireSimplest) return { verdict: "correct-unsimplified", correct: false, feedback: `Your value is right, but ${n}/${d} is not in lowest terms: top and bottom share a common factor. Divide both by it.`, partialCredit: 0.7 };
        return { verdict: "correct-unsimplified", correct: true, feedback: `Correct value. In lowest terms it is ${target.toString()}.`, partialCredit: 1 };
      }
    }
    return ok();
  }
  // approximation of a non-terminating value
  if (isDecimal && Math.abs(r.toNumber() - target.toNumber()) < 0.006) {
    return { verdict: "close", correct: false, feedback: `Very close — but ${s} is a rounded approximation. The exact answer is a fraction; give it exactly.`, partialCredit: 0.5 };
  }
  return no("Not quite.");
}

function checkNumeric(spec: Extract<AnswerSpec, { kind: "numeric" }>, input: string): CheckResult {
  const v = parseNumberLoose(input.replace(spec.unit ? new RegExp(`\\s*${spec.unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`) : /$^/, ""));
  if (v === null) return invalid("Enter a number (you can use fractions like 3/4 or decimals like 0.75).");
  const tol = spec.abs ?? (spec.dp !== undefined ? 0.5 * 10 ** -spec.dp + 1e-12 : Math.max(1e-9, (spec.rel ?? 1e-6) * Math.abs(spec.value)));
  if (Math.abs(v - spec.value) <= tol) return ok();
  if (spec.dp !== undefined && Math.abs(v - spec.value) <= 10 * tol) return { verdict: "close", correct: false, feedback: `Close. Check your rounding to ${spec.dp} decimal place${spec.dp === 1 ? "" : "s"}.`, partialCredit: 0.5 };
  return no("Not quite.");
}

function checkExpression(spec: Extract<AnswerSpec, { kind: "expression" }>, input: string): CheckResult {
  try {
    const eq = expressionsEquivalent(input, spec.value, { variables: spec.variables, domain: spec.domain });
    return eq ? ok("Correct — your expression is equivalent.") : no("That expression is not equivalent to the answer.");
  } catch (e) {
    if (e instanceof ExpressionError) return invalid(e.message);
    return invalid("Could not read that expression.");
  }
}

function checkChoice(spec: Extract<AnswerSpec, { kind: "choice" }>, input: string): CheckResult {
  const chosen = input.split(",").map((s) => s.trim()).filter(Boolean).sort();
  const correct = spec.correct.slice().sort();
  if (chosen.length === 0) return invalid("Choose an option.");
  if (chosen.join() === correct.join()) return ok();
  if (correct.length > 1) {
    const hits = chosen.filter((c) => correct.includes(c)).length;
    const wrong = chosen.length - hits;
    const credit = Math.max(0, (hits - wrong) / correct.length);
    return no(`${hits} of ${correct.length} correct choices selected${wrong ? `, plus ${wrong} incorrect` : ""}.`, credit);
  }
  return no("Not quite.");
}

function checkTuple(spec: Extract<AnswerSpec, { kind: "tuple" }>, input: string): CheckResult {
  const parts = input.split("|");
  if (parts.length !== spec.values.length || parts.some((p) => !p.trim())) return invalid(`Fill in all ${spec.values.length} parts.`);
  let right = 0;
  spec.values.forEach((val, i) => {
    const t = parseRational(val);
    const a = parseNumberLoose(parts[i]);
    if (t && a !== null && Math.abs(a - t.toNumber()) < 1e-9) right++;
  });
  if (right === spec.values.length) return ok();
  return no(`${right} of ${spec.values.length} parts are correct.`, right / spec.values.length);
}

function checkBooleanList(spec: Extract<AnswerSpec, { kind: "boolean-list" }>, input: string): CheckResult {
  const parts = input.split(",").map((s) => s.trim().toUpperCase());
  if (parts.length !== spec.values.length || parts.some((p) => p !== "T" && p !== "F")) return invalid("Mark every row T or F.");
  const right = parts.filter((p, i) => (p === "T") === spec.values[i]).length;
  if (right === spec.values.length) return ok();
  return no(`${right} of ${spec.values.length} rows are correct.`, right / spec.values.length);
}

export function checkAnswer(q: QuestionInstance, input: string): CheckResult {
  const spec = q.answer;
  let result: CheckResult;
  switch (spec.kind) {
    case "rational":
      result = checkRational(spec, input);
      break;
    case "numeric":
      result = checkNumeric(spec, input);
      break;
    case "integer": {
      const v = parseNumberLoose(input);
      result = v === null ? invalid("Enter a whole number.") : v === spec.value ? ok() : no("Not quite.");
      break;
    }
    case "expression":
      result = checkExpression(spec, input);
      break;
    case "choice":
      result = checkChoice(spec, input);
      break;
    case "tuple":
      result = checkTuple(spec, input);
      break;
    case "boolean-list":
      result = checkBooleanList(spec, input);
      break;
  }
  if (!result.correct && result.verdict !== "invalid" && q.misconceptions) {
    for (const m of q.misconceptions) {
      let hit = false;
      try {
        hit = m.detect(input);
      } catch {
        hit = false;
      }
      if (hit) return { ...result, feedback: m.feedback, misconceptionId: m.id };
    }
  }
  return result;
}

/** The canonical answer string that `checkAnswer` must accept (used by tests and "show answer"). */
export function canonicalInput(q: QuestionInstance): string {
  const a = q.answer;
  switch (a.kind) {
    case "rational":
      return a.value;
    case "numeric":
      return a.dp !== undefined ? a.value.toFixed(a.dp) : fmt(a.value, 12);
    case "integer":
      return String(a.value);
    case "expression":
      return a.value;
    case "choice":
      return a.correct.join(",");
    case "tuple":
      return a.values.join("|");
    case "boolean-list":
      return a.values.map((b) => (b ? "T" : "F")).join(",");
  }
}

/** helpers for misconception detectors */
export const ratEq = (input: string, value: Rational | number) => {
  const r = parseRational(input);
  return r !== null && r.equals(value);
};
export const numEq = (input: string, value: number, tol = 1e-6) => {
  const v = parseNumberLoose(input);
  return v !== null && Math.abs(v - value) <= tol * Math.max(1, Math.abs(value));
};
