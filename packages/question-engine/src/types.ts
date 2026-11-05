import type { Rng } from "@mcc/math-engine";

/**
 * Text fields use "MCC markdown-lite": paragraphs, **bold**, `code`, and inline TeX in $…$
 * (display TeX in $$…$$). They are rendered with KaTeX — never as raw HTML.
 */
export type RichText = string;

export type AnswerSpec =
  | {
      kind: "rational";
      /** exact value as "p/q" or integer */
      value: string;
      /** accept a terminating decimal equal to the value (default true) */
      acceptDecimal?: boolean;
      /** require lowest terms (default false: equivalent fractions are accepted and gently noted) */
      requireSimplest?: boolean;
    }
  | {
      kind: "numeric";
      value: number;
      /** absolute tolerance; default derived from `dp` or 1e-6 relative */
      abs?: number;
      rel?: number;
      /** decimal places the learner is asked to round to (sets tolerance to half a unit in that place) */
      dp?: number;
      unit?: string;
    }
  | { kind: "integer"; value: number }
  | { kind: "expression"; value: string; variables: string[]; domain?: [number, number] }
  | { kind: "choice"; options: { id: string; label: RichText }[]; correct: string[] }
  | { kind: "tuple"; values: string[]; labels: string[] }
  | { kind: "boolean-list"; values: boolean[]; labels: string[] };

export interface Misconception {
  id: string;
  /** returns true when the learner input matches this misconception */
  detect: (input: string) => boolean;
  feedback: RichText;
}

export interface SolutionStep {
  text: RichText;
  tex?: string;
}

export interface QuestionInstance {
  templateId: string;
  seed: number;
  skill: string;
  prompt: RichText;
  answer: AnswerSpec;
  /** exactly three progressive hints: concept → setup → next operation */
  hints: [RichText, RichText, RichText];
  solution: SolutionStep[];
  /** human-readable correct answer, shown only after attempts or on request */
  answerDisplay: RichText;
  misconceptions?: Misconception[];
  inputHelp?: string;
  /** whether the displayed answer is exact or a rounded approximation */
  exactness: "exact" | "approximate";
}

export interface QuestionTemplate {
  id: string;
  skill: string;
  title: string;
  difficulty: 1 | 2 | 3;
  /** representation family, used for mastery diversity (e.g. "symbolic", "word-problem", "visual") */
  representation: "symbolic" | "word-problem" | "visual" | "conceptual";
  generate: (rng: Rng) => Omit<QuestionInstance, "templateId" | "seed" | "skill">;
}

export type Verdict = "correct" | "correct-unsimplified" | "close" | "incorrect" | "invalid";

export interface CheckResult {
  verdict: Verdict;
  correct: boolean;
  feedback: RichText;
  misconceptionId?: string;
  /** 0..1, for multi-part answers */
  partialCredit: number;
}
