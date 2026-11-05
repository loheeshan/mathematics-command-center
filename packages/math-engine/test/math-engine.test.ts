import { describe, expect, it } from "vitest";
import {
  Rational, parseRational, gcd, lcm, createRng,
  derivative, riemannSum, simpson, newtonRaphson, bisection, eulerMethod, rk4, partialSums, sampleFunction, fmt,
  mean, median, quantile, variance, sd, mad, modes, pearson, spearman, linearRegression, weightedMean,
  choose, binomialPmf, binomialCdf, poissonPmf, normalCdf, stdNormalCdf, stdNormalInv, exponentialCdf, zConfidenceInterval, zTest,
  linalg, factorial, permutations, mod, modPow, solveLinearCongruence, truthTable, equivalentProps, parseProp,
  union, intersection, difference, complement, powerSet, relationProperties, enumerateCombinations, enumeratePermutations,
  parseExpression, expressionsEquivalent, compileFn, symbolicDerivative, ExpressionError,
  fourierPartialSum, standardWave, dftMagnitudes, synth, gradientDescent,
} from "../src";

describe("Rational", () => {
  it("adds 1/2 + 1/3 exactly to 5/6", () => {
    expect(new Rational(1, 2).add(new Rational(1, 3)).toString()).toBe("5/6");
  });
  it("normalises sign and lowest terms", () => {
    const r = new Rational(6, -8);
    expect([r.n, r.d]).toEqual([-3, 4]);
    expect(new Rational(0, -5).toString()).toBe("0");
  });
  it("rejects zero denominators", () => {
    expect(() => new Rational(1, 0)).toThrow();
    expect(() => new Rational(1, 2).div(0)).toThrow();
  });
  it("handles negative and improper fractions", () => {
    expect(new Rational(3, 5).sub(new Rational(1, 2)).toString()).toBe("1/10");
    expect(new Rational(-7, 2).toMixedString()).toBe("-3 1/2");
    expect(new Rational(7, 4).toMixed()).toEqual({ sign: 1, whole: 1, num: 3, den: 4 });
  });
  it("labels approximation correctly", () => {
    expect(new Rational(5, 6).terminates()).toBe(false);
    expect(new Rational(3, 8).terminates()).toBe(true);
    expect(new Rational(5, 6).toNumber()).toBeCloseTo(0.8333333, 6);
  });
  it("parses learner input", () => {
    expect(parseRational("5/6")?.toString()).toBe("5/6");
    expect(parseRational(" -1 1/2 ")?.toString()).toBe("-3/2");
    expect(parseRational("10/12")?.toString()).toBe("5/6");
    expect(parseRational("0.25")?.toString()).toBe("1/4");
    expect(parseRational("3/0")).toBeNull();
    expect(parseRational("x/2")).toBeNull();
  });
  it("detects overflow instead of rounding", () => {
    expect(() => new Rational(2 ** 53, 1)).toThrow();
  });
  it("gcd/lcm", () => {
    expect(gcd(12, 18)).toBe(6);
    expect(lcm(4, 6)).toBe(12);
  });
});

describe("seeded RNG", () => {
  it("is reproducible", () => {
    const a = createRng("lesson-1");
    const b = createRng("lesson-1");
    expect([a.int(1, 100), a.int(1, 100), a.next()]).toEqual([b.int(1, 100), b.int(1, 100), b.next()]);
  });
  it("stays in bounds", () => {
    const r = createRng(7);
    for (let i = 0; i < 2000; i++) {
      const v = r.int(-3, 3);
      expect(v).toBeGreaterThanOrEqual(-3);
      expect(v).toBeLessThanOrEqual(3);
    }
  });
  it("normal samples have mean≈0, sd≈1", () => {
    const r = createRng(99);
    const xs = Array.from({ length: 20000 }, () => r.normal());
    expect(Math.abs(mean(xs))).toBeLessThan(0.03);
    expect(Math.abs(sd(xs) - 1)).toBeLessThan(0.03);
  });
});

describe("numerical calculus", () => {
  it("derivative of sin at 0 is 1", () => expect(derivative(Math.sin, 0)).toBeCloseTo(1, 8));
  it("riemann sums converge to ∫0^1 x² = 1/3 with correct bias", () => {
    const f = (x: number) => x * x;
    const left = riemannSum(f, 0, 1, 100, "left").sum;
    const right = riemannSum(f, 0, 1, 100, "right").sum;
    expect(left).toBeLessThan(1 / 3); // increasing function: left underestimates
    expect(right).toBeGreaterThan(1 / 3);
    expect(riemannSum(f, 0, 1, 1000, "midpoint").sum).toBeCloseTo(1 / 3, 6);
    expect(simpson(f, 0, 1)).toBeCloseTo(1 / 3, 12);
  });
  it("newton-raphson converges for x²−2 and reports zero derivative", () => {
    const r = newtonRaphson((x) => x * x - 2, (x) => 2 * x, 1);
    expect(r.outcome).toBe("converged");
    expect(r.root).toBeCloseTo(Math.SQRT2, 12);
    expect(newtonRaphson((x) => x * x - 2, (x) => 2 * x, 0).outcome).toBe("zero-derivative");
  });
  it("newton-raphson cycles on x³−2x+2 from 0 (classic failure)", () => {
    const r = newtonRaphson((x) => x ** 3 - 2 * x + 2, (x) => 3 * x * x - 2, 0, { maxIter: 20 });
    expect(r.outcome).toBe("max-iterations");
    expect(r.steps[1].x).toBe(1);
    expect(r.steps[2].x).toBe(0);
  });
  it("bisection finds root of x³ − 3x² + 4 near −1 and refuses same-sign brackets", () => {
    const f = (x: number) => x ** 3 - 3 * x * x + 4;
    const r = bisection(f, -2, 0);
    expect(r.ok && r.root).toBeCloseTo(-1, 8);
    expect(bisection(f, 3, 4).ok).toBe(false);
  });
  it("euler vs rk4 on y' = y, y(0)=1 at x=1", () => {
    const e = eulerMethod((_x, y) => y, 0, 1, 0.1, 10).at(-1)![1];
    const k = rk4((_x, y) => y, 0, 1, 0.1, 10).at(-1)![1];
    expect(e).toBeCloseTo(1.1 ** 10, 12);
    expect(Math.abs(k - Math.E)).toBeLessThan(3e-6);
    expect(Math.abs(e - Math.E)).toBeGreaterThan(0.1);
  });
  it("geometric partial sums approach 2", () => {
    const s = partialSums((n) => 0.5 ** n, 0, 40);
    expect(s.at(-1)!.sum).toBeCloseTo(2, 10);
  });
  it("sampleFunction splits at asymptotes", () => {
    const segs = sampleFunction((x) => 1 / x, -1, 1, 200, 50);
    expect(segs.length).toBe(2);
  });
  it("fmt avoids -0 and formats special values", () => {
    expect(fmt(-0)).toBe("0");
    expect(fmt(NaN)).toBe("undefined");
    expect(fmt(1 / 3, 4)).toBe("0.3333");
  });
});

describe("statistics", () => {
  const xs = [2, 4, 4, 4, 5, 5, 7, 9];
  it("descriptive", () => {
    expect(mean(xs)).toBe(5);
    expect(median(xs)).toBe(4.5);
    expect(modes(xs)).toEqual([4]);
    expect(variance(xs, true)).toBe(4);
    expect(variance(xs)).toBeCloseTo(32 / 7, 12);
    expect(quantile([1, 2, 3, 4], 0.25)).toBe(1.75); // R type 7
    expect(mad([1, 2, 3, 4, 100])).toBe(1);
    expect(weightedMean([1, 2], [3, 1])).toBe(1.25);
  });
  it("correlation and regression", () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 12);
    expect(spearman([1, 2, 3, 4], [10, 20, 15, 40])).toBeCloseTo(0.8, 12);
    const fit = linearRegression([1, 2, 3, 4], [3, 5, 7, 9]);
    expect(fit.slope).toBeCloseTo(2, 12);
    expect(fit.intercept).toBeCloseTo(1, 12);
    expect(fit.r2).toBeCloseTo(1, 12);
    expect(() => linearRegression([1, 1], [2, 3])).toThrow();
  });
  it("R cars dataset: lm(dist ~ speed) and R² = 0.6511", () => {
    const speed = [4,4,7,7,8,9,10,10,10,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,16,16,17,17,17,18,18,18,18,19,19,19,20,20,20,20,20,22,23,24,24,24,24,25];
    const dist = [2,10,4,22,16,10,18,26,34,17,28,14,20,24,28,26,34,34,46,26,36,60,80,20,26,54,32,40,32,40,50,42,56,76,84,36,46,68,32,48,52,56,64,66,54,70,92,93,120,85];
    const fit = linearRegression(speed, dist);
    expect(fit.slope).toBeCloseTo(3.932409, 5);
    expect(fit.intercept).toBeCloseTo(-17.579095, 5);
    expect(fit.r2).toBeCloseTo(0.6511, 4);
  });
  it("binomial and poisson", () => {
    expect(choose(10, 3)).toBe(120);
    expect(binomialPmf(2, 4, 1 / 6)).toBeCloseTo(6 * (1 / 36) * (25 / 36), 12);
    expect(binomialCdf(4, 4, 0.3)).toBeCloseTo(1, 12);
    let s = 0;
    for (let k = 0; k < 60; k++) s += poissonPmf(k, 4);
    expect(s).toBeCloseTo(1, 12);
    expect(poissonPmf(0, 4)).toBeCloseTo(Math.exp(-4), 14);
  });
  it("normal distribution matches R pnorm/qnorm", () => {
    expect(stdNormalCdf(0)).toBe(0.5);
    expect(stdNormalCdf(1.96)).toBeCloseTo(0.9750021048517795, 12);
    expect(1 - normalCdf(1.5, 1.15, 0.2)).toBeCloseTo(0.04005916, 8); // FY S2 ch06 p7
    expect(stdNormalInv(0.975)).toBeCloseTo(1.959963984540054, 10);
    expect(stdNormalInv(0.001)).toBeCloseTo(-3.090232306167813, 9);
    for (const p of [1e-6, 0.01, 0.3, 0.5, 0.77, 0.999]) expect(stdNormalCdf(stdNormalInv(p))).toBeCloseTo(p, 12);
  });
  it("exponential cdf", () => expect(exponentialCdf(1, 2)).toBeCloseTo(1 - Math.exp(-2), 14));
  it("z interval and z test", () => {
    const ci = zConfidenceInterval(50, 10, 100, 0.95);
    expect(ci.margin).toBeCloseTo(1.959964, 5);
    const t = zTest(52, 50, 10, 100, "two");
    expect(t.z).toBeCloseTo(2, 12);
    expect(t.p).toBeCloseTo(0.04550026, 7);
    expect(t.reject).toBe(true);
  });
});

describe("linear algebra", () => {
  const B = [[1, 3, -2], [4, -5, 6], [3, 5, 2]];
  it("reproduces FY S1 08B handwritten example: |B| = -80", () => {
    expect(linalg.det(B)).toBe(-80);
    expect(linalg.det([[-1, 2], [4, 1]])).toBe(-9);
  });
  it("minors, cofactors, adjugate, inverse", () => {
    expect(linalg.minors(B)).toEqual([[-40, -10, 35], [16, 8, -4], [8, 14, -17]]);
    expect(linalg.cofactors(B)).toEqual([[-40, 10, 35], [-16, 8, 4], [8, -14, -17]]);
    const inv = linalg.inverse(B)!;
    const expected = linalg.scale([[40, 16, -8], [-10, -8, 14], [-35, -4, 17]], 1 / 80);
    inv.forEach((r, i) => r.forEach((v, j) => expect(v).toBeCloseTo(expected[i][j], 12)));
  });
  it("solves the lecture system: x=3/5, y=1/5, z=1/10", () => {
    const x = linalg.solve(B, [1, 2, 3])!;
    expect(x[0]).toBeCloseTo(0.6, 12);
    expect(x[1]).toBeCloseTo(0.2, 12);
    expect(x[2]).toBeCloseTo(0.1, 12);
  });
  it("singular matrices have no inverse", () => {
    expect(linalg.inverse([[1, 2], [2, 4]])).toBeNull();
  });
  it("multiplication order rules", () => {
    expect(() => linalg.multiply([[1, 2]], [[1, 2]])).toThrow();
    expect(linalg.multiply([[1, 2], [3, 4]], [[0, 1], [1, 0]])).toEqual([[2, 1], [4, 3]]);
  });
  it("vectors: dot, cross, angle (FY S1 08C p30 style)", () => {
    expect(linalg.dot([1, -2, 3], [4, 6, 1])).toBe(-5);
    expect(linalg.cross([1, 2, -1], [3, 4, 1])).toEqual([6, -4, -2]);
    expect(linalg.angleBetween([1, 0], [0, 1])).toBeCloseTo(Math.PI / 2, 14);
    expect(linalg.projection([2, 3], [1, 0])).toEqual([2, 0]);
  });
  it("eigen 2x2", () => {
    const e = linalg.eigen2x2([[2, 0], [0, 3]]);
    expect(e.real && e.values).toEqual([3, 2]);
    const r = linalg.eigen2x2([[0, -1], [1, 0]]);
    expect(r.real).toBe(false);
  });
  it("classifies 2x2 systems", () => {
    expect(linalg.classify2x2System(1, 1, 2, 1, -1, 0)).toMatchObject({ kind: "unique", x: 1, y: 1 });
    expect(linalg.classify2x2System(1, 1, 2, 2, 2, 4).kind).toBe("infinite");
    expect(linalg.classify2x2System(1, 1, 2, 1, 1, 3).kind).toBe("none");
  });
});

describe("discrete", () => {
  it("counting", () => {
    expect(factorial(5)).toBe(120);
    expect(permutations(5, 2)).toBe(20);
    expect(enumeratePermutations(["A", "B", "C", "D"], 4)).toHaveLength(24);
    expect(enumerateCombinations([1, 2, 3, 4, 5], 2)).toHaveLength(10);
    expect(2 ** 5).toBe(32); // Morse code, 5 symbols (FY S1 ch05 p4)
  });
  it("modular arithmetic (FY S1 06B examples)", () => {
    expect(mod(17 - 5, 12)).toBe(0);
    expect(mod(13 + 9 + 27 + 31 + 18, 4)).toBe(2);
    expect(mod(-7, 3)).toBe(2);
    expect(modPow(99, 99, 100)).toBe(99); // last two digits of 99^99
    expect(solveLinearCongruence(7, 11, 17)).toEqual([4]); // 7·4 = 28 ≡ 11
    expect(solveLinearCongruence(2, 1, 4)).toEqual([]);
  });
  it("sets", () => {
    expect(union([1, 2], [2, 3]).sort()).toEqual([1, 2, 3]);
    expect(intersection([1, 2], [2, 3])).toEqual([2]);
    expect(difference([1, 2], [2, 3])).toEqual([1]);
    expect(complement([1], [1, 2, 3])).toEqual([2, 3]);
    expect(powerSet(["a", "b", "c"])).toHaveLength(8);
  });
  it("relations (FY S1 04 Part 01 handwritten examples)", () => {
    const B = ["a", "b", "c"];
    const R1: [string, string][] = [["a", "b"], ["b", "c"], ["c", "a"], ["a", "a"]];
    expect(relationProperties(R1, B)).toMatchObject({ reflexive: false, symmetric: false });
    const R5: [string, string][] = [["a", "a"], ["b", "b"], ["c", "c"]];
    expect(relationProperties(R5, B).equivalence).toBe(true);
  });
  it("logic", () => {
    const t = truthTable("P -> Q");
    expect(t.rows.map((r) => r.value)).toEqual([true, false, true, true]);
    expect(truthTable("P | ~P").tautology).toBe(true);
    expect(truthTable("P & ~P").contradiction).toBe(true);
    expect(equivalentProps("P -> Q", "~P | Q")).toBe(true);
    expect(equivalentProps("P -> Q", "Q -> P")).toBe(false);
    expect(equivalentProps("~(P & Q)", "~P | ~Q")).toBe(true);
    expect(truthTable("(P | Q) & ~(P & Q)").rows.map((r) => r.value)).toEqual([false, true, true, false]);
    expect(() => parseProp("P &")).toThrow();
  });
});

describe("safe expressions", () => {
  it("evaluates and normalises notation", () => {
    expect(parseExpression("2x^2 + 3").evaluate({ x: 2 })).toBe(11);
    expect(compileFn("ln(e)")(0)).toBeCloseTo(1, 14);
    expect(compileFn("sqrt(x)")(-1)).toBeNaN();
  });
  it("rejects anything that is not a plain expression", () => {
    for (const bad of ["x = 3", "import({})", "a.b", "[1,2]", "f(x) = 2", "evaluate(\"1\")", "y + 1", "'s'", "createUnit(\"x\")"]) {
      expect(() => parseExpression(bad), bad).toThrow(ExpressionError);
    }
  });
  it("detects equivalence", () => {
    expect(expressionsEquivalent("2(x+1)", "2x+2")).toBe(true);
    expect(expressionsEquivalent("(x+1)^2", "x^2+2x+1")).toBe(true);
    expect(expressionsEquivalent("x^2", "2x")).toBe(false);
    expect(expressionsEquivalent("sin(x)^2 + cos(x)^2", "1")).toBe(true);
    expect(expressionsEquivalent("x/x", "1")).toBe(true);
  });
  it("symbolic derivative agrees with numeric derivative", () => {
    for (const f of ["x^3 - 2x", "sin(x) * x", "exp(2x)", "log(x^2 + 1)"]) {
      const d = symbolicDerivative(f);
      const df = compileFn(d.source);
      const fn = compileFn(f);
      for (const x of [-1.3, 0.4, 2.2]) expect(df(x)).toBeCloseTo(derivative(fn, x), 6);
    }
  });
});

describe("signals and optimisation", () => {
  it("square-wave Fourier partial sums converge away from jumps", () => {
    const sq = standardWave("square");
    expect(Math.abs(fourierPartialSum("square", 201)(1) - sq(1))).toBeLessThan(0.01);
    expect(fourierPartialSum("triangle", 51)(0.7)).toBeCloseTo(0.7, 3);
    expect(fourierPartialSum("sawtooth", 2001)(1)).toBeCloseTo(1, 2);
  });
  it("DFT recovers sinusoid amplitudes", () => {
    const f = synth([{ amplitude: 2, frequency: 3, phase: 0 }, { amplitude: 0.5, frequency: 7, phase: 1 }]);
    const N = 64;
    const mags = dftMagnitudes(Array.from({ length: N }, (_, n) => f(n / N)));
    expect(mags[3]).toBeCloseTo(2, 10);
    expect(mags[7]).toBeCloseTo(0.5, 10);
    expect(mags[5]).toBeCloseTo(0, 10);
  });
  it("gradient descent converges for small η and diverges for large η on f = x²", () => {
    const f = (x: number[]) => x[0] ** 2;
    const g = (x: number[]) => [2 * x[0]];
    expect(gradientDescent(f, g, [3], 0.1, 500).outcome).toBe("converged");
    expect(gradientDescent(f, g, [3], 1.1, 500).outcome).toBe("diverged");
  });
});
