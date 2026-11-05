import { describe, expect, it } from "vitest";
import { TEMPLATES, generateQuestion, checkAnswer, canonicalInput, buildPracticeSet, computeMastery, type AttemptEvidence } from "../src";

const SEEDS = 300;

describe("every question template", () => {
  for (const t of TEMPLATES) {
    it(`${t.id}: generates valid, self-consistent questions for ${SEEDS} seeds`, () => {
      for (let s = 1; s <= SEEDS; s++) {
        const q = generateQuestion(t.id, s);
        expect(q.prompt.length).toBeGreaterThan(10);
        expect(q.hints).toHaveLength(3);
        expect(q.solution.length).toBeGreaterThan(0);
        expect(q.prompt).not.toMatch(/undefined|NaN|Infinity/);
        expect(q.answerDisplay).not.toMatch(/undefined|NaN|Infinity/);
        for (const h of q.hints) expect(h).not.toMatch(/undefined|NaN/);
        // the canonical answer must be accepted
        const res = checkAnswer(q, canonicalInput(q));
        if (!res.correct) throw new Error(`${t.id} seed ${s}: canonical answer ${canonicalInput(q)} rejected (${res.feedback}) for prompt: ${q.prompt}`);
      }
    });
    it(`${t.id}: is deterministic per seed`, () => {
      const a = generateQuestion(t.id, 42);
      const b = generateQuestion(t.id, 42);
      expect(a.prompt).toBe(b.prompt);
      expect(canonicalInput(a)).toBe(canonicalInput(b));
    });
    it(`${t.id}: varies across seeds`, () => {
      const prompts = new Set(Array.from({ length: 20 }, (_, i) => generateQuestion(t.id, i + 1).prompt));
      expect(prompts.size).toBeGreaterThan(t.id === "contrapositive" ? 2 : 5);
    });
  }
});

describe("answer checking", () => {
  const find = (id: string, pred: (q: ReturnType<typeof generateQuestion>) => boolean) => {
    for (let s = 1; s < 5000; s++) {
      const q = generateQuestion(id, s);
      if (pred(q)) return q;
    }
    throw new Error("no matching seed");
  };

  it("fraction addition: accepts equivalent forms, flags the add-denominators misconception", () => {
    const q = find("fraction-add-unlike", (q) => q.prompt.includes("\\frac{1}{2} + \\frac{1}{3}"));
    expect(checkAnswer(q, "5/6").correct).toBe(true);
    expect(checkAnswer(q, "10/12").correct).toBe(true);
    expect(checkAnswer(q, "10/12").verdict).toBe("correct-unsimplified");
    const wrong = checkAnswer(q, "2/5");
    expect(wrong.correct).toBe(false);
    expect(wrong.misconceptionId).toBe("add-tops-and-bottoms");
    const approx = checkAnswer(q, "0.833");
    expect(approx.verdict).toBe("close");
    expect(checkAnswer(q, "5/0").verdict).toBe("invalid");
  });

  it("never uses string equality for maths: expression answers accept equivalent forms", () => {
    const q = generateQuestion("chain-rule-power", 7);
    const a = q.answer;
    if (a.kind !== "expression") throw new Error();
    expect(checkAnswer(q, a.value).correct).toBe(true);
    // expanded-by-hand equivalent: sample check via a different but equal form
    expect(checkAnswer(q, `(${a.value})*1 + 0`).correct).toBe(true);
    expect(checkAnswer(q, "x").correct).toBe(false);
    expect(checkAnswer(q, "x = 2").verdict).toBe("invalid");
  });

  it("numeric answers respect the requested rounding", () => {
    const q = generateQuestion("normal-probability", 3);
    if (q.answer.kind !== "numeric") throw new Error();
    const v = q.answer.value;
    expect(checkAnswer(q, v.toFixed(4)).correct).toBe(true);
    expect(checkAnswer(q, (v + 0.002).toFixed(4)).correct).toBe(false);
  });

  it("detects the P(A|B) vs P(B|A) confusion in Bayes questions", () => {
    const q = generateQuestion("bayes-test", 11);
    const sens = Number(q.prompt.match(/detects it in (\d+(?:\.\d+)?)%/)![1]) / 100;
    expect(checkAnswer(q, String(sens)).misconceptionId).toBe("inverse-conditional");
  });

  it("detects a sign error in signed subtraction", () => {
    const q = find("signed-subtract", (q) => q.prompt.includes("- (-"));
    const m = q.prompt.match(/\$(-?\d+) - \((-\d+)\)\$/)!;
    const a = Number(m[1]), b = Number(m[2]);
    expect(checkAnswer(q, String(a + b)).misconceptionId).toBe("forgot-opposite");
  });

  it("multi-part answers give partial credit", () => {
    const q = generateQuestion("matrix-product-2x2", 5);
    if (q.answer.kind !== "tuple") throw new Error();
    const parts = q.answer.values.slice();
    parts[0] = String(Number(parts[0]) + 1);
    const r = checkAnswer(q, parts.join("|"));
    expect(r.correct).toBe(false);
    expect(r.partialCredit).toBeCloseTo(0.75);
  });
});

describe("practice sets", () => {
  it("are reproducible and mix templates", () => {
    const a = buildPracticeSet(["fraction-add-sub", "negative-numbers"], 6, "set-1");
    const b = buildPracticeSet(["fraction-add-sub", "negative-numbers"], 6, "set-1");
    expect(a.map((q) => q.prompt)).toEqual(b.map((q) => q.prompt));
    expect(new Set(a.map((q) => q.templateId)).size).toBeGreaterThanOrEqual(3);
    const c = buildPracticeSet(["fraction-add-sub", "negative-numbers"], 6, "set-2");
    expect(c.map((q) => q.prompt)).not.toEqual(a.map((q) => q.prompt));
  });
});

describe("mastery model", () => {
  const t0 = Date.UTC(2026, 10, 1);
  const att = (i: number, templateId: string, correct: boolean, hints = 0, dayOffset = 0): AttemptEvidence => ({
    skill: "fraction-add-sub", templateId, correct, partialCredit: correct ? 1 : 0, hintsUsed: hints, revealedSolution: false, at: t0 + dayOffset * 86_400_000 + i * 60_000,
  });
  it("needs 3 correct across 2 templates with a high score", () => {
    expect(computeMastery("fraction-add-sub", [att(0, "a", true), att(1, "a", true), att(2, "a", true)], t0).level).toBe("practising");
    expect(computeMastery("fraction-add-sub", [att(0, "a", true), att(1, "b", true), att(2, "a", true)], t0).level).toBe("mastered");
  });
  it("hints reduce evidence", () => {
    const m = computeMastery("fraction-add-sub", [att(0, "a", true, 3), att(1, "b", true, 3), att(2, "a", true, 3)], t0);
    expect(m.score).toBeCloseTo(0.4, 6);
    expect(m.level).toBe("learning");
  });
  it("schedules spaced review and flags overdue skills", () => {
    const as = [att(0, "a", true), att(1, "b", true), att(2, "a", true)];
    const m = computeMastery("fraction-add-sub", as, t0);
    expect(m.nextReviewAt).toBe(as[2].at + 86_400_000);
    expect(computeMastery("fraction-add-sub", as, t0 + 3 * 86_400_000).level).toBe("review-needed");
    const reviewed = [...as, att(0, "b", true, 0, 1)];
    const m2 = computeMastery("fraction-add-sub", reviewed, t0 + 2 * 86_400_000);
    expect(m2.reviewStreak).toBe(1);
    expect(m2.level).toBe("mastered");
  });
});
