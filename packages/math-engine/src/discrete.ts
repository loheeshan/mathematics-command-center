/** Discrete mathematics: counting, modular arithmetic, sets, propositional logic. */
import { gcd } from "./rational";

export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new RangeError("factorial needs a non-negative integer");
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** nPr = n!/(n−r)! */
export function permutations(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) throw new RangeError("integers ≥ 0");
  if (r > n) return 0;
  let p = 1;
  for (let i = 0; i < r; i++) p *= n - i;
  return p;
}

export { choose as combinations } from "./stats";

/** Enumerate ordered arrangements (r-permutations) of items — for small n only. */
export function enumeratePermutations<T>(items: readonly T[], r: number): T[][] {
  if (r === 0) return [[]];
  const out: T[][] = [];
  items.forEach((it, i) => {
    const rest = items.filter((_, j) => j !== i);
    for (const tail of enumeratePermutations(rest, r - 1)) out.push([it, ...tail]);
  });
  return out;
}

export function enumerateCombinations<T>(items: readonly T[], r: number): T[][] {
  if (r === 0) return [[]];
  if (items.length < r) return [];
  const [head, ...rest] = items;
  return [...enumerateCombinations(rest, r - 1).map((c) => [head, ...c]), ...enumerateCombinations(rest, r)];
}

/** Mathematical modulo: result always in [0, m). */
export function mod(a: number, m: number): number {
  if (!Number.isInteger(m) || m < 1) throw new RangeError("modulus must be a positive integer");
  return ((a % m) + m) % m;
}

export const congruent = (a: number, b: number, m: number) => mod(a - b, m) === 0;

/** a^e mod m by repeated squaring (BigInt internally, so large exponents are exact). */
export function modPow(a: number, e: number, m: number): number {
  if (e < 0) throw new RangeError("negative exponent");
  let base = BigInt(mod(a, m));
  let exp = BigInt(e);
  const M = BigInt(m);
  let r = 1n % M;
  while (exp > 0n) {
    if (exp & 1n) r = (r * base) % M;
    base = (base * base) % M;
    exp >>= 1n;
  }
  return Number(r);
}

export function extendedGcd(a: number, b: number): { g: number; x: number; y: number } {
  if (b === 0) return { g: Math.abs(a), x: Math.sign(a) || 1, y: 0 };
  const { g, x, y } = extendedGcd(b, a % b);
  return { g, x: y, y: x - Math.trunc(a / b) * y };
}

/** All solutions x in {0..m-1} of a·x ≡ b (mod m). */
export function solveLinearCongruence(a: number, b: number, m: number): number[] {
  const g = gcd(mod(a, m), m);
  if (mod(b, g) !== 0) return [];
  const sols: number[] = [];
  for (let x = 0; x < m; x++) if (mod(a * x - b, m) === 0) sols.push(x);
  return sols;
}

export function divisionAlgorithm(a: number, m: number) {
  const r = mod(a, m);
  return { quotient: (a - r) / m, remainder: r };
}

// ---------- sets (as sorted unique arrays) ----------
export type SetOf<T> = T[];
const uniq = <T>(xs: readonly T[]) => [...new Set(xs)];
export const union = <T>(A: readonly T[], B: readonly T[]) => uniq([...A, ...B]);
export const intersection = <T>(A: readonly T[], B: readonly T[]) => uniq(A.filter((x) => B.includes(x)));
export const difference = <T>(A: readonly T[], B: readonly T[]) => uniq(A.filter((x) => !B.includes(x)));
export const symmetricDifference = <T>(A: readonly T[], B: readonly T[]) => union(difference(A, B), difference(B, A));
export const complement = <T>(A: readonly T[], U: readonly T[]) => difference(U, A);
export const isSubset = <T>(A: readonly T[], B: readonly T[]) => A.every((x) => B.includes(x));
export function powerSet<T>(A: readonly T[]): T[][] {
  return A.reduce<T[][]>((acc, x) => [...acc, ...acc.map((s) => [...s, x])], [[]]);
}
export const cartesianProduct = <A, B>(X: readonly A[], Y: readonly B[]) => X.flatMap((x) => Y.map((y) => [x, y] as [A, B]));

// ---------- relations ----------
export type Pair<T> = [T, T];
export function relationProperties<T>(R: Pair<T>[], A: readonly T[]) {
  const has = (a: T, b: T) => R.some(([x, y]) => x === a && y === b);
  const reflexive = A.every((a) => has(a, a));
  const symmetric = R.every(([a, b]) => has(b, a));
  const antisymmetric = R.every(([a, b]) => a === b || !has(b, a));
  const transitive = R.every(([a, b]) => R.filter(([c]) => c === b).every(([, d]) => has(a, d)));
  return { reflexive, symmetric, antisymmetric, transitive, equivalence: reflexive && symmetric && transitive };
}

// ---------- propositional logic ----------
export type Prop =
  | { k: "var"; name: string }
  | { k: "const"; v: boolean }
  | { k: "not"; a: Prop }
  | { k: "and" | "or" | "implies" | "iff" | "xor"; a: Prop; b: Prop };

/**
 * Parse a propositional formula. Variables: single capital letters (P, Q, R, S...).
 * Operators (lowest → highest precedence): ⇔ (<->, iff), ⇒ (->, =>), ∨ (|, or, v), ⊕ (xor), ∧ (&, and, ^), ∼ (~, ¬, !, not).
 * Implication is right-associative.
 */
export function parseProp(input: string): Prop {
  const src = input
    .replace(/<->|<=>|⇔|↔|\biff\b/g, " IFF ")
    .replace(/->|=>|⇒|→|\bimplies\b/g, " IMP ")
    .replace(/∨|\|\||\||\bor\b/g, " OR ")
    .replace(/⊕|\bxor\b/g, " XOR ")
    .replace(/∧|&&|&|\^|\band\b/g, " AND ")
    .replace(/∼|~|¬|!|\bnot\b/g, " NOT ")
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ");
  const toks = src.split(/\s+/).filter(Boolean);
  let i = 0;
  const peek = () => toks[i];
  const eat = (t?: string) => {
    const x = toks[i++];
    if (t && x !== t) throw new SyntaxError(`expected ${t} but found ${x ?? "end"}`);
    return x;
  };
  const parseIff = (): Prop => {
    let a = parseImp();
    while (peek() === "IFF") {
      eat();
      a = { k: "iff", a, b: parseImp() };
    }
    return a;
  };
  const parseImp = (): Prop => {
    const a = parseOr();
    if (peek() === "IMP") {
      eat();
      return { k: "implies", a, b: parseImp() };
    }
    return a;
  };
  const parseOr = (): Prop => {
    let a = parseXor();
    while (peek() === "OR") {
      eat();
      a = { k: "or", a, b: parseXor() };
    }
    return a;
  };
  const parseXor = (): Prop => {
    let a = parseAnd();
    while (peek() === "XOR") {
      eat();
      a = { k: "xor", a, b: parseAnd() };
    }
    return a;
  };
  const parseAnd = (): Prop => {
    let a = parseNot();
    while (peek() === "AND") {
      eat();
      a = { k: "and", a, b: parseNot() };
    }
    return a;
  };
  const parseNot = (): Prop => {
    if (peek() === "NOT") {
      eat();
      return { k: "not", a: parseNot() };
    }
    return parseAtom();
  };
  const parseAtom = (): Prop => {
    const t = eat();
    if (t === undefined) throw new SyntaxError("unexpected end of formula");
    if (t === "(") {
      const e = parseIff();
      eat(")");
      return e;
    }
    if (t === "T" || t === "1" || t === "true") return { k: "const", v: true };
    if (t === "F" || t === "0" || t === "false") return { k: "const", v: false };
    if (/^[A-EG-SU-Z]$/.test(t)) return { k: "var", name: t };
    throw new SyntaxError(`unexpected symbol "${t}" — use single capital letters for statements (T and F are constants)`);
  };
  if (toks.length === 0) throw new SyntaxError("empty formula");
  if (toks.length > 200) throw new SyntaxError("formula too long");
  const ast = parseIff();
  if (i !== toks.length) throw new SyntaxError(`unexpected "${toks[i]}"`);
  return ast;
}

export function propVars(p: Prop): string[] {
  const s = new Set<string>();
  const walk = (q: Prop) => {
    if (q.k === "var") s.add(q.name);
    else if (q.k === "not") walk(q.a);
    else if (q.k !== "const") {
      walk(q.a);
      walk(q.b);
    }
  };
  walk(p);
  return [...s].sort();
}

export function evalProp(p: Prop, env: Record<string, boolean>): boolean {
  switch (p.k) {
    case "var":
      return env[p.name];
    case "const":
      return p.v;
    case "not":
      return !evalProp(p.a, env);
    case "and":
      return evalProp(p.a, env) && evalProp(p.b, env);
    case "or":
      return evalProp(p.a, env) || evalProp(p.b, env);
    case "xor":
      return evalProp(p.a, env) !== evalProp(p.b, env);
    case "implies":
      return !evalProp(p.a, env) || evalProp(p.b, env);
    case "iff":
      return evalProp(p.a, env) === evalProp(p.b, env);
  }
}

export function propToString(p: Prop): string {
  switch (p.k) {
    case "var":
      return p.name;
    case "const":
      return p.v ? "T" : "F";
    case "not":
      return `∼${p.a.k === "var" || p.a.k === "const" || p.a.k === "not" ? propToString(p.a) : `(${propToString(p.a)})`}`;
    default: {
      const op = { and: "∧", or: "∨", implies: "⇒", iff: "⇔", xor: "⊕" }[p.k];
      return `(${propToString(p.a)} ${op} ${propToString(p.b)})`;
    }
  }
}

/** Truth table rows in the conventional order (T before F, first variable changes slowest). */
export function truthTable(formula: string, extraVars: string[] = []) {
  const ast = parseProp(formula);
  const vars = [...new Set([...propVars(ast), ...extraVars])].sort();
  if (vars.length > 6) throw new RangeError("at most 6 statement letters");
  const rows: { env: Record<string, boolean>; value: boolean }[] = [];
  const n = vars.length;
  for (let m = 0; m < 1 << n; m++) {
    const env: Record<string, boolean> = {};
    vars.forEach((v, i) => (env[v] = ((m >> (n - 1 - i)) & 1) === 0));
    rows.push({ env, value: evalProp(ast, env) });
  }
  const values = rows.map((r) => r.value);
  return {
    vars,
    rows,
    ast,
    tautology: values.every(Boolean),
    contradiction: values.every((v) => !v),
  };
}

export function equivalentProps(f: string, g: string) {
  const a = parseProp(f);
  const b = parseProp(g);
  const vars = [...new Set([...propVars(a), ...propVars(b)])];
  const n = vars.length;
  for (let m = 0; m < 1 << n; m++) {
    const env: Record<string, boolean> = {};
    vars.forEach((v, i) => (env[v] = ((m >> i) & 1) === 1));
    if (evalProp(a, env) !== evalProp(b, env)) return false;
  }
  return true;
}
