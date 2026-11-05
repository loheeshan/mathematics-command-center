import { Rational, gcd, lcm, type Rng } from "@mcc/math-engine";
import type { QuestionTemplate } from "../types";
import { ratEq, numEq } from "../check";

const sgn = (n: number) => (n < 0 ? `(${n})` : `${n}`);
const R = (n: number, d = 1) => new Rational(n, d);
/** proper fraction n/d with d in [lo,hi], n in [1, d-1], already in lowest terms */
function properFraction(rng: Rng, lo = 2, hi = 9) {
  for (;;) {
    const d = rng.int(lo, hi);
    const n = rng.int(1, d - 1);
    if (gcd(n, d) === 1) return R(n, d);
  }
}

export const foundationTemplates: QuestionTemplate[] = [
  {
    id: "signed-add",
    skill: "negative-numbers",
    title: "Adding signed numbers",
    difficulty: 1,
    representation: "symbolic",
    generate(rng) {
      const a = rng.intExcept(-12, 12, [0]);
      const b = rng.intExcept(-12, 12, [0]);
      const ans = a + b;
      return {
        prompt: `Work out $${a} + ${sgn(b)}$.`,
        answer: { kind: "integer", value: ans },
        hints: [
          "On a number line, adding a positive number moves **right**; adding a negative number moves **left**.",
          `Start at $${a}$ on the number line.`,
          `Move ${Math.abs(b)} step${Math.abs(b) === 1 ? "" : "s"} ${b > 0 ? "right" : "left"}.`,
        ],
        solution: [
          { text: `Start at $${a}$.` },
          { text: `Adding $${sgn(b)}$ means moving ${Math.abs(b)} step${Math.abs(b) === 1 ? "" : "s"} ${b > 0 ? "right" : "left"}.` },
          { text: `You land on $${ans}$.`, tex: `${a} + ${sgn(b)} = ${ans}` },
        ],
        answerDisplay: `$${ans}$`,
        misconceptions: [
          { id: "sign-flip", detect: (s) => numEq(s, -ans) && ans !== 0, feedback: "The size is right but the sign is wrong. Which side of zero do you finish on?" },
          { id: "add-magnitudes", detect: (s) => numEq(s, Math.abs(a) + Math.abs(b)) && Math.sign(a) !== Math.sign(b), feedback: "When the signs differ, the moves go in opposite directions, so they partly cancel — you should *subtract* the sizes." },
        ],
        exactness: "exact",
      };
    },
  },
  {
    id: "signed-subtract",
    skill: "negative-numbers",
    title: "Subtracting signed numbers",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const a = rng.intExcept(-10, 10, [0]);
      const b = rng.intExcept(-10, 10, [0]);
      const ans = a - b;
      return {
        prompt: `Work out $${a} - ${sgn(b)}$.`,
        answer: { kind: "integer", value: ans },
        hints: [
          "Subtracting a number is the same as adding its opposite: $a - b = a + (-b)$.",
          `Rewrite as $${a} + ${sgn(-b)}$.`,
          `Now move ${Math.abs(b)} step${Math.abs(b) === 1 ? "" : "s"} ${-b > 0 ? "right" : "left"} from $${a}$.`,
        ],
        solution: [
          { text: "Subtracting is adding the opposite.", tex: `${a} - ${sgn(b)} = ${a} + ${sgn(-b)}` },
          { text: `Move from $${a}$ by $${-b}$.`, tex: `= ${ans}` },
        ],
        answerDisplay: `$${ans}$`,
        misconceptions: [
          { id: "forgot-opposite", detect: (s) => numEq(s, a + b) && a + b !== ans, feedback: `It looks like you added $${b}$ instead of subtracting it. Subtracting ${b < 0 ? "a negative number moves you **right**" : "moves you left"}.` },
          { id: "sign-flip", detect: (s) => numEq(s, -ans) && ans !== 0, feedback: "Right size, wrong sign. Check which side of zero you end on." },
        ],
        exactness: "exact",
      };
    },
  },
  {
    id: "signed-multiply",
    skill: "negative-numbers",
    title: "Multiplying and dividing signed numbers",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const a = rng.intExcept(-9, 9, [0, 1, -1]);
      const b = rng.intExcept(-9, 9, [0, 1, -1]);
      const divide = rng.next() < 0.5;
      const ans = divide ? b : a * b;
      const prompt = divide ? `Work out $${a * b} \\div ${sgn(a)}$.` : `Work out $${a} \\times ${sgn(b)}$.`;
      const neg = divide ? Math.sign(a * b) !== Math.sign(a) : Math.sign(a) !== Math.sign(b);
      return {
        prompt,
        answer: { kind: "integer", value: ans },
        hints: [
          "Same signs give a positive result; different signs give a negative result.",
          `Ignore the signs first: ${divide ? `$${Math.abs(a * b)} \\div ${Math.abs(a)}$` : `$${Math.abs(a)} \\times ${Math.abs(b)}$`}.`,
          `The signs are ${neg ? "different, so the answer is negative" : "the same, so the answer is positive"}.`,
        ],
        solution: [
          { text: "Size:", tex: divide ? `${Math.abs(a * b)} \\div ${Math.abs(a)} = ${Math.abs(ans)}` : `${Math.abs(a)} \\times ${Math.abs(b)} = ${Math.abs(ans)}` },
          { text: `Sign: ${neg ? "different signs → negative" : "same signs → positive"}.`, tex: `\\text{answer} = ${ans}` },
        ],
        answerDisplay: `$${ans}$`,
        misconceptions: [{ id: "sign-rule", detect: (s) => numEq(s, -ans), feedback: "The size is right; check the sign rule: same signs → positive, different signs → negative." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "order-of-operations",
    skill: "order-of-operations",
    title: "Order of operations",
    difficulty: 1,
    representation: "symbolic",
    generate(rng) {
      const a = rng.int(2, 12);
      const b = rng.int(2, 9);
      const c = rng.int(2, 9);
      const form = rng.int(0, 3);
      let tex = "", ans = 0, ltr = 0, steps: string[] = [];
      if (form === 0) {
        tex = `${a} + ${b} \\times ${c}`; ans = a + b * c; ltr = (a + b) * c;
        steps = [`${b} \\times ${c} = ${b * c}`, `${a} + ${b * c} = ${ans}`];
      } else if (form === 1) {
        tex = `(${a} + ${b}) \\times ${c}`; ans = (a + b) * c; ltr = a + b * c;
        steps = [`${a} + ${b} = ${a + b}`, `${a + b} \\times ${c} = ${ans}`];
      } else if (form === 2) {
        const q = b * c;
        tex = `${a + q} - ${q} \\div ${c}`; ans = a + q - b; ltr = a / c;
        steps = [`${q} \\div ${c} = ${b}`, `${a + q} - ${b} = ${ans}`];
      } else {
        tex = `${a} \\times ${b} - ${c}^2`; ans = a * b - c * c; ltr = (a * b - c) ** 2;
        steps = [`${c}^2 = ${c * c}`, `${a} \\times ${b} = ${a * b}`, `${a * b} - ${c * c} = ${ans}`];
      }
      return {
        prompt: `Evaluate $${tex}$.`,
        answer: { kind: "integer", value: ans },
        hints: [
          "Order: **B**rackets, then **O**rders (powers), then **D**ivision/**M**ultiplication, then **A**ddition/**S**ubtraction.",
          `Find the highest-priority part of $${tex}$ and work that out first.`,
          `First step: $${steps[0]}$.`,
        ],
        solution: steps.map((s) => ({ text: "", tex: s })),
        answerDisplay: `$${ans}$`,
        misconceptions: [{ id: "left-to-right", detect: (s) => numEq(s, ltr) && ltr !== ans, feedback: "It looks like you worked strictly left to right. Multiplication, division and powers come before addition and subtraction (unless brackets say otherwise)." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "fraction-of-bar",
    skill: "fractions-meaning",
    title: "What fraction is shaded?",
    difficulty: 1,
    representation: "visual",
    generate(rng) {
      const d = rng.int(3, 12);
      const n = rng.int(1, d - 1);
      const f = R(n, d);
      return {
        prompt: `A chocolate bar is split into **${d} equal pieces**. You eat **${n}** of them. What fraction of the bar did you eat? (Any equivalent fraction is accepted.)`,
        answer: { kind: "rational", value: f.toString() },
        hints: [
          "The denominator (bottom) counts how many **equal** parts the whole is split into.",
          `The whole is split into ${d} equal parts, so the denominator is ${d}.`,
          `The numerator (top) counts the parts you took: ${n}.`,
        ],
        solution: [{ text: `${n} parts out of ${d} equal parts:`, tex: `\\frac{${n}}{${d}}${f.d !== d ? ` = ${f.toTex()}` : ""}` }],
        answerDisplay: `$\\frac{${n}}{${d}}$`,
        misconceptions: [
          { id: "swapped", detect: (s) => ratEq(s, R(d, n)), feedback: "Top and bottom are swapped: the bottom number is the total number of equal parts." },
          { id: "remaining", detect: (s) => ratEq(s, R(d - n, d)), feedback: "That is the fraction that is **left**, not the fraction you ate." },
        ],
        exactness: "exact",
      };
    },
  },
  {
    id: "equivalent-fraction-missing",
    skill: "equivalent-fractions",
    title: "Find the missing numerator",
    difficulty: 1,
    representation: "symbolic",
    generate(rng) {
      const f = properFraction(rng, 2, 9);
      const k = rng.int(2, 6);
      const ans = f.n * k;
      return {
        prompt: `Fill in the missing number: $\\dfrac{${f.n}}{${f.d}} = \\dfrac{\\;?\\;}{${f.d * k}}$`,
        answer: { kind: "integer", value: ans },
        hints: [
          "Equivalent fractions are made by multiplying top **and** bottom by the same number.",
          `What was ${f.d} multiplied by to get ${f.d * k}?`,
          `It was multiplied by ${k}. Do the same to the top.`,
        ],
        solution: [
          { text: `$${f.d} \\times ${k} = ${f.d * k}$, so multiply the top by ${k} too.` },
          { text: "", tex: `\\frac{${f.n}}{${f.d}} = \\frac{${f.n} \\times ${k}}{${f.d} \\times ${k}} = \\frac{${ans}}{${f.d * k}}` },
        ],
        answerDisplay: `$${ans}$`,
        misconceptions: [{ id: "added-instead", detect: (s) => numEq(s, f.n + (f.d * k - f.d)) && f.n + (f.d * k - f.d) !== ans, feedback: "You added the same amount to top and bottom. Adding changes the size of a fraction; you must **multiply** both by the same number." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "fraction-add-unlike",
    skill: "fraction-add-sub",
    title: "Add fractions with different denominators",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      let a: Rational, b: Rational;
      do {
        a = properFraction(rng, 2, 8);
        b = properFraction(rng, 2, 9);
      } while (a.d === b.d);
      const L = lcm(a.d, b.d);
      const sum = a.add(b);
      const ka = L / a.d, kb = L / b.d;
      return {
        prompt: `Work out $${a.toTex()} + ${b.toTex()}$. Give an exact fraction (or mixed number).`,
        answer: { kind: "rational", value: sum.toString() },
        hints: [
          "You can only add parts that are the **same size**: rewrite both fractions with a common denominator.",
          `A common denominator is ${L} (the lowest common multiple of ${a.d} and ${b.d}).`,
          `$${a.toTex()} = \\frac{${a.n * ka}}{${L}}$ and $${b.toTex()} = \\frac{${b.n * kb}}{${L}}$. Now add the numerators.`,
        ],
        solution: [
          { text: `The LCM of ${a.d} and ${b.d} is ${L}.` },
          { text: "Rewrite each fraction with denominator " + L + ".", tex: `${a.toTex()} = \\frac{${a.n}\\times${ka}}{${a.d}\\times${ka}} = \\frac{${a.n * ka}}{${L}},\\quad ${b.toTex()} = \\frac{${b.n * kb}}{${L}}` },
          { text: "Add the numerators; the denominator stays the same because the parts are the same size.", tex: `\\frac{${a.n * ka}}{${L}} + \\frac{${b.n * kb}}{${L}} = \\frac{${a.n * ka + b.n * kb}}{${L}}` },
          ...(sum.d !== L ? [{ text: "Simplify.", tex: `= ${sum.toTex()}` }] : []),
          ...(sum.compare(1) > 0 ? [{ text: `As a mixed number: $${sum.toMixedString().replace(" ", "\\,")}$.` }] : []),
        ],
        answerDisplay: `$${sum.toTex()}$`,
        misconceptions: [
          { id: "add-tops-and-bottoms", detect: (s) => ratEq(s, R(a.n + b.n, a.d + b.d)), feedback: `You added the tops **and** the bottoms, giving $\\frac{${a.n + b.n}}{${a.d + b.d}}$. But the denominator names the size of the parts — adding denominators would make the parts *smaller*, so the total would shrink. Rewrite both with a common denominator first.` },
          { id: "kept-one-denominator", detect: (s) => ratEq(s, R(a.n + b.n, a.d)) || ratEq(s, R(a.n + b.n, b.d)), feedback: "You added the numerators but kept one of the original denominators. The parts must be the same size before you add them." },
          { id: "multiplied", detect: (s) => ratEq(s, a.mul(b)), feedback: "That is the product, not the sum." },
        ],
        exactness: "exact",
      };
    },
  },
  {
    id: "fraction-subtract",
    skill: "fraction-add-sub",
    title: "Subtract fractions",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      let a: Rational, b: Rational;
      do {
        a = properFraction(rng, 2, 9);
        b = properFraction(rng, 2, 9);
      } while (a.d === b.d || a.equals(b));
      const L = lcm(a.d, b.d);
      const diff = a.sub(b);
      return {
        prompt: `Work out $${a.toTex()} - ${b.toTex()}$. Give an exact fraction${diff.compare(0) < 0 ? " (the answer may be negative)" : ""}.`,
        answer: { kind: "rational", value: diff.toString() },
        hints: [
          "Subtract only same-size parts: find a common denominator first.",
          `Use denominator ${L}.`,
          `$${a.toTex()} = \\frac{${a.n * (L / a.d)}}{${L}}$, $${b.toTex()} = \\frac{${b.n * (L / b.d)}}{${L}}$. Subtract the numerators.`,
        ],
        solution: [
          { text: `Common denominator ${L}:`, tex: `\\frac{${a.n * (L / a.d)}}{${L}} - \\frac{${b.n * (L / b.d)}}{${L}} = \\frac{${a.n * (L / a.d) - b.n * (L / b.d)}}{${L}}` },
          ...(diff.d !== L ? [{ text: "Simplify.", tex: `= ${diff.toTex()}` }] : []),
        ],
        answerDisplay: `$${diff.toTex()}$`,
        misconceptions: [
          { id: "subtract-tops-and-bottoms", detect: (s) => a.d !== b.d && ratEq(s, R(a.n - b.n, a.d - b.d)), feedback: "You subtracted the tops and the bottoms. Denominators are not subtracted — rewrite with a common denominator first." },
          { id: "sign-flip", detect: (s) => ratEq(s, diff.neg()), feedback: "Right size, wrong sign: which fraction is bigger?" },
        ],
        exactness: "exact",
      };
    },
  },
  {
    id: "mixed-number-signed",
    skill: "mixed-numbers",
    title: "Negative mixed numbers",
    difficulty: 3,
    representation: "symbolic",
    generate(rng) {
      const w = rng.int(1, 3);
      const f = properFraction(rng, 2, 6);
      const m = R(w).add(f).neg(); // −(w + f)
      let g: Rational;
      do g = properFraction(rng, 2, 8); while (g.d === f.d);
      const ans = m.add(g);
      const improper = m;
      return {
        prompt: `Work out $-${w}\\tfrac{${f.n}}{${f.d}} + ${g.toTex()}$. Give an exact answer as a fraction or mixed number.`,
        answer: { kind: "rational", value: ans.toString() },
        hints: [
          "Convert the mixed number to an improper fraction first. The minus sign applies to the **whole** mixed number.",
          `$-${w}\\tfrac{${f.n}}{${f.d}} = -\\frac{${w * f.d + f.n}}{${f.d}}$.`,
          `Use a common denominator of ${lcm(f.d, g.d)} and add.`,
        ],
        solution: [
          { text: "Improper fraction:", tex: `-${w}\\tfrac{${f.n}}{${f.d}} = ${improper.toTex()}` },
          { text: "Common denominator and add:", tex: `${improper.toTex()} + ${g.toTex()} = ${ans.toTex()}` },
          ...(Math.abs(ans.n) > ans.d ? [{ text: `As a mixed number: $${ans.toMixedString().replace(" ", "\\,")}$` }] : []),
        ],
        answerDisplay: `$${ans.toTex()}$`,
        misconceptions: [{ id: "minus-on-whole-only", detect: (s) => ratEq(s, R(-w).add(f).add(g)), feedback: `The minus sign applies to the whole of $${w}\\tfrac{${f.n}}{${f.d}}$, i.e. $-(${w} + ${f.toTex()})$, not just to the ${w}.` }],
        exactness: "exact",
      };
    },
  },
  {
    id: "fraction-multiply-divide",
    skill: "fraction-mul-div",
    title: "Multiply or divide fractions",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const a = properFraction(rng, 2, 9);
      const b = properFraction(rng, 2, 9);
      const div = rng.next() < 0.5;
      const ans = div ? a.div(b) : a.mul(b);
      return {
        prompt: `Work out $${a.toTex()} ${div ? "\\div" : "\\times"} ${b.toTex()}$.`,
        answer: { kind: "rational", value: ans.toString() },
        hints: div
          ? ["Dividing by a fraction is multiplying by its reciprocal (flip it).", `The reciprocal of $${b.toTex()}$ is $\\frac{${b.d}}{${b.n}}$.`, `Compute $${a.toTex()} \\times \\frac{${b.d}}{${b.n}}$: tops times tops, bottoms times bottoms.`]
          : ["Multiply numerators together and denominators together — no common denominator needed.", `Top: $${a.n} \\times ${b.n}$.`, `Bottom: $${a.d} \\times ${b.d}$. Then simplify.`],
        solution: div
          ? [{ text: "Flip and multiply:", tex: `${a.toTex()} \\div ${b.toTex()} = ${a.toTex()} \\times \\frac{${b.d}}{${b.n}} = \\frac{${a.n * b.d}}{${a.d * b.n}} = ${ans.toTex()}` }]
          : [{ text: "Multiply across:", tex: `${a.toTex()} \\times ${b.toTex()} = \\frac{${a.n * b.n}}{${a.d * b.d}} = ${ans.toTex()}` }],
        answerDisplay: `$${ans.toTex()}$`,
        misconceptions: div
          ? [
              { id: "flipped-first", detect: (s) => ratEq(s, b.div(a)) && !b.div(a).equals(ans), feedback: "You flipped the wrong fraction: keep the first, flip the **second**." },
              { id: "multiplied-not-divided", detect: (s) => ratEq(s, a.mul(b)), feedback: "You multiplied. For division, multiply by the *reciprocal* of the second fraction." },
            ]
          : [{ id: "common-denominator", detect: (s) => ratEq(s, R(a.n * b.n, lcm(a.d, b.d))) && !R(a.n * b.n, lcm(a.d, b.d)).equals(ans), feedback: "For multiplication you multiply the denominators too — you don't need a common denominator." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "decimal-to-fraction",
    skill: "decimals",
    title: "Decimal to fraction",
    difficulty: 1,
    representation: "symbolic",
    generate(rng) {
      const dp = rng.int(1, 3);
      const denom = 10 ** dp;
      let n: number;
      do n = rng.int(1, denom - 1); while (n % 10 === 0 && dp > 1);
      const f = R(n, denom);
      const dec = (n / denom).toFixed(dp);
      return {
        prompt: `Write $${dec}$ as a fraction in its **lowest terms**.`,
        answer: { kind: "rational", value: f.toString(), acceptDecimal: false, requireSimplest: true },
        hints: [
          `Each decimal place is a power of ten: ${dp} decimal place${dp > 1 ? "s" : ""} means a denominator of ${denom}.`,
          `$${dec} = \\frac{${n}}{${denom}}$.`,
          `Divide top and bottom by their greatest common factor, ${gcd(n, denom)}.`,
        ],
        solution: [{ text: "", tex: `${dec} = \\frac{${n}}{${denom}} = ${f.toTex()}` }],
        answerDisplay: `$${f.toTex()}$`,
        exactness: "exact",
      };
    },
  },
  {
    id: "percent-of-quantity",
    skill: "percentages",
    title: "Percentage of an amount",
    difficulty: 1,
    representation: "word-problem",
    generate(rng) {
      const p = rng.pick([5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 60, 75, 80]);
      const N = rng.int(2, 40) * 20;
      const ans = (p * N) / 100;
      const ctx = rng.pick([
        `In a cohort of ${N} students, ${p}% passed a biology quiz. How many students passed?`,
        `A tea estate has ${N} rows of bushes and ${p}% are ready to pluck. How many rows is that?`,
        `A sample contains ${N} cells and ${p}% are stained. How many cells are stained?`,
      ]);
      return {
        prompt: ctx,
        answer: { kind: "numeric", value: ans, abs: 1e-9 },
        hints: ["Per cent means *per hundred*: $p\\% = \\frac{p}{100}$.", `${p}% of ${N} is $\\frac{${p}}{100} \\times ${N}$.`, `Find 1% first: $${N} \\div 100 = ${N / 100}$, then multiply by ${p}.`],
        solution: [{ text: "", tex: `\\frac{${p}}{100} \\times ${N} = ${N / 100} \\times ${p} = ${ans}` }],
        answerDisplay: `$${ans}$`,
        misconceptions: [{ id: "divided-by-percent", detect: (s) => numEq(s, N / p), feedback: `You divided ${N} by ${p}. A percentage is a multiplier: multiply by ${p}/100.` }],
        exactness: "exact",
      };
    },
  },
  {
    id: "percent-change",
    skill: "percentages",
    title: "Discounts and percentage change",
    difficulty: 2,
    representation: "word-problem",
    generate(rng) {
      const up = rng.next() < 0.4;
      const p = rng.pick([10, 15, 20, 25, 30, 40]);
      const P = rng.int(4, 50) * 100;
      const ans = up ? P * (1 + p / 100) : P * (1 - p / 100);
      return {
        prompt: up
          ? `A lab's monthly reagent bill of Rs ${P} rises by ${p}%. What is the new bill (in rupees)?`
          : `A textbook costs Rs ${P}. In a sale it is reduced by ${p}%. What is the sale price (in rupees)?`,
        answer: { kind: "numeric", value: ans, abs: 1e-9 },
        hints: [
          up ? "An increase of p% multiplies the amount by $(1 + \\frac{p}{100})$." : "A decrease of p% leaves $(100 - p)\\%$ of the original.",
          up ? `Multiply by $1 + ${p / 100} = ${1 + p / 100}$.` : `You pay ${100 - p}% of Rs ${P}.`,
          up ? `$${P} \\times ${1 + p / 100}$` : `$${P} \\times ${(100 - p) / 100}$`,
        ],
        solution: [{ text: "", tex: `${P} \\times ${up ? 1 + p / 100 : (100 - p) / 100} = ${ans}` }],
        answerDisplay: `Rs ${ans}`,
        misconceptions: [
          { id: "subtracted-percent-number", detect: (s) => numEq(s, up ? P + p : P - p), feedback: `You ${up ? "added" : "subtracted"} ${p} rupees, not ${p}%. Find ${p}% of ${P} first.` },
          { id: "change-only", detect: (s) => numEq(s, (P * p) / 100), feedback: `Rs ${(P * p) / 100} is the size of the change. The question asks for the new amount.` },
        ],
        exactness: "exact",
      };
    },
  },
  {
    id: "ratio-share",
    skill: "ratio-proportion",
    title: "Share in a ratio",
    difficulty: 2,
    representation: "word-problem",
    generate(rng) {
      let a: number, b: number;
      do {
        a = rng.int(1, 7);
        b = rng.int(1, 7);
      } while (a === b || gcd(a, b) !== 1);
      const unit = rng.int(2, 25);
      const N = (a + b) * unit;
      const big = Math.max(a, b) * unit;
      return {
        prompt: `A ${N} ml buffer is mixed from solution A and solution B in the ratio $${a} : ${b}$. How many ml of the **larger** share are there?`,
        answer: { kind: "numeric", value: big, abs: 1e-9, unit: "ml" },
        hints: ["A ratio $a:b$ splits the total into $a + b$ equal *parts*.", `There are $${a} + ${b} = ${a + b}$ parts, so one part is $${N} \\div ${a + b}$.`, `One part is ${unit} ml. The larger share has ${Math.max(a, b)} parts.`],
        solution: [
          { text: "Total parts:", tex: `${a} + ${b} = ${a + b}` },
          { text: "One part:", tex: `${N} \\div ${a + b} = ${unit}\\text{ ml}` },
          { text: "Larger share:", tex: `${Math.max(a, b)} \\times ${unit} = ${big}\\text{ ml}` },
        ],
        answerDisplay: `${big} ml`,
        misconceptions: [{ id: "divided-by-ratio-term", detect: (s) => numEq(s, N / Math.max(a, b)) || numEq(s, N / Math.min(a, b)), feedback: "You divided the total by one term of the ratio. First divide by the **total number of parts**." }],
        exactness: "exact",
      };
    },
  },
  {
    id: "unit-rate",
    skill: "rates-unit-rates",
    title: "Unit rates",
    difficulty: 1,
    representation: "word-problem",
    generate(rng) {
      const n = rng.int(2, 8);
      const price = rng.int(3, 40) * 5;
      const m = rng.intExcept(2, 15, [n]);
      const ans = (price / n) * m;
      return {
        prompt: `${n} test tubes cost Rs ${price}. At the same rate, what do ${m} test tubes cost? (Give an exact value.)`,
        answer: { kind: "numeric", value: ans, abs: 1e-6 },
        hints: ["Find the cost of **one** first (the unit rate).", `One tube costs $${price} \\div ${n}$.`, `Multiply the unit cost by ${m}.`],
        solution: [
          { text: "Unit rate:", tex: `${price} \\div ${n} = ${R(price, n).toTex()}` },
          { text: `Cost of ${m}:`, tex: `${R(price, n).toTex()} \\times ${m} = ${R(price * m, n).toTex()}${R(price * m, n).isInteger() ? "" : ` = ${ans.toFixed(2)}`}` },
        ],
        answerDisplay: R(price * m, n).isInteger() ? `Rs ${ans}` : `Rs $${R(price * m, n).toTex()} \\approx ${ans.toFixed(2)}$`,
        misconceptions: [{ id: "multiplied-total", detect: (s) => numEq(s, price * m), feedback: `That is the cost if each tube cost Rs ${price}. Rs ${price} buys ${n} tubes.` }],
        exactness: "exact",
        inputHelp: "A fraction such as 1000/3 is accepted.",
      };
    },
  },
  {
    id: "power-evaluate",
    skill: "exponents-roots",
    title: "Powers, including negative and zero exponents",
    difficulty: 2,
    representation: "symbolic",
    generate(rng) {
      const base = rng.intExcept(-5, 6, [0, 1, -1]);
      const e = rng.intExcept(-3, 4, [1]);
      const ans = Rational.of(1).mul(e >= 0 ? R(base ** e) : R(1, base ** -e));
      return {
        prompt: `Evaluate $(${base})^{${e}}$ exactly.`,
        answer: { kind: "rational", value: ans.toString() },
        hints: [
          "$a^n$ means $n$ copies of $a$ multiplied; $a^0 = 1$; $a^{-n} = \\frac{1}{a^n}$.",
          e < 0 ? `Rewrite as $\\frac{1}{(${base})^{${-e}}}$.` : e === 0 ? "Any non-zero number to the power 0 is 1." : `Multiply ${e} copies of ${base}.`,
          base < 0 ? "An even number of negative factors is positive; an odd number is negative." : "Work out the power, then take the reciprocal if the exponent was negative.",
        ],
        solution: [{ text: "", tex: `(${base})^{${e}} = ${e < 0 ? `\\frac{1}{(${base})^{${-e}}} = \\frac{1}{${base ** -e}} = ` : ""}${ans.toTex()}` }],
        answerDisplay: `$${ans.toTex()}$`,
        misconceptions: [
          { id: "negative-exponent-negative", detect: (s) => e < 0 && ratEq(s, R(-(base ** -e))), feedback: "A negative exponent does not make the answer negative — it means *reciprocal*: $a^{-n} = 1/a^n$." },
          { id: "multiplied-base-exponent", detect: (s) => ratEq(s, R(base * e)) && base * e !== ans.toNumber(), feedback: "$a^n$ is repeated multiplication, not $a \\times n$." },
        ],
        exactness: "exact",
      };
    },
  },
  {
    id: "coordinate-quadrant",
    skill: "coordinate-plane",
    title: "Which quadrant?",
    difficulty: 1,
    representation: "visual",
    generate(rng) {
      const x = rng.intExcept(-9, 9, [0]);
      const y = rng.intExcept(-9, 9, [0]);
      const q = x > 0 ? (y > 0 ? "I" : "IV") : y > 0 ? "II" : "III";
      return {
        prompt: `In which quadrant does the point $(${x}, ${y})$ lie?`,
        answer: { kind: "choice", options: ["I", "II", "III", "IV"].map((id) => ({ id, label: `Quadrant ${id}` })), correct: [q] },
        hints: ["The first number is $x$ (left/right), the second is $y$ (up/down).", "Quadrants are numbered anticlockwise starting top-right: I (+,+), II (−,+), III (−,−), IV (+,−).", `Here $x$ is ${x > 0 ? "positive" : "negative"} and $y$ is ${y > 0 ? "positive" : "negative"}.`],
        solution: [{ text: `Signs (${x > 0 ? "+" : "−"}, ${y > 0 ? "+" : "−"}) → quadrant ${q}.` }],
        answerDisplay: `Quadrant ${q}`,
        misconceptions: [{ id: "swapped-coordinates", detect: (s) => s === (y > 0 ? (x > 0 ? "I" : "IV") : x > 0 ? "II" : "III") && q !== "I" && q !== "III", feedback: "It looks like you swapped x and y. The first coordinate is horizontal." }],
        exactness: "exact",
      };
    },
  },
];
