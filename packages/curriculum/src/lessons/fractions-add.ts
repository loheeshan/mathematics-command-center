import type { Lesson } from "../types";

export const fractionsAdd: Lesson = {
  slug: "fractions-adding-unlike",
  title: "Fractions: understanding ½ + ⅓",
  topic: "fraction-add-sub",
  alsoCovers: ["fractions-meaning", "equivalent-fractions"],
  level: 1,
  summary: "Why you can't just add tops and bottoms, and how a common denominator makes the parts the same size so they can be counted together.",
  bridgesFor: ["fy-s1-01", "fy-s1-07a", "fy-s2-02", "fy-s1-07c"],
  stages: [
    {
      id: "why",
      blocks: [
        { t: "text", md: "You share **half a pizza** with a friend, and someone hands you **another third of a pizza** (same-sized pizza). How much pizza do you have now? More than half, less than one — but *exactly* how much?" },
        { t: "text", md: "Fractions are everywhere real quantities are split: medicine doses (½ tablet + ¼ tablet), recipes, probability (½ chance + ⅓ chance), and — later — every limit, integral and probability distribution in your university course. Adding fractions correctly is a skill you will use thousands of times." },
        { t: "callout", kind: "note", md: "No prior knowledge needed. If the word *denominator* is new to you, that's fine — it is explained in the next stage." },
      ],
    },
    {
      id: "intuition",
      blocks: [
        { t: "text", mode: "simple", md: "A fraction like $\\frac{1}{2}$ has two numbers. The **bottom number** (the *denominator*) says how many **equal pieces** the whole was cut into. The **top number** (the *numerator*) counts how many of those pieces you have." },
        { t: "text", mode: "simple", md: "So $\\frac{1}{2}$ = one piece of a pizza cut into 2, and $\\frac{1}{3}$ = one piece of a pizza cut into 3. Those pieces are **different sizes**. You can't count 'one half-piece + one third-piece = two pieces' — two pieces of *what size*?" },
        { t: "text", mode: "simple", md: "The fix: re-cut both pizzas into pieces that **are** the same size. If you cut each pizza into **6** pieces, then a half is **3** of those pieces and a third is **2** of them. Now you can count: 3 + 2 = **5 pieces of size one-sixth**, so $\\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6}$." },
        { t: "text", mode: "formal", md: "A fraction $\\frac{a}{b}$ ($b \\neq 0$) is the number that, multiplied by $b$, gives $a$. Two fractions are **equal** when $\\frac{a}{b} = \\frac{ka}{kb}$ for any non-zero integer $k$. Addition is defined only for a shared unit: $\\frac{a}{n} + \\frac{c}{n} = \\frac{a + c}{n}$. To add $\\frac{a}{b} + \\frac{c}{d}$ we rewrite both over a common multiple $n$ of $b$ and $d$ (usually $\\operatorname{lcm}(b, d)$)." },
        { t: "text", mode: "university", md: "Formally, $\\mathbb{Q}$ is the set of equivalence classes of pairs $(a, b)$ with $b \\neq 0$, where $(a, b) \\sim (c, d) \\iff ad = bc$. Addition $\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$ is well defined on classes. Choosing the representative with denominator $\\operatorname{lcm}(b,d)$ keeps numbers small. This is the rational-number system $\\mathbb{Q}$ of FY S1 Chapter 01." },
        { t: "callout", kind: "analogy", md: "**Analogy and its limit:** adding fractions is like adding money in different currencies — you must convert to one currency (one denominator) first. The analogy breaks down because exchange rates are arbitrary, while converting fractions *never changes their value*: $\\frac{1}{2}$ and $\\frac{3}{6}$ are exactly the same number." },
        { t: "callout", kind: "warning", md: "**Why adding denominators is wrong:** $\\frac{1}{2} + \\frac{1}{3} \\neq \\frac{2}{5}$. Check: $\\frac{2}{5}$ is *less* than $\\frac{1}{2}$ — but you added something to $\\frac{1}{2}$, so the answer must be bigger! Adding the bottoms changes the *size of the pieces*, which isn't what adding means." },
      ],
    },
    {
      id: "visualize",
      blocks: [
        { t: "text", md: "Below, both bars are the **same width** (same-sized whole). The top bar is cut into 2 equal parts, the second into 3. Press **Re-cut to common denominator** and watch both bars split into sixths: the half becomes 3 sixths and the third becomes 2 sixths." },
        { t: "sim", slug: "fraction-kitchen", preset: "half-plus-third", caption: "Same-width bars: ½ (3 sixths) + ⅓ (2 sixths) = ⅚" },
        { t: "callout", kind: "note", md: "Wholes must be the same size. Half of a large pizza plus a third of a small pizza is *not* ⅚ of any pizza — fractions only add when they are fractions of the **same whole**." },
      ],
    },
    {
      id: "explore",
      blocks: [
        { t: "text", md: "Now it's your turn. Change the numerators and denominators. Try to find:" },
        { t: "text", md: "1. Two fractions that add to **exactly one whole**.  \n2. A sum **bigger than one** — see how it becomes a mixed number like $1\\tfrac{1}{4}$.  \n3. A pair where the common denominator is **smaller** than the product of the denominators (hint: try 4 and 6)." },
        { t: "sim", slug: "fraction-kitchen", preset: "three-quarters-plus-half" },
      ],
    },
    {
      id: "meaning",
      blocks: [
        { t: "symbols", items: [
          { symbol: "\\frac{a}{b}", name: "fraction", meaning: "a pieces, each of size 1/b of the whole", values: "a any integer, b any non-zero integer" },
          { symbol: "a", name: "numerator", meaning: "how many pieces you have (counts)", values: "integer" },
          { symbol: "b", name: "denominator", meaning: "how many equal pieces make one whole (names the piece size)", values: "integer, never 0" },
          { symbol: "\\operatorname{lcm}(b, d)", name: "lowest common multiple", meaning: "smallest number both denominators divide into — the smallest shared piece size", values: "positive integer" },
          { symbol: "1\\tfrac{1}{4}", name: "mixed number", meaning: "one whole plus one quarter, i.e. $\\tfrac{5}{4}$", values: "" },
        ]},
        { t: "math", tex: "\\frac{a}{b} + \\frac{c}{d} = \\frac{a\\cdot\\frac{n}{b}}{n} + \\frac{c\\cdot\\frac{n}{d}}{n} = \\frac{a\\frac{n}{b} + c\\frac{n}{d}}{n}, \\qquad n = \\operatorname{lcm}(b, d)", caption: "General rule. n/b and n/d are the 're-cut' factors." },
        { t: "callout", kind: "warning", md: "**Domain:** a denominator can never be 0 — cutting a whole into 0 equal pieces is meaningless, and division by zero is undefined." },
      ],
    },
    {
      id: "worked",
      blocks: [
        { t: "steps", title: "Worked example: ½ + ⅓", steps: [
          { md: "Denominators are 2 and 3. The lowest common multiple is **6** (multiples of 2: 2, 4, **6**; multiples of 3: 3, **6**)." },
          { md: "Rewrite ½ with denominator 6. Since 2 × 3 = 6, multiply top **and** bottom by 3 (this doesn't change the value — it's ½ re-cut into smaller pieces).", tex: "\\frac{1}{2} = \\frac{1 \\times 3}{2 \\times 3} = \\frac{3}{6}" },
          { md: "Rewrite ⅓ with denominator 6. Since 3 × 2 = 6, multiply top and bottom by 2.", tex: "\\frac{1}{3} = \\frac{1 \\times 2}{3 \\times 2} = \\frac{2}{6}" },
          { md: "Now both are counts of sixths. Add the counts; the piece size (denominator) stays 6.", tex: "\\frac{3}{6} + \\frac{2}{6} = \\frac{3 + 2}{6} = \\frac{5}{6}" },
          { md: "Check it is in lowest terms: 5 and 6 share no common factor except 1. ✓  Sanity check: ⅚ is between ½ and 1, as we predicted." },
          { md: "**Exact vs approximate:** $\\frac{5}{6} = 0.8333\\ldots$ (the 3 repeats forever). Writing 0.83 is an *approximation*; $\\frac{5}{6}$ is exact." },
        ]},
        { t: "steps", title: "Second example: ¾ + ⅚ (sum greater than one)", steps: [
          { md: "LCM of 4 and 6 is 12 (not 24 — 12 is smaller and works).", tex: "\\frac{3}{4} = \\frac{9}{12},\\qquad \\frac{5}{6} = \\frac{10}{12}" },
          { md: "Add the twelfths.", tex: "\\frac{9}{12} + \\frac{10}{12} = \\frac{19}{12}" },
          { md: "19 twelfths is one whole (12 twelfths) and 7 more.", tex: "\\frac{19}{12} = 1\\tfrac{7}{12}" },
        ]},
      ],
    },
    {
      id: "try",
      blocks: [
        { t: "text", md: "Do the **first step** yourself: rewrite $\\frac{2}{3}$ so it has denominator 12. Type just the new numerator." },
        { t: "try", prompt: "$\\frac{2}{3} = \\frac{\\;?\\;}{12}$", answer: { kind: "integer", value: 8 },
          hints: ["Equivalent fractions: multiply top and bottom by the same number.", "What do you multiply 3 by to get 12?", "3 × 4 = 12, so multiply 2 by 4 as well."],
          solution: [{ md: "", tex: "\\frac{2}{3} = \\frac{2\\times 4}{3\\times 4} = \\frac{8}{12}" }], answerDisplay: "8",
          misconceptions: [{ id: "added", values: ["11"], feedback: "You added 9 to the top because 12 − 3 = 9. Adding changes the value — multiply instead." }] },
        { t: "text", md: "Now finish the sum: $\\frac{2}{3} + \\frac{1}{4}$. Give an exact fraction." },
        { t: "try", prompt: "$\\frac{2}{3} + \\frac{1}{4} = \\;?$", answer: { kind: "rational", value: "11/12" },
          hints: ["Use the common denominator 12.", "You already have ⅔ = 8/12. Now ¼ = ?/12.", "¼ = 3/12, so add 8 + 3 twelfths."],
          solution: [{ md: "", tex: "\\frac{8}{12} + \\frac{3}{12} = \\frac{11}{12}" }], answerDisplay: "11/12",
          misconceptions: [{ id: "add-tops-and-bottoms", values: ["3/7"], feedback: "3/7 comes from adding tops and bottoms. It's smaller than ⅔ alone — so it can't be right. Use twelfths." }] },
      ],
    },
    {
      id: "tools",
      blocks: [
        { t: "text", md: "Computers can do exact fraction arithmetic too — but only if you ask for fractions. Ordinary decimals (floating point) give approximations." },
        { t: "code", lang: "python", code: "from fractions import Fraction\nprint(Fraction(1, 2) + Fraction(1, 3))   # exact\nprint(1/2 + 1/3)                         # floating point", note: "Run this in any Python 3 environment. MCC's own exact rational engine computed the same values:", computed: [{ label: "Fraction(1,2) + Fraction(1,3)", value: "5/6" }, { label: "1/2 + 1/3 (floating point)", value: "0.8333333333333333 — an approximation of 5/6" }] },
        { t: "code", lang: "r", code: "library(MASS)\nfractions(1/2 + 1/3)", note: "In R (FY S2 uses RStudio), MASS::fractions() converts a decimal back to a fraction approximation. It *recovers* 5/6 here, but R stores 1/2 + 1/3 as a floating-point number internally." },
        { t: "callout", kind: "exact", md: "**Compare to your hand solution:** all three methods agree that the exact answer is $\\frac{5}{6}$; the decimal 0.8333… is labelled as approximate." },
      ],
    },
    {
      id: "practice",
      blocks: [
        { t: "text", md: "Fresh questions are generated from a seed each time. Hints unlock one at a time; the worked solution is always available but using it means the question won't count towards mastery." },
        { t: "practice", templates: ["fraction-add-unlike", "fraction-subtract", "equivalent-fraction-missing", "mixed-number-signed", "fraction-of-bar"], count: 6 },
      ],
    },
    {
      id: "apply",
      blocks: [
        { t: "text", md: "**Lab recipe.** A buffer protocol needs $\\frac{3}{4}$ litre of solution A and $\\frac{2}{3}$ litre of solution B. Your bottle holds $1\\tfrac{1}{2}$ litres. Will it all fit?" },
        { t: "try", prompt: "How many litres in total? (exact fraction or mixed number)", answer: { kind: "rational", value: "17/12" },
          hints: ["Add ¾ + ⅔ with a common denominator.", "Use twelfths: ¾ = 9/12, ⅔ = 8/12.", "9/12 + 8/12 = 17/12 = 1 5/12."],
          solution: [{ md: "", tex: "\\frac{3}{4} + \\frac{2}{3} = \\frac{9}{12} + \\frac{8}{12} = \\frac{17}{12} = 1\\tfrac{5}{12}\\text{ L}" }, { md: "The bottle holds $1\\tfrac{1}{2} = 1\\tfrac{6}{12}$ L, which is more than $1\\tfrac{5}{12}$ L — **it fits**, with $\\frac{1}{12}$ L to spare." }], answerDisplay: "17/12 L" },
        { t: "text", md: "**Measuring.** A plank is $2\\tfrac{1}{4}$ m long; you cut off $\\frac{5}{6}$ m. Try it in the Fraction Kitchen with a negative second fraction, or by hand: $\\frac{9}{4} - \\frac{5}{6} = \\frac{27}{12} - \\frac{10}{12} = \\frac{17}{12}$ m." },
      ],
    },
    {
      id: "mastery",
      blocks: [
        { t: "text", md: "Three questions, three representations: a **picture** (fraction of a bar), a **symbolic** sum, and a **word problem**-style signed mixed number. Your results update your mastery record for *Adding and subtracting fractions*." },
        { t: "mastery", templates: ["fraction-of-bar", "fraction-add-unlike", "mixed-number-signed"] },
      ],
    },
    {
      id: "next",
      blocks: [
        { t: "links", items: [
          { kind: "topic", id: "equivalent-fractions", label: "Struggling? Equivalent fractions", why: "One step back: making equal fractions with bigger denominators." },
          { kind: "sim", id: "fraction-kitchen", label: "Keep exploring in Fraction Kitchen" },
          { kind: "lesson", id: "percentages-and-decimals", label: "Next: decimals and percentages", why: "Fractions with denominator 100." },
          { kind: "academy", id: "fy-s1-01", label: "University: FY S1 Ch 01 Real Numbers", why: "ℚ, recurring decimals as fractions." },
        ]},
      ],
    },
  ],
};
