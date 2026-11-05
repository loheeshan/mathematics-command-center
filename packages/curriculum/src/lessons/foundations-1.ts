import type { Lesson } from "../types";

export const signedNumbers: Lesson = {
  slug: "number-line-signed-numbers",
  title: "Negative numbers on the number line",
  topic: "negative-numbers",
  alsoCovers: ["number-line"],
  level: 0,
  summary: "Adding and subtracting with negative numbers as movement along a line — including why subtracting a negative moves you right.",
  bridgesFor: ["fy-s1-01", "fy-s1-08a", "fy-s1-08b"],
  stages: [
    { id: "why", blocks: [
      { t: "text", md: "Temperatures drop below zero, bank balances go overdrawn, a lift goes down to basement level −2. **Negative numbers** describe amounts *below a reference point*." },
      { t: "text", md: "Every later topic uses them: slopes that go downhill, matrices with negative entries, a determinant of −80, a loss that decreases. Getting the sign right is half of most university marks." },
    ]},
    { id: "intuition", blocks: [
      { t: "text", mode: "simple", md: "Picture a straight road with a marker at **0**. Positive numbers are to the right, negative numbers to the left. The number tells you *where you are*; adding tells you *how to move*." },
      { t: "text", mode: "simple", md: "- **Adding a positive** number: walk right.\n- **Adding a negative** number: walk left.\n- **Subtracting** a number: do the *opposite* of adding it. So subtracting a negative means walking **right**." },
      { t: "text", mode: "formal", md: "For each integer $a$ there is an additive inverse $-a$ with $a + (-a) = 0$. Subtraction is defined as adding the inverse: $a - b := a + (-b)$. Hence $a - (-b) = a + b$. The absolute value $|a|$ is the distance from $a$ to $0$." },
      { t: "text", mode: "university", md: "$(\\mathbb{Z}, +)$ is a group: closed, associative, identity $0$, inverses $-a$. Subtraction is not a separate operation but $a + (-b)$; this is why it is neither commutative nor associative. FY S1 Chapter 01 builds $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$ on top of this." },
      { t: "callout", kind: "analogy", md: "**Money analogy:** a negative number is a debt. Removing (subtracting) a debt of Rs 5 makes you Rs 5 richer: $10 - (-5) = 15$. The analogy is weak for multiplication — 'multiplying two debts' has no everyday meaning — so for $(-)\\times(-)$ we use the pattern argument in *Math meaning*." },
    ]},
    { id: "visualize", blocks: [
      { t: "text", md: "The blue dot is where you start; the orange arrow is the move; the orange dot is the answer." },
      { t: "sim", slug: "number-line", preset: "add-negative", caption: "4 + (−7): move 7 left from 4, land on −3" },
    ]},
    { id: "explore", blocks: [
      { t: "text", md: "Switch the operation to **subtract** and make $b$ negative. Predict where you will land *before* you look. Then try fractions: the third preset moves in quarter steps." },
      { t: "sim", slug: "number-line", preset: "subtract-negative" },
    ]},
    { id: "meaning", blocks: [
      { t: "symbols", items: [
        { symbol: "-5", name: "negative five", meaning: "5 units to the left of 0", values: "any number can be negative" },
        { symbol: "-(-5)", name: "the opposite of −5", meaning: "the number that adds to −5 to make 0, i.e. 5", values: "" },
        { symbol: "a - b", name: "subtraction", meaning: "shorthand for $a + (-b)$", values: "" },
        { symbol: "|a|", name: "absolute value", meaning: "distance from 0 (never negative)", values: "$|a| \\ge 0$" },
      ]},
      { t: "table", caption: "Multiplication sign rule — the pattern that forces (−)×(−) = +", head: ["", "", ""], rows: [["$3 \\times (-2) = -6$", "$2 \\times (-2) = -4$", "$1 \\times (-2) = -2$"], ["$0 \\times (-2) = 0$", "$(-1) \\times (-2) = ?$", "Each step down adds 2, so $? = 2$"]] },
      { t: "callout", kind: "note", md: "**Same signs → positive, different signs → negative** for both × and ÷. For + and −, think about *movement*, not a sign rule." },
    ]},
    { id: "worked", blocks: [
      { t: "steps", title: "Worked example: −3 − (−8)", steps: [
        { md: "Subtracting is adding the opposite. The opposite of −8 is +8.", tex: "-3 - (-8) = -3 + 8" },
        { md: "Start at −3 and move 8 to the right: −2, −1, 0, 1, 2, 3, 4, 5.", tex: "-3 + 8 = 5" },
        { md: "Check with money: you owe 3, and a debt of 8 is cancelled — you end up 5 ahead. ✓" },
      ]},
      { t: "steps", title: "Worked example: (−6) × 4 ÷ (−3)", steps: [
        { md: "Work left to right for × and ÷. Different signs → negative.", tex: "(-6) \\times 4 = -24" },
        { md: "Same signs (both negative) → positive.", tex: "-24 \\div (-3) = 8" },
      ]},
    ]},
    { id: "try", blocks: [
      { t: "text", md: "Rewrite $7 - (-4)$ as an addition. What number are you adding to 7?" },
      { t: "try", prompt: "$7 - (-4) = 7 + \\;?$", answer: { kind: "integer", value: 4 }, hints: ["Subtracting a number = adding its opposite.", "What is the opposite of −4?", "The opposite of −4 is 4."], solution: [{ md: "", tex: "7 - (-4) = 7 + 4 = 11" }], answerDisplay: "4", misconceptions: [{ id: "kept-sign", values: ["-4"], feedback: "Adding −4 would be the same as subtracting 4. Subtracting −4 is adding its **opposite**." }] },
      { t: "try", prompt: "Now finish: $7 - (-4) = \\;?$", answer: { kind: "integer", value: 11 }, hints: ["You rewrote it as 7 + 4.", "Start at 7 and move 4 right.", "8, 9, 10, 11."], solution: [{ md: "", tex: "7 + 4 = 11" }], answerDisplay: "11", misconceptions: [{ id: "subtracted", values: ["3"], feedback: "3 is 7 − 4. But we are subtracting **negative** 4, which moves right." }] },
    ]},
    { id: "tools", blocks: [
      { t: "text", md: "Calculators need the **negative key** (−) or brackets. Typing `7 - -4` works in Python; on many phone calculators you must type `7 − (−4)`." },
      { t: "code", lang: "python", code: "print(7 - (-4))\nprint(-3 - (-8))\nprint((-6) * 4 / (-3))", note: "Expected output (computed by MCC's engine):", computed: [{ label: "7 - (-4)", value: "11" }, { label: "-3 - (-8)", value: "5" }, { label: "(-6) * 4 / (-3)", value: "8.0 (Python prints division results as decimals)" }] },
      { t: "callout", kind: "warning", md: "Typing `-3^2` gives **−9** in most calculators and in Python (`-3**2`), because the power is done before the minus. $(-3)^2 = 9$ needs brackets." },
    ]},
    { id: "practice", blocks: [{ t: "practice", templates: ["signed-add", "signed-subtract", "signed-multiply"], count: 6 }] },
    { id: "apply", blocks: [
      { t: "text", md: "**Weather.** At 6 am it is −4 °C in Nuwara Eliya's frost hollows (an illustrative value). By noon the temperature has risen 13 degrees. What is it at noon?" },
      { t: "try", prompt: "Temperature at noon (°C):", answer: { kind: "integer", value: 9 }, hints: ["Rising means moving right on the number line.", "Compute −4 + 13.", "From −4, 4 steps reach 0, then 9 more."], solution: [{ md: "", tex: "-4 + 13 = 9\\ ^\\circ\\text{C}" }], answerDisplay: "9 °C" },
      { t: "text", md: "**Bank balance.** You have −Rs 2,500 (overdrawn). The bank reverses a wrong charge of Rs 3,000, i.e. it *subtracts a negative*: $-2500 - (-3000) = 500$." },
    ]},
    { id: "mastery", blocks: [{ t: "mastery", templates: ["signed-add", "signed-subtract", "signed-multiply"] }] },
    { id: "next", blocks: [{ t: "links", items: [
      { kind: "lesson", id: "order-of-operations", label: "Next: order of operations", why: "Combine signed numbers with ×, ÷ and powers." },
      { kind: "sim", id: "number-line", label: "Number Line Explorer" },
      { kind: "lesson", id: "fractions-adding-unlike", label: "Fractions: ½ + ⅓" },
      { kind: "academy", id: "fy-s1-01", label: "University: Real Numbers (FY S1 Ch 01)" },
    ]}]},
  ],
};

export const orderOfOperations: Lesson = {
  slug: "order-of-operations",
  title: "Order of operations (BODMAS)",
  topic: "order-of-operations",
  alsoCovers: ["four-operations"],
  level: 0,
  summary: "Why 2 + 3 × 4 is 14, not 20 — the agreed order that lets everyone read a calculation the same way.",
  bridgesFor: ["fy-s1-03", "fy-s1-05"],
  stages: [
    { id: "why", blocks: [
      { t: "text", md: "A shop sells pens at Rs 30 each. You buy a notebook for Rs 200 and 3 pens. The bill is $200 + 3 \\times 30$. If you added first you'd get $203 \\times 30 = 6090$ — clearly wrong. The correct total is $200 + 90 = 290$." },
      { t: "text", md: "Maths needs one agreed reading order so that a formula means the same thing to everyone — and to every computer. Spreadsheets, Python and R all follow it." },
    ]},
    { id: "intuition", blocks: [
      { t: "text", mode: "simple", md: "Think of multiplication as a *packet*: $3 \\times 30$ is “three packets of 30”, one single amount. Packets are made **before** they are added to anything. Powers are packets of packets, so they come even earlier. Brackets say “do me first” explicitly." },
      { t: "text", mode: "simple", md: "**B**rackets → **O**rders (powers, roots) → **D**ivision and **M**ultiplication (left to right) → **A**ddition and **S**ubtraction (left to right)." },
      { t: "text", mode: "formal", md: "Operators have precedence levels: $(\\,)$ > exponentiation > $\\times, \\div$ > $+, -$. Operators of equal precedence associate left-to-right, except exponentiation, which associates right-to-left: $2^{3^2} = 2^9$." },
      { t: "text", mode: "university", md: "Precedence is a parsing convention that turns a string into a unique expression tree. MCC's own answer checker parses learner input into such a tree (via a vetted parser) and then compares trees numerically — never as strings." },
      { t: "callout", kind: "warning", md: "D and M are **equal** rank, as are A and S: do them left to right. $12 \\div 3 \\times 2 = 4 \\times 2 = 8$, not $12 \\div 6 = 2$." },
    ]},
    { id: "visualize", blocks: [
      { t: "text", md: "Expression trees show the order: the operation done **last** sits at the top." },
      { t: "math", tex: "2 + 3 \\times 4 \\quad\\Longrightarrow\\quad \\underbrace{2}_{} + \\underbrace{(3 \\times 4)}_{12} = 14", caption: "Multiplication binds tighter, so it is computed first." },
      { t: "math", tex: "(2 + 3) \\times 4 \\quad\\Longrightarrow\\quad \\underbrace{(2 + 3)}_{5} \\times 4 = 20", caption: "Brackets override the default order." },
      { t: "sim", slug: "graphing-studio", caption: "Try typing 2 + 3*x and (2 + 3)*x — different graphs, different meanings." },
    ]},
    { id: "explore", blocks: [
      { t: "text", md: "Put brackets into $8 - 2 \\times 3 + 1$ in different places. How many different answers can you make? (Answers: 3 with no brackets, 19 for $(8-2)\\times 3 + 1$, 0 for $8 - 2\\times(3+1)$, and $(8-2)\\times(3+1) = 24$.) Check each in the Graphing Studio by replacing a number with x and probing at that value." },
      { t: "sim", slug: "graphing-studio" },
    ]},
    { id: "meaning", blocks: [
      { t: "symbols", items: [
        { symbol: "( \\; )", name: "brackets / parentheses", meaning: "evaluate the inside first", values: "" },
        { symbol: "a^n", name: "power (order)", meaning: "n copies of a multiplied", values: "" },
        { symbol: "\\times,\\ \\div", name: "multiply, divide", meaning: "same rank — left to right", values: "divisor ≠ 0" },
        { symbol: "+,\\ -", name: "add, subtract", meaning: "same rank — left to right", values: "" },
        { symbol: "\\frac{a}{b}", name: "fraction bar", meaning: "acts like brackets around the top and the bottom", values: "$b \\ne 0$" },
      ]},
    ]},
    { id: "worked", blocks: [
      { t: "steps", title: "Worked example: 20 − 4 × 3 + 2²", steps: [
        { md: "Orders first:", tex: "2^2 = 4" },
        { md: "Multiplication:", tex: "4 \\times 3 = 12" },
        { md: "Now only + and −, left to right:", tex: "20 - 12 + 4 = 8 + 4 = 12" },
      ]},
      { t: "steps", title: "Worked example with a fraction bar: (6 + 9) / (2 + 3)", steps: [
        { md: "The fraction bar groups the top and bottom.", tex: "\\frac{6 + 9}{2 + 3} = \\frac{15}{5} = 3" },
        { md: "Typed into a computer you must write `(6 + 9)/(2 + 3)`. Without brackets, `6 + 9/2 + 3` means $6 + 4.5 + 3 = 13.5$." },
      ]},
    ]},
    { id: "try", blocks: [
      { t: "try", prompt: "In $5 + 6 \\times 2^2$, which operation do you do **first**? Type its result.", answer: { kind: "integer", value: 4 }, hints: ["Brackets, then Orders…", "Is there a power?", "2² = 4."], solution: [{ md: "Powers come first:", tex: "2^2 = 4" }], answerDisplay: "4", misconceptions: [{ id: "add-first", values: ["11"], feedback: "Addition comes last. Look for a power first." }] },
      { t: "try", prompt: "Now evaluate $5 + 6 \\times 2^2$.", answer: { kind: "integer", value: 29 }, hints: ["You have 5 + 6 × 4.", "Multiply next: 6 × 4.", "5 + 24."], solution: [{ md: "", tex: "5 + 6 \\times 4 = 5 + 24 = 29" }], answerDisplay: "29", misconceptions: [{ id: "left-to-right", values: ["176", "149"], feedback: "Strict left-to-right gives the wrong answer here: multiplication comes before addition." }] },
    ]},
    { id: "tools", blocks: [
      { t: "code", lang: "python", code: "print(2 + 3 * 4)\nprint((2 + 3) * 4)\nprint(-3**2, (-3)**2)\nprint(2**3**2)", note: "Python follows the same precedence (and `**` is right-associative). MCC's engine gives:", computed: [{ label: "2 + 3 * 4", value: "14" }, { label: "(2 + 3) * 4", value: "20" }, { label: "-3**2, (-3)**2", value: "-9 9" }, { label: "2**3**2", value: "512 (= 2⁹)" }] },
      { t: "code", lang: "r", code: "2 + 3 * 4\n-3^2\n(-3)^2", note: "R agrees: 14, −9, 9." },
    ]},
    { id: "practice", blocks: [{ t: "practice", templates: ["order-of-operations", "signed-multiply", "power-evaluate"], count: 6 }] },
    { id: "apply", blocks: [
      { t: "text", md: "**Spreadsheet formula.** A lab marks sheet computes a final mark as `=0.4*A2 + 0.6*B2`. For coursework 70 and exam 55, what is the final mark?" },
      { t: "try", prompt: "Final mark:", answer: { kind: "numeric", value: 61, abs: 1e-9 }, hints: ["Multiplications before the addition.", "0.4 × 70 = 28 and 0.6 × 55 = 33.", "28 + 33."], solution: [{ md: "", tex: "0.4 \\times 70 + 0.6 \\times 55 = 28 + 33 = 61" }], answerDisplay: "61", misconceptions: [{ id: "left-to-right", values: ["1573"], feedback: "Working strictly left to right mixes the weights up. Each weight multiplies only its own mark." }] },
    ]},
    { id: "mastery", blocks: [{ t: "mastery", templates: ["order-of-operations", "power-evaluate", "signed-multiply"] }] },
    { id: "next", blocks: [{ t: "links", items: [
      { kind: "lesson", id: "fractions-adding-unlike", label: "Next: fractions", why: "Fraction bars behave like brackets." },
      { kind: "lesson", id: "number-line-signed-numbers", label: "Back: negative numbers" },
      { kind: "topic", id: "substitution", label: "Substitution into formulae", why: "Order of operations with letters." },
    ]}]},
  ],
};
