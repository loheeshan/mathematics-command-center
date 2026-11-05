import type { Lesson } from "../types";

export const percentages: Lesson = {
  slug: "percentages-and-decimals",
  title: "Decimals and percentages",
  topic: "percentages",
  alsoCovers: ["decimals"],
  level: 1,
  summary: "Per cent means ‘per hundred’: link fractions, decimals and percentages, and calculate discounts and increases with a single multiplier.",
  bridgesFor: ["fy-s2-01a", "fy-s2-02", "fy-s2-07"],
  stages: [
    { id: "why", blocks: [
      { t: "text", md: "“20% off”, “interest at 12%”, “a test that is 95% accurate”, “R² = 0.65 means 65% of variation explained”. Percentages are the most common way numbers reach you in news, shopping, medicine and data science." },
    ]},
    { id: "intuition", blocks: [
      { t: "text", mode: "simple", md: "Imagine a square cut into **100 equal small squares**. 35% means 35 of those squares. Because a percentage is always *out of 100*, it is just a fraction with denominator 100: $35\\% = \\frac{35}{100} = 0.35$." },
      { t: "text", mode: "simple", md: "Decimals use place value: the first digit after the point counts *tenths*, the second *hundredths*. So $0.35$ = 3 tenths + 5 hundredths = 35 hundredths." },
      { t: "text", mode: "formal", md: "$p\\% := \\frac{p}{100}$. A change of $p\\%$ multiplies a quantity by $(1 \\pm \\frac{p}{100})$. Successive changes multiply: $+10\\%$ then $-10\\%$ gives $1.1 \\times 0.9 = 0.99$, a 1% net decrease." },
      { t: "text", mode: "university", md: "Multipliers compose by multiplication, which is why growth over $n$ periods at rate $r$ is $(1 + r)^n$, and continuous growth leads to $e^{rt}$ (Level 2: exponentials). Probabilities are often quoted as percentages but computed as numbers in $[0, 1]$." },
      { t: "callout", kind: "warning", md: "**Percent of what?** A 50% rise followed by a 50% fall does *not* return to the start: $100 \\to 150 \\to 75$. Each percentage is of the *current* amount." },
    ]},
    { id: "visualize", blocks: [{ t: "sim", slug: "percent-grid", preset: "quarter", caption: "25% = 25 of 100 squares = ¼ = 0.25" }] },
    { id: "explore", blocks: [
      { t: "text", md: "Set a price and a discount. Then switch to *increase* with the same percentage. Is a 20% discount followed by a 20% increase back to the start? Use the readouts to check." },
      { t: "sim", slug: "percent-grid", preset: "discount" },
    ]},
    { id: "meaning", blocks: [
      { t: "symbols", items: [
        { symbol: "p\\%", name: "p per cent", meaning: "$\\frac{p}{100}$", values: "any number; >100% is allowed" },
        { symbol: "0.d_1d_2", name: "decimal", meaning: "$\\frac{d_1}{10} + \\frac{d_2}{100}$", values: "" },
        { symbol: "1 - \\tfrac{p}{100}", name: "decrease multiplier", meaning: "what fraction remains after a p% decrease", values: "" },
        { symbol: "1 + \\tfrac{p}{100}", name: "increase multiplier", meaning: "new amount as a fraction of the old", values: "" },
      ]},
      { t: "table", caption: "Equivalent forms", head: ["Fraction", "Decimal", "Percentage"], rows: [["$\\tfrac12$", "0.5", "50%"], ["$\\tfrac14$", "0.25", "25%"], ["$\\tfrac18$", "0.125", "12.5%"], ["$\\tfrac13$", "0.333… (recurring)", "33.3…%"]] },
    ]},
    { id: "worked", blocks: [
      { t: "steps", title: "15% of Rs 4,800", steps: [
        { md: "1% of 4,800 is 4,800 ÷ 100 = 48." },
        { md: "15% is 15 times that.", tex: "15 \\times 48 = 720" },
        { md: "Same thing with the multiplier:", tex: "0.15 \\times 4800 = 720" },
      ]},
      { t: "steps", title: "A Rs 4,800 item reduced by 15%", steps: [
        { md: "You pay 100% − 15% = 85% of the price.", tex: "0.85 \\times 4800 = 4080" },
        { md: "Check: 4,800 − 720 = 4,080 ✓" },
      ]},
      { t: "steps", title: "Write 0.375 as a fraction in lowest terms", steps: [
        { md: "Three decimal places → thousandths.", tex: "0.375 = \\frac{375}{1000}" },
        { md: "Divide top and bottom by 125.", tex: "\\frac{375}{1000} = \\frac{3}{8}" },
      ]},
    ]},
    { id: "try", blocks: [
      { t: "try", prompt: "What is the multiplier for a **30% decrease**?", answer: { kind: "numeric", value: 0.7, abs: 1e-9 }, hints: ["What percentage remains?", "100% − 30% = 70%.", "70% as a decimal."], solution: [{ md: "", tex: "1 - 0.30 = 0.70" }], answerDisplay: "0.7", misconceptions: [{ id: "change-only", values: ["0.3"], feedback: "0.3 is the size of the *change*. The multiplier gives what remains." }] },
      { t: "try", prompt: "A Rs 2,500 bag is reduced by 30%. Sale price (Rs)?", answer: { kind: "numeric", value: 1750, abs: 1e-9 }, hints: ["Use your multiplier.", "0.7 × 2500.", "7 × 250."], solution: [{ md: "", tex: "0.7 \\times 2500 = 1750" }], answerDisplay: "Rs 1,750", misconceptions: [{ id: "subtract-30", values: ["2470"], feedback: "You subtracted Rs 30, not 30%." }] },
    ]},
    { id: "tools", blocks: [
      { t: "code", lang: "r", code: "price <- 2500\nprice * (1 - 0.30)\nscales::percent(0.375)", note: "R gives 1750; `scales::percent` formats 0.375 as \"37.5%\" (requires the scales package). MCC's engine agrees: 0.7 × 2500 = 1750, 0.375 = 3/8 = 37.5%." },
    ]},
    { id: "practice", blocks: [{ t: "practice", templates: ["percent-of-quantity", "percent-change", "decimal-to-fraction"], count: 6 }] },
    { id: "apply", blocks: [
      { t: "text", md: "**Test accuracy.** A screening test is “95% accurate”. In a group of 2,000 healthy people, how many would it wrongly flag if it gives false positives 5% of the time?" },
      { t: "try", prompt: "False positives among 2,000 healthy people:", answer: { kind: "integer", value: 100 }, hints: ["5% of 2,000.", "1% of 2,000 is 20.", "5 × 20."], solution: [{ md: "", tex: "0.05 \\times 2000 = 100" }, { md: "This is why a positive result needs Bayes' theorem to interpret — see FY S2 Chapter 02." }], answerDisplay: "100" },
    ]},
    { id: "mastery", blocks: [{ t: "mastery", templates: ["percent-of-quantity", "percent-change", "decimal-to-fraction"] }] },
    { id: "next", blocks: [{ t: "links", items: [
      { kind: "lesson", id: "ratio-and-proportion", label: "Next: ratio and proportion" },
      { kind: "lesson", id: "fractions-adding-unlike", label: "Back: fractions" },
      { kind: "academy", id: "fy-s2-02", label: "University: Probability Theory (FY S2 Ch 02)" },
    ]}]},
  ],
};

export const ratio: Lesson = {
  slug: "ratio-and-proportion",
  title: "Ratio and proportion",
  topic: "ratio-proportion",
  alsoCovers: ["rates-unit-rates"],
  level: 1,
  summary: "Share amounts in a ratio, scale recipes and solutions, and find unit rates — the arithmetic behind concentrations, maps and best-value buying.",
  bridgesFor: ["fy-s2-01a"],
  stages: [
    { id: "why", blocks: [{ t: "text", md: "Diluting a stock solution 1 : 4, scaling a recipe from 4 to 10 servings, a map scale of 1 : 50 000, comparing the price per gram of two packs — all are ratio problems. In data science, class imbalance (e.g. 1 : 19 positives to negatives) is a ratio too." }] },
    { id: "intuition", blocks: [
      { t: "text", mode: "simple", md: "A ratio $a : b$ means: for every $a$ parts of the first thing there are $b$ parts of the second. All the *parts* are the same size. So a total is split into $a + b$ equal parts." },
      { t: "text", mode: "simple", md: "Scaling a ratio (multiplying both numbers by the same amount) keeps the *mixture* the same: 2 : 3 tastes exactly like 4 : 6." },
      { t: "text", mode: "formal", md: "$a : b$ corresponds to the fraction $\\frac{a}{a+b}$ of the whole for the first part. Two ratios are equivalent when $a:b = ka:kb$. Quantities $x, y$ are in direct proportion when $y = kx$ for a constant $k$ (the unit rate)." },
      { t: "text", mode: "university", md: "Direct proportion is the simplest linear model $y = kx$ — a line through the origin. Regression (FY S2 Ch 08) generalises this to $y = \\beta_0 + \\beta_1 x$ with noise." },
    ]},
    { id: "visualize", blocks: [{ t: "sim", slug: "ratio-mixer", preset: "buffer", caption: "3 : 2 splits 500 ml into 5 parts of 100 ml" }] },
    { id: "explore", blocks: [
      { t: "text", md: "Keep the ratio fixed and change the total. Which readouts change and which stay the same? Then make the ratio 4 : 6 — what does “simplest form” say?" },
      { t: "sim", slug: "ratio-mixer", preset: "recipe" },
    ]},
    { id: "meaning", blocks: [
      { t: "symbols", items: [
        { symbol: "a : b", name: "ratio", meaning: "a parts to b parts, all parts equal in size", values: "a, b > 0" },
        { symbol: "\\frac{a}{a+b}", name: "share of the first part", meaning: "fraction of the total belonging to the first quantity", values: "" },
        { symbol: "k", name: "unit rate", meaning: "amount per one unit, e.g. Rs per tube", values: "" },
      ]},
    ]},
    { id: "worked", blocks: [
      { t: "steps", title: "Share Rs 1,200 in the ratio 3 : 5", steps: [
        { md: "Total parts:", tex: "3 + 5 = 8" },
        { md: "One part:", tex: "1200 \\div 8 = 150" },
        { md: "Shares:", tex: "3 \\times 150 = 450,\\qquad 5 \\times 150 = 750" },
        { md: "Check: 450 + 750 = 1200 ✓ and 450 : 750 simplifies to 3 : 5 ✓" },
      ]},
      { t: "steps", title: "Unit rate: 6 test tubes cost Rs 180; cost of 11?", steps: [
        { md: "Cost of one:", tex: "180 \\div 6 = 30" },
        { md: "Cost of 11:", tex: "11 \\times 30 = 330" },
      ]},
    ]},
    { id: "try", blocks: [
      { t: "try", prompt: "Share 84 ml in the ratio 2 : 5. How many ml is **one part**?", answer: { kind: "integer", value: 12 }, hints: ["How many parts in total?", "2 + 5 = 7 parts.", "84 ÷ 7."], solution: [{ md: "", tex: "84 \\div 7 = 12" }], answerDisplay: "12 ml", misconceptions: [{ id: "divide-by-term", values: ["42", "16.8"], feedback: "Divide by the **total** number of parts (2 + 5), not by one term." }] },
      { t: "try", prompt: "So the larger share is how many ml?", answer: { kind: "integer", value: 60 }, hints: ["Larger share has 5 parts.", "5 × 12.", "60."], solution: [{ md: "", tex: "5 \\times 12 = 60\\ \\text{ml}" }], answerDisplay: "60 ml" },
    ]},
    { id: "tools", blocks: [{ t: "code", lang: "python", code: "total, a, b = 84, 2, 5\npart = total / (a + b)\nprint(a * part, b * part)", note: "MCC's engine: 24.0 and 60.0." }] },
    { id: "practice", blocks: [{ t: "practice", templates: ["ratio-share", "unit-rate"], count: 6 }] },
    { id: "apply", blocks: [
      { t: "text", md: "**Dilution.** A protocol says dilute stock with water 1 : 4. You need 250 ml in total. How much stock?" },
      { t: "try", prompt: "Stock needed (ml):", answer: { kind: "integer", value: 50 }, hints: ["1 + 4 = 5 parts.", "250 ÷ 5 = 50 ml per part.", "Stock is 1 part."], solution: [{ md: "", tex: "250 \\div 5 \\times 1 = 50\\ \\text{ml}" }], answerDisplay: "50 ml", misconceptions: [{ id: "quarter", values: ["62.5"], feedback: "1 : 4 is *1 part stock to 4 parts water* — 5 parts in total, so stock is 1/5, not 1/4." }] },
    ]},
    { id: "mastery", blocks: [{ t: "mastery", templates: ["ratio-share", "unit-rate", "percent-of-quantity"] }] },
    { id: "next", blocks: [{ t: "links", items: [
      { kind: "lesson", id: "solving-linear-equations", label: "Next: solving equations" },
      { kind: "lesson", id: "percentages-and-decimals", label: "Back: percentages" },
    ]}]},
  ],
};

export const linearEquations: Lesson = {
  slug: "solving-linear-equations",
  title: "Solving linear equations",
  topic: "linear-equations",
  alsoCovers: ["variables", "expressions-simplify"],
  level: 2,
  summary: "Letters as unknown numbers, and the balance rule: do the same to both sides until x stands alone.",
  bridgesFor: ["fy-s1-04b", "fy-s1-08b", "sy-s1-04a"],
  stages: [
    { id: "why", blocks: [{ t: "text", md: "“A taxi charges Rs 100 plus Rs 80 per km; the fare was Rs 660 — how far did I go?” is the equation $80x + 100 = 660$. Every formula you rearrange at university — from a regression line to an ODE's particular solution — uses the same moves." }] },
    { id: "intuition", blocks: [
      { t: "text", mode: "simple", md: "An equation is a **balance**: the left side weighs exactly the same as the right. $x$ is a bag with an unknown number inside. You may do anything you like — add, subtract, multiply, divide by a non-zero number — **as long as you do it to both sides**, so the balance stays level." },
      { t: "text", mode: "simple", md: "To find $x$, *undo* what was done to it, in reverse order. In $3x + 4 = 19$, $x$ was multiplied by 3 and then 4 was added. So: subtract 4, then divide by 3." },
      { t: "text", mode: "formal", md: "If $A = B$ then $A + c = B + c$ and $kA = kB$ for any $c$ and any $k \\ne 0$. These operations are reversible, so the transformed equation has exactly the same solution set. A linear equation $ax + b = c$ with $a \\ne 0$ has the unique solution $x = \\frac{c - b}{a}$." },
      { t: "text", mode: "university", md: "Equivalence-preserving operations are the 1-D case of the row operations used in Gaussian elimination (FY S1 Ch 08). Multiplying by 0 is forbidden because it is not reversible — it destroys information (every $x$ satisfies $0 = 0$)." },
    ]},
    { id: "visualize", blocks: [{ t: "sim", slug: "balance-equation", preset: "two-step", caption: "3x + 4 = 19: subtract 4 from both sides, then divide by 3" }] },
    { id: "explore", blocks: [
      { t: "text", md: "Solve the preset with *x on both sides*. Notice the **solution readout never changes** no matter which legal step you take — that is what ‘doing the same to both sides’ guarantees." },
      { t: "sim", slug: "balance-equation", preset: "both-sides" },
    ]},
    { id: "meaning", blocks: [
      { t: "symbols", items: [
        { symbol: "x", name: "unknown / variable", meaning: "a number we don't know yet", values: "any real number unless stated" },
        { symbol: "3x", name: "coefficient times variable", meaning: "3 multiplied by x", values: "" },
        { symbol: "=", name: "equals", meaning: "both sides have the same value", values: "" },
        { symbol: "\\Rightarrow", name: "implies", meaning: "the next line follows from this one", values: "" },
      ]},
    ]},
    { id: "worked", blocks: [
      { t: "steps", title: "Solve 5x − 4 = 2x + 11", steps: [
        { md: "Collect x terms on the left: subtract 2x from both sides.", tex: "3x - 4 = 11" },
        { md: "Undo −4: add 4 to both sides.", tex: "3x = 15" },
        { md: "Undo ×3: divide both sides by 3.", tex: "x = 5" },
        { md: "**Check** by substituting into the original: left $5(5) - 4 = 21$, right $2(5) + 11 = 21$ ✓" },
      ]},
      { t: "steps", title: "A fractional answer: −3x + 7 = −8 + 2", steps: [
        { md: "Simplify the right side first.", tex: "-3x + 7 = -6" },
        { md: "Subtract 7.", tex: "-3x = -13" },
        { md: "Divide by −3 (negative ÷ negative = positive).", tex: "x = \\frac{13}{3} = 4\\tfrac13" },
        { md: "Exact answer $\\frac{13}{3}$; the decimal 4.333… is only an approximation." },
      ]},
    ]},
    { id: "try", blocks: [
      { t: "try", prompt: "First step for $4x + 9 = 1$: subtract 9 from both sides. What is the new right-hand side?", answer: { kind: "integer", value: -8 }, hints: ["Compute 1 − 9.", "Start at 1 and move 9 left.", "−8."], solution: [{ md: "", tex: "4x = 1 - 9 = -8" }], answerDisplay: "−8", misconceptions: [{ id: "added", values: ["10"], feedback: "To undo +9 you subtract 9." }] },
      { t: "try", prompt: "Now finish: $x = \\;?$", answer: { kind: "rational", value: "-2" }, hints: ["4x = −8.", "Divide both sides by 4.", "−8 ÷ 4."], solution: [{ md: "", tex: "x = -8 \\div 4 = -2" }], answerDisplay: "−2", misconceptions: [{ id: "sign", values: ["2"], feedback: "−8 ÷ 4 is negative." }] },
    ]},
    { id: "tools", blocks: [{ t: "code", lang: "python", code: "from sympy import symbols, Eq, solve\nx = symbols('x')\nprint(solve(Eq(5*x - 4, 2*x + 11), x))", note: "SymPy (a free Python library) returns [5]. MCC's engine checks your answers by substituting them back, the same way a careful student does." }] },
    { id: "practice", blocks: [{ t: "practice", templates: ["linear-one-side", "linear-both-sides", "simplify-linear-expression"], count: 6 }] },
    { id: "apply", blocks: [
      { t: "text", md: "**Taxi fare.** Rs 100 flag fall plus Rs 80 per km. The fare was Rs 660. How many km?" },
      { t: "try", prompt: "Distance (km):", answer: { kind: "rational", value: "7" }, hints: ["Write the equation 80x + 100 = 660.", "Subtract 100: 80x = 560.", "Divide by 80."], solution: [{ md: "", tex: "80x + 100 = 660 \\Rightarrow 80x = 560 \\Rightarrow x = 7" }], answerDisplay: "7 km" },
    ]},
    { id: "mastery", blocks: [{ t: "mastery", templates: ["linear-one-side", "linear-both-sides", "simplify-linear-expression"] }] },
    { id: "next", blocks: [{ t: "links", items: [
      { kind: "lesson", id: "slope-and-straight-lines", label: "Next: graphs and slope", why: "Every linear equation is a straight line." },
      { kind: "lesson", id: "number-line-signed-numbers", label: "Stuck on signs? Negative numbers" },
      { kind: "sim", id: "balance-equation", label: "Balance-the-Equation Lab" },
    ]}]},
  ],
};

export const slope: Lesson = {
  slug: "slope-and-straight-lines",
  title: "Coordinates, slope and straight lines",
  topic: "slope-intercept",
  alsoCovers: ["coordinate-plane"],
  level: 2,
  summary: "Plot points, measure steepness as rise over run, and write any straight line as y = mx + c.",
  bridgesFor: ["fy-s1-04b", "fy-s1-07b", "fy-s2-08", "sy-s1-nr"],
  stages: [
    { id: "why", blocks: [{ t: "text", md: "Speed is the slope of a distance–time graph. A regression line's slope says how much stopping distance grows per mph (FY S2 Ch 08). And a **derivative** is just the slope of a curve at one point. Slope is the bridge from algebra to calculus." }] },
    { id: "intuition", blocks: [
      { t: "text", mode: "simple", md: "A point $(x, y)$ is an address: go $x$ steps right (left if negative), then $y$ steps up (down if negative)." },
      { t: "text", mode: "simple", md: "Slope measures steepness: how many steps **up** you go for every **one** step right. Walk from point A to point B: the **rise** is the change in height, the **run** is the change sideways. Slope = rise ÷ run. Uphill (left to right) is positive, downhill negative, flat is 0, and a vertical wall has *no* slope (you can't divide by a run of 0)." },
      { t: "text", mode: "formal", md: "Through $A(x_1, y_1)$ and $B(x_2, y_2)$ with $x_1 \\ne x_2$: $m = \\frac{y_2 - y_1}{x_2 - x_1}$. Every non-vertical line is the graph of $y = mx + c$, where $c$ is the y-intercept. Slope is a rate: units of $y$ per unit of $x$." },
      { t: "text", mode: "university", md: "Linear functions have constant rate of change: $\\frac{f(x+h) - f(x)}{h} = m$ for every $h \\ne 0$. For non-linear $f$ this difference quotient depends on $h$, and its limit as $h \\to 0$ is the derivative (FY S1 Ch 07B)." },
    ]},
    { id: "visualize", blocks: [{ t: "sim", slug: "slope-lab", preset: "positive", caption: "Rise (green) over run (blue)" }] },
    { id: "explore", blocks: [
      { t: "text", md: "1. Make the slope exactly **0**. 2. Make it **−2**. 3. Drag B directly above A — what happens? 4. Keep the slope but change the intercept: which point do you have to move?" },
      { t: "sim", slug: "slope-lab", preset: "negative" },
    ]},
    { id: "meaning", blocks: [
      { t: "symbols", items: [
        { symbol: "(x, y)", name: "ordered pair", meaning: "horizontal position, then vertical position", values: "" },
        { symbol: "m", name: "slope / gradient", meaning: "rise per unit run", values: "any real number; undefined for vertical lines" },
        { symbol: "c", name: "y-intercept", meaning: "value of y when x = 0", values: "" },
        { symbol: "y = mx + c", name: "slope–intercept form", meaning: "all points on the line satisfy it", values: "" },
        { symbol: "\\Delta y,\\ \\Delta x", name: "change in y, change in x", meaning: "rise and run", values: "" },
      ]},
    ]},
    { id: "worked", blocks: [
      { t: "steps", title: "Line through A(−1, 5) and B(3, −3)", steps: [
        { md: "Rise:", tex: "\\Delta y = -3 - 5 = -8" },
        { md: "Run:", tex: "\\Delta x = 3 - (-1) = 4" },
        { md: "Slope:", tex: "m = \\frac{-8}{4} = -2" },
        { md: "Intercept: substitute A into $y = -2x + c$.", tex: "5 = -2(-1) + c \\Rightarrow c = 3" },
        { md: "Equation, then check with B: $-2(3) + 3 = -3$ ✓", tex: "y = -2x + 3" },
      ]},
    ]},
    { id: "try", blocks: [
      { t: "try", prompt: "Line through $(2, 1)$ and $(6, 9)$: what is the **rise**?", answer: { kind: "integer", value: 8 }, hints: ["Rise is the change in y.", "y₂ − y₁.", "9 − 1."], solution: [{ md: "", tex: "9 - 1 = 8" }], answerDisplay: "8" },
      { t: "try", prompt: "And the slope?", answer: { kind: "rational", value: "2" }, hints: ["Run = 6 − 2.", "Run is 4.", "8 ÷ 4."], solution: [{ md: "", tex: "m = \\frac{8}{4} = 2" }], answerDisplay: "2", misconceptions: [{ id: "run-over-rise", values: ["1/2", "0.5"], feedback: "That's run ÷ rise. Slope is rise ÷ run." }] },
    ]},
    { id: "tools", blocks: [{ t: "code", lang: "r", code: "x <- c(2, 6); y <- c(1, 9)\ncoef(lm(y ~ x))", note: "With two points, least-squares regression gives the exact line: intercept −3, slope 2 (MCC's engine agrees: y = 2x − 3)." }] },
    { id: "practice", blocks: [{ t: "practice", templates: ["slope-two-points", "line-equation", "coordinate-quadrant"], count: 6 }] },
    { id: "apply", blocks: [
      { t: "text", md: "**Stopping distance.** R's `cars` data gives the fitted line $\\widehat{\\text{dist}} = -17.58 + 3.93\\,\\text{speed}$. By how many feet does predicted stopping distance grow for each extra mph?" },
      { t: "try", prompt: "Feet per mph:", answer: { kind: "numeric", value: 3.93, dp: 2 }, hints: ["The slope is the rate of change.", "Which number multiplies speed?", "3.93."], solution: [{ md: "The slope 3.93 ft per mph. The intercept −17.58 is not meaningful physically (a speed of 0 can't stop in negative distance) — it only positions the line within the data range." }], answerDisplay: "≈ 3.93 ft per mph" },
      { t: "sim", slug: "regression-studio", preset: "cars" },
    ]},
    { id: "mastery", blocks: [{ t: "mastery", templates: ["slope-two-points", "line-equation", "coordinate-quadrant"] }] },
    { id: "next", blocks: [{ t: "links", items: [
      { kind: "lesson", id: "limits-intuition", label: "Next (university bridge): limits", why: "What happens to a slope as two points merge?" },
      { kind: "lesson", id: "derivative-as-slope", label: "Derivatives as slope" },
      { kind: "lesson", id: "solving-linear-equations", label: "Back: equations" },
    ]}]},
  ],
};
