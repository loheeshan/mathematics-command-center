import { Rational, expressionsEquivalent } from "@mcc/math-engine";
import type { QuestionTemplate } from "../types";
import { numEq, ratEq } from "../check";

const R = (n: number, d = 1) => new Rational(n, d);
const safeEq = (a: string, b: string) => {
  try {
    return expressionsEquivalent(a, b);
  } catch {
    return false;
  }
};
const signed = (k: number, first = false) => (k < 0 ? `- ${-k}` : first ? `${k}` : `+ ${k}`);
/** "3x" / "-x" / "x" coefficient printing */
const coef = (k: number, v = "x", first = true) => {
  const s = Math.abs(k) === 1 ? v : `${Math.abs(k)}${v}`;
  if (first) return k < 0 ? `-${s}` : s;
  return k < 0 ? `- ${s}` : `+ ${s}`;
};

export const algebraTemplates: QuestionTemplate[] = [
  {
    id: "substitute-quadratic",
    skill: "substitution",
    title: "Substitute into a formula",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const a = rng.intExcept(-4, 5, [0]);
      const b = rng.intExcept(-6, 6, [0]);
      const c = rng.int(-9, 9);
      const x = rng.intExcept(-4, 4, [0, 1]);
      const ans = a * x * x + b * x + c;
      const wrongSquare = a * -(x * x) + b * x + c; // treating (-x)^2 as -x^2
      return {
        prompt: `Find the value of $${coef(a, "x^2")} ${coef(b, "x", false)} ${c === 0 ? "" : signed(c)}$ when $x = ${x}$.`,
        answer: { kind: "integer", value: ans },
        hints: [
          "Replace every $x$ with the number **in brackets**, then follow the order of operations.",
          `Write it as $${a}(${x})^2 + ${b < 0 ? `(${b})` : b}(${x})${c === 0 ? "" : ` + ${c < 0 ? `(${c})` : c}`}$.`,
          `Square first: $(${x})^2 = ${x * x}$.`,
        ],
        solution: [
          { text: "Substitute with brackets:", tex: `${a}(${x})^2 + (${b})(${x}) + (${c})` },
          { text: "Powers first:", tex: `${a}\\times${x * x} + (${b * x}) + (${c})` },
          { text: "Multiply, then add:", tex: `${a * x * x} + (${b * x}) + (${c}) = ${ans}` },
        ],
        answerDisplay: `$${ans}$`,
        misconceptions: [{ id: "negative-square", detect: (s) => x < 0 && numEq(s, wrongSquare) && wrongSquare !== ans, feedback: `Careful: $(${x})^2 = ${x * x}$, not $${-x * x}$. Squaring a negative number gives a positive result — that is why the brackets matter.` }],
        exactness: "exact",
      };
    },
  },
  {
    id: "simplify-linear-expression",
    skill: "expressions-simplify",
    title: "Expand and simplify",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const p = rng.int(2, 6);
      const q = rng.intExcept(-7, 7, [0]);
      const r = rng.intExcept(-5, 5, [0, 1, -p]);
      const s = rng.intExcept(-7, 7, [0]);
      const X = p + r;
      const C = p * q + r * s;
      const answer = `${X}*x + ${C}`;
      return {
        prompt: `Expand and simplify $${p}(x ${signed(q)}) ${r < 0 ? "-" : "+"} ${Math.abs(r)}(x ${signed(s)})$. Type your answer using x, e.g. 5x - 2.`,
        answer: { kind: "expression", value: answer, variables: ["x"] },
        hints: [
          "Multiply the number outside each bracket by **every** term inside it.",
          `First bracket: $${p}x ${signed(p * q)}$. Second bracket: $${coef(r)} ${signed(r * s)}$ (keep the sign of ${r}).`,
          `Collect the $x$ terms ($${p}x$ and $${coef(r)}$) and the numbers (${p * q} and ${r * s}).`,
        ],
        solution: [
          { text: "Expand:", tex: `${p}x ${signed(p * q)} ${coef(r, "x", false)} ${signed(r * s)}` },
          { text: "Collect like terms:", tex: `${X === 0 ? "" : coef(X)} ${X === 0 ? C : signed(C)}` },
        ],
        answerDisplay: `$${X === 0 ? C : `${coef(X)} ${C === 0 ? "" : signed(C)}`}$`,
        misconceptions: [
          { id: "partial-distribution", detect: (inp) => C !== p * q + s && safeEq(inp, `${X}*x + ${p * q + s}`), feedback: `You multiplied ${r} by $x$ but not by ${s}. The number outside a bracket multiplies **every** term inside.` },
          { id: "dropped-sign", detect: (inp) => r < 0 && safeEq(inp, `${X}*x + ${p * q - r * s}`), feedback: `The minus sign in front of the second bracket belongs to ${r}: it changes the sign of **both** terms inside.` },
        ],
        exactness: "exact",
        inputHelp: "Examples: 3x + 4, -2x - 7, 5",
      };
    },
  },
  {
    id: "linear-one-side",
    skill: "linear-equations",
    title: "Solve ax + b = c",
    difficulty: 1,
    representation: "symbolic",
    generate(rng) {
      const a = rng.intExcept(-9, 9, [0, 1]);
      const b = rng.intExcept(-15, 15, [0]);
      const x = rng.next() < 0.7 ? R(rng.int(-10, 10)) : R(rng.intExcept(-9, 9, [0]), Math.abs(a));
      const c = x.mul(a).add(b);
      if (!c.isInteger()) return algebraTemplates[2].generate(rng);
      return {
        prompt: `Solve for $x$: $${coef(a)} ${signed(b)} = ${c.toString()}$`,
        answer: { kind: "rational", value: x.toString() },
        hints: [
          "Keep the equation balanced: whatever you do to one side, do to the other.",
          `Undo the ${b > 0 ? "+" : "−"}${Math.abs(b)} first: ${b > 0 ? "subtract" : "add"} ${Math.abs(b)} on both sides.`,
          `You get $${coef(a)} = ${c.sub(b).toString()}$. Now divide both sides by ${a}.`,
        ],
        solution: [
          { text: `${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)} on both sides:`, tex: `${coef(a)} = ${c.toString()} ${b > 0 ? "-" : "+"} ${Math.abs(b)} = ${c.sub(b).toString()}` },
          { text: `Divide both sides by ${a}:`, tex: `x = \\frac{${c.sub(b).toString()}}{${a}} = ${x.toTex()}` },
          { text: "Check by substituting back:", tex: `${a}\\left(${x.toTex()}\\right) ${signed(b)} = ${c.toString()}\\ \\checkmark` },
        ],
        answerDisplay: `$x = ${x.toTex()}$`,
        misconceptions: [
          { id: "wrong-inverse", detect: (s) => ratEq(s, c.add(b).div(a)) && !c.add(b).div(a).equals(x), feedback: `To undo $${signed(b)}$ you must do the *opposite*: ${b > 0 ? "subtract" : "add"} ${Math.abs(b)}.` },
          { id: "sign-error", detect: (s) => ratEq(s, x.neg()) && !x.equals(0), feedback: `Check the sign: dividing by ${a} ${a < 0 ? "(a negative number) flips the sign" : "keeps the sign"}. Substitute your answer back to test it.` },
          { id: "multiplied", detect: (s) => ratEq(s, c.sub(b).mul(a)), feedback: `You multiplied by ${a}. To undo "×${a}" you **divide** by ${a}.` },
        ],
        exactness: "exact",
        inputHelp: "Fractions like -7/3 are fine.",
      };
    },
  },
  {
    id: "linear-both-sides",
    skill: "linear-equations",
    title: "Solve ax + b = cx + d",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      let a: number, c: number;
      do {
        a = rng.intExcept(-8, 9, [0]);
        c = rng.intExcept(-8, 9, [0]);
      } while (a === c);
      const x = R(rng.int(-8, 8));
      const b = rng.int(-12, 12);
      const d = x.mul(a - c).add(b).toNumber();
      return {
        prompt: `Solve for $x$: $${coef(a)} ${b === 0 ? "" : signed(b)} = ${coef(c)} ${d === 0 ? "" : signed(d)}$`,
        answer: { kind: "rational", value: x.toString() },
        hints: [
          "Collect the $x$ terms on one side and the numbers on the other — always doing the same to both sides.",
          `Subtract $${coef(c)}$ from both sides to get $${coef(a - c)} ${b === 0 ? "" : signed(b)} = ${d}$.`,
          `${b === 0 ? "" : `${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)} on both sides, then `}divide by ${a - c}.`,
        ],
        solution: [
          { text: `Subtract $${coef(c)}$ from both sides:`, tex: `${coef(a - c)} ${b === 0 ? "" : signed(b)} = ${d}` },
          { text: "Move the constant:", tex: `${coef(a - c)} = ${d - b}` },
          { text: "Divide:", tex: `x = \\frac{${d - b}}{${a - c}} = ${x.toTex()}` },
        ],
        answerDisplay: `$x = ${x.toTex()}$`,
        misconceptions: [{ id: "added-x-terms", detect: (s) => a + c !== 0 && ratEq(s, R(d - b, a + c)) && !R(d - b, a + c).equals(x), feedback: `Moving $${coef(c)}$ across means **subtracting** it from both sides, giving $${coef(a - c)}$, not $${coef(a + c)}$.` }],
        exactness: "exact",
      };
    },
  },
  {
    id: "slope-two-points",
    skill: "slope-intercept",
    title: "Slope through two points",
    difficulty: 2,
    representation: "visual",
    generate(rng) {
      const x1 = rng.int(-6, 6);
      const y1 = rng.int(-6, 6);
      const x2 = rng.intExcept(-6, 6, [x1]);
      const y2 = rng.intExcept(-6, 6, [y1]);
      const m = R(y2 - y1, x2 - x1);
      return {
        prompt: `Find the slope (gradient) of the line through $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`,
        answer: { kind: "rational", value: m.toString() },
        hints: ["Slope $= \\dfrac{\\text{rise}}{\\text{run}} = \\dfrac{y_2 - y_1}{x_2 - x_1}$.", `Rise: $${y2} - ${y1 < 0 ? `(${y1})` : y1} = ${y2 - y1}$.`, `Run: $${x2} - ${x1 < 0 ? `(${x1})` : x1} = ${x2 - x1}$. Divide rise by run.`],
        solution: [{ text: "", tex: `m = \\frac{${y2} - (${y1})}{${x2} - (${x1})} = \\frac{${y2 - y1}}{${x2 - x1}} = ${m.toTex()}` }],
        answerDisplay: `$${m.toTex()}$`,
        misconceptions: [
          { id: "run-over-rise", detect: (s) => ratEq(s, R(x2 - x1, y2 - y1)) && !R(x2 - x1, y2 - y1).equals(m), feedback: "You divided run by rise. Slope is **rise over run**: change in $y$ divided by change in $x$." },
          { id: "mixed-order", detect: (s) => ratEq(s, m.neg()), feedback: "The sign is wrong — make sure you subtract in the same order on top and bottom ($y_2 - y_1$ with $x_2 - x_1$)." },
        ],
        exactness: "exact",
      };
    },
  },
  {
    id: "line-equation",
    skill: "slope-intercept",
    title: "Equation of a line from slope and a point",
    difficulty: 3,
    representation: "symbolic",
    generate(rng) {
      const m = rng.intExcept(-5, 5, [0]);
      const x0 = rng.intExcept(-5, 5, [0]);
      const y0 = rng.int(-8, 8);
      const c = y0 - m * x0;
      return {
        prompt: `A line has slope $${m}$ and passes through $(${x0}, ${y0})$. Write its equation as $y = mx + c$ — type just the right-hand side (e.g. 2x - 3).`,
        answer: { kind: "expression", value: `${m}*x + ${c}`, variables: ["x"] },
        hints: ["In $y = mx + c$, $m$ is the slope and $c$ is where the line crosses the $y$-axis.", `Substitute the point: $${y0} = ${m}(${x0}) + c$.`, `So $c = ${y0} - (${m * x0}) = ${c}$.`],
        solution: [
          { text: "Substitute the point into $y = mx + c$:", tex: `${y0} = ${m}\\times(${x0}) + c` },
          { text: "Solve for $c$:", tex: `c = ${y0} - (${m * x0}) = ${c}` },
          { text: "Equation:", tex: `y = ${coef(m)} ${c === 0 ? "" : signed(c)}` },
        ],
        answerDisplay: `$y = ${coef(m)} ${c === 0 ? "" : signed(c)}$`,
        misconceptions: [{ id: "used-y0-as-c", detect: (s) => { try { return s.includes("x") && numEq(s.replace(/x/g, "*(0)"), y0) && y0 !== c; } catch { return false; } }, feedback: `$c$ is the $y$-value where $x = 0$, not the $y$-coordinate of the given point (which has $x = ${x0}$).` }],
        exactness: "exact",
        inputHelp: "Type an expression in x, e.g. -3x + 7",
      };
    },
  },
  {
    id: "quadratic-roots",
    skill: "quadratics",
    title: "Roots and discriminant of a quadratic",
    difficulty: 3,
    representation: "symbolic",
    generate(rng) {
      let r1: number, r2: number;
      do {
        r1 = rng.int(-7, 7);
        r2 = rng.int(-7, 7);
      } while (r1 === r2);
      const [lo, hi] = [Math.min(r1, r2), Math.max(r1, r2)];
      const b = -(r1 + r2);
      const c = r1 * r2;
      const disc = b * b - 4 * c;
      return {
        prompt: `Solve $x^2 ${b === 0 ? "" : coef(b, "x", false)} ${c === 0 ? "" : signed(c)} = 0$. Enter the **smaller** root, then the **larger** root.`,
        answer: { kind: "tuple", values: [String(lo), String(hi)], labels: ["smaller root", "larger root"] },
        hints: [
          "Use the quadratic formula $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$, or factorise.",
          `Here $a = 1$, $b = ${b}$, $c = ${c}$, so the discriminant is $b^2 - 4ac = ${disc}$.`,
          `$\\sqrt{${disc}} = ${Math.sqrt(disc)}$, so $x = \\frac{${-b} \\pm ${Math.sqrt(disc)}}{2}$.`,
        ],
        solution: [
          { text: "Discriminant:", tex: `\\Delta = (${b})^2 - 4(1)(${c}) = ${disc} > 0 \\Rightarrow \\text{two real roots}` },
          { text: "Quadratic formula:", tex: `x = \\frac{${-b} \\pm ${Math.sqrt(disc)}}{2}` },
          { text: "Factorised form:", tex: `(x ${signed(-r1)})(x ${signed(-r2)}) = 0 \\Rightarrow x = ${lo}\\ \\text{or}\\ x = ${hi}` },
        ],
        answerDisplay: `$x = ${lo}$ or $x = ${hi}$`,
        exactness: "exact",
      };
    },
  },
];
