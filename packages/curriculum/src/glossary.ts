/** Plain-language glossary used for tooltips and the Library. Original MCC wording. */
export interface GlossaryEntry {
  term: string;
  tex?: string;
  plain: string;
  topic: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: "integer", tex: "\\mathbb{Z}", plain: "A whole number that can be positive, negative or zero: …, −2, −1, 0, 1, 2, …", topic: "negative-numbers" },
  { term: "numerator", plain: "The top number of a fraction: how many equal pieces you have.", topic: "fractions-meaning" },
  { term: "denominator", plain: "The bottom number of a fraction: how many equal pieces make one whole. Never 0.", topic: "fractions-meaning" },
  { term: "equivalent fractions", plain: "Fractions with the same value, made by multiplying top and bottom by the same non-zero number (½ = 3/6).", topic: "equivalent-fractions" },
  { term: "lowest common multiple (LCM)", plain: "The smallest number that two numbers both divide into exactly. LCM(4, 6) = 12.", topic: "gcd-lcm" },
  { term: "mixed number", plain: "A whole number plus a proper fraction, like 1¾ = 7/4.", topic: "mixed-numbers" },
  { term: "percentage", tex: "\\%", plain: "A number out of 100. 35% = 35/100 = 0.35.", topic: "percentages" },
  { term: "ratio", tex: "a:b", plain: "A comparison of two quantities by division; a:b splits a total into a + b equal parts.", topic: "ratio-proportion" },
  { term: "variable", tex: "x", plain: "A letter standing for a number we don't know yet, or for a quantity that can change.", topic: "variables" },
  { term: "equation", plain: "A statement that two expressions are equal. Solving it means finding the values that make it true.", topic: "linear-equations" },
  { term: "slope (gradient)", tex: "m", plain: "Rise over run: how much y changes for each 1 unit increase in x.", topic: "slope-intercept" },
  { term: "y-intercept", tex: "c", plain: "Where a line crosses the y-axis — the value of y when x = 0.", topic: "slope-intercept" },
  { term: "function", tex: "f(x)", plain: "A rule that gives exactly one output for each allowed input.", topic: "functions-notation" },
  { term: "domain", plain: "The set of inputs a function is allowed to take.", topic: "functions-notation" },
  { term: "range", plain: "The set of outputs a function actually produces.", topic: "functions-notation" },
  { term: "discriminant", tex: "b^2-4ac", plain: "For ax²+bx+c: positive → two real roots, zero → one repeated root, negative → no real roots.", topic: "quadratics" },
  { term: "radian", plain: "The angle that cuts off an arc equal to the radius. 180° = π radians.", topic: "radians" },
  { term: "set", tex: "\\{\\,\\}", plain: "A well-defined collection of distinct objects, called elements.", topic: "sets" },
  { term: "union", tex: "A\\cup B", plain: "Everything in A or B (or both).", topic: "sets" },
  { term: "intersection", tex: "A\\cap B", plain: "Everything in both A and B.", topic: "sets" },
  { term: "implication", tex: "P\\Rightarrow Q", plain: "'If P then Q'. False only when P is true and Q is false.", topic: "propositional-logic" },
  { term: "contrapositive", tex: "\\sim Q\\Rightarrow \\sim P", plain: "Swap and negate an implication. Always logically equivalent to the original.", topic: "propositional-logic" },
  { term: "congruent modulo m", tex: "a\\equiv b \\pmod m", plain: "a and b leave the same remainder when divided by m (equivalently m divides a − b).", topic: "modular-arithmetic" },
  { term: "limit", tex: "\\lim_{x\\to a} f(x)", plain: "The value f(x) gets arbitrarily close to as x gets close to a (not necessarily f(a) itself).", topic: "limits" },
  { term: "derivative", tex: "f'(x)", plain: "The instantaneous rate of change: the slope of the tangent line, defined as a limit of secant slopes.", topic: "derivative-definition" },
  { term: "definite integral", tex: "\\int_a^b f(x)\\,dx", plain: "Signed area between the graph and the x-axis from a to b (area below the axis counts negative).", topic: "definite-integrals" },
  { term: "determinant", tex: "\\det A", plain: "A number from a square matrix: the factor by which the matrix scales area (2×2) or volume (3×3); 0 means not invertible.", topic: "determinants" },
  { term: "minor", tex: "M_{ij}", plain: "The determinant left after deleting row i and column j.", topic: "determinants" },
  { term: "cofactor", tex: "C_{ij}", plain: "The minor with a checkerboard sign: C_ij = (−1)^(i+j) M_ij.", topic: "determinants" },
  { term: "dot product", tex: "\\mathbf a\\cdot\\mathbf b", plain: "a₁b₁ + a₂b₂ + a₃b₃ = |a||b|cos θ. Zero means perpendicular.", topic: "dot-cross-product" },
  { term: "random variable", tex: "X", plain: "A function that assigns a number to each outcome of a random experiment.", topic: "random-variables" },
  { term: "expectation", tex: "E[X]", plain: "The probability-weighted average of a random variable's values.", topic: "expectation-variance" },
  { term: "standard deviation", tex: "\\sigma", plain: "A typical distance of values from the mean; the square root of the variance.", topic: "variability" },
  { term: "p-value", plain: "If the null hypothesis were true, the probability of data at least as extreme as observed. Not the probability the null is true.", topic: "hypothesis-testing" },
  { term: "residual", tex: "e_i = y_i - \\hat y_i", plain: "Observed minus predicted value in a regression.", topic: "linear-regression" },
  { term: "learning rate", tex: "\\eta", plain: "Step size in gradient descent. Too small: slow. Too large: oscillation or divergence.", topic: "gradient-descent" },
];
