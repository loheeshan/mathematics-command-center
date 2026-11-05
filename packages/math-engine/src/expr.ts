/**
 * Safe mathematical expressions.
 *
 * Learner/author input is parsed with mathjs and then *whitelisted node by node*:
 * only numbers, approved variables/constants, arithmetic operators, parentheses and
 * approved functions are allowed. No assignment, property access, matrices, strings,
 * imports or function definitions — so input can never execute arbitrary code.
 */
import { create, all, type MathNode } from "mathjs";

const math = create(all, {});

export const ALLOWED_FUNCTIONS = [
  "sin", "cos", "tan", "sec", "csc", "cot", "asin", "acos", "atan",
  "sinh", "cosh", "tanh", "exp", "log", "log10", "log2", "sqrt", "cbrt", "abs", "sign", "nthRoot",
] as const;
const FUNCS = new Set<string>(ALLOWED_FUNCTIONS);
const CONSTANTS = new Set(["pi", "e"]);
const OPERATORS = new Set(["add", "subtract", "multiply", "divide", "pow", "unaryMinus", "unaryPlus"]);

export const MAX_EXPRESSION_LENGTH = 300;
const MAX_NODES = 200;

export class ExpressionError extends Error {}

export interface SafeExpression {
  source: string;
  node: MathNode;
  variables: string[];
  evaluate(scope?: Record<string, number>): number;
  toTex(): string;
}

/** Normalise friendly notation: ln → log, π → pi, × ÷ − → * / -, ** → ^ */
export function normaliseInput(s: string) {
  return s
    .replace(/\bln\s*\(/g, "log(")
    .replace(/π/g, "pi")
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/\*\*/g, "^")
    .trim();
}

function validate(node: MathNode, allowedVars: Set<string>, found: Set<string>) {
  let count = 0;
  node.traverse((n: MathNode, _path: string, parent: MathNode | null) => {
    count++;
    if (count > MAX_NODES) throw new ExpressionError("Expression is too complex.");
    switch (n.type) {
      case "ConstantNode": {
        const v = (n as unknown as { value: unknown }).value;
        if (typeof v !== "number" || !Number.isFinite(v)) throw new ExpressionError("Only numbers are allowed as constants.");
        break;
      }
      case "SymbolNode": {
        const name = (n as unknown as { name: string }).name;
        const isFnName = parent?.type === "FunctionNode" && (parent as unknown as { fn: MathNode }).fn === n;
        if (isFnName) break;
        if (CONSTANTS.has(name)) break;
        if (!allowedVars.has(name)) throw new ExpressionError(`Unknown symbol "${name}". Allowed variables: ${[...allowedVars].join(", ") || "none"}.`);
        found.add(name);
        break;
      }
      case "OperatorNode": {
        const fn = (n as unknown as { fn: string }).fn;
        if (!OPERATORS.has(fn)) throw new ExpressionError(`Operator "${(n as unknown as { op: string }).op}" is not allowed here.`);
        break;
      }
      case "ParenthesisNode":
        break;
      case "FunctionNode": {
        const fnNode = (n as unknown as { fn: MathNode }).fn;
        const name = fnNode.type === "SymbolNode" ? (fnNode as unknown as { name: string }).name : "";
        if (!FUNCS.has(name)) throw new ExpressionError(`Function "${name || "?"}" is not supported.`);
        break;
      }
      default:
        throw new ExpressionError(`"${n.type.replace("Node", "")}" syntax is not allowed in answers.`);
    }
  });
}

export function parseExpression(input: string, variables: readonly string[] = ["x"]): SafeExpression {
  if (input.length > MAX_EXPRESSION_LENGTH) throw new ExpressionError("Expression is too long.");
  const source = normaliseInput(input);
  if (!source) throw new ExpressionError("Enter an expression.");
  if (/[=;[\]{}'"`:?]/.test(source)) throw new ExpressionError("Only plain expressions are allowed (no =, ;, brackets, quotes).");
  let node: MathNode;
  try {
    node = math.parse(source);
  } catch (e) {
    throw new ExpressionError(`Could not read that expression: ${(e as Error).message}`);
  }
  const found = new Set<string>();
  validate(node, new Set(variables), found);
  const code = node.compile();
  return {
    source,
    node,
    variables: [...found].sort(),
    evaluate(scope = {}) {
      const r = code.evaluate({ ...scope });
      if (typeof r === "number") return r;
      return NaN; // complex or other results are treated as undefined in ℝ
    },
    toTex() {
      return node.toTex({ parenthesis: "auto", implicit: "hide" });
    },
  };
}

/** Compile to a plain real function of one variable; returns NaN outside the real domain. */
export function compileFn(input: string, variable = "x"): (x: number) => number {
  const e = parseExpression(input, [variable]);
  return (x: number) => {
    try {
      return e.evaluate({ [variable]: x });
    } catch {
      return NaN;
    }
  };
}

export function compileFn2(input: string, vars: [string, string] = ["x", "y"]): (a: number, b: number) => number {
  const e = parseExpression(input, vars);
  return (a: number, b: number) => {
    try {
      return e.evaluate({ [vars[0]]: a, [vars[1]]: b });
    } catch {
      return NaN;
    }
  };
}

/** Symbolic derivative (mathjs), returned as a safe expression source string + TeX. */
export function symbolicDerivative(input: string, variable = "x") {
  const e = parseExpression(input, [variable]);
  const d = math.derivative(e.node, variable);
  const simplified = math.simplify(d);
  return { source: simplified.toString(), tex: simplified.toTex({ parenthesis: "auto", implicit: "hide" }) };
}

export function toTex(input: string, variables: readonly string[] = ["x"]) {
  return parseExpression(input, variables).toTex();
}

export interface EquivalenceOptions {
  variables?: string[];
  /** sampling box for each variable */
  domain?: [number, number];
  samples?: number;
  relTol?: number;
  absTol?: number;
  /** seed for reproducible sampling */
  seed?: number;
}

/**
 * Numerical equivalence test: both expressions are evaluated at many pseudo-random
 * points; they must agree (within tolerance) wherever both are defined, and must be
 * defined on (mostly) the same points. This is how "2(x+1)" and "2x+2" are recognised
 * as the same answer while "x^2" and "2x" are not.
 */
export function expressionsEquivalent(a: string, b: string, opts: EquivalenceOptions = {}) {
  const vars = opts.variables ?? ["x"];
  const [lo, hi] = opts.domain ?? [-3.7, 4.3];
  const samples = opts.samples ?? 40;
  const relTol = opts.relTol ?? 1e-7;
  const absTol = opts.absTol ?? 1e-9;
  const ea = parseExpression(a, vars);
  const eb = parseExpression(b, vars);
  let s = (opts.seed ?? 12345) >>> 0;
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  let compared = 0;
  let domainMismatch = 0;
  for (let i = 0; i < samples; i++) {
    const scope: Record<string, number> = {};
    for (const v of vars) scope[v] = lo + (hi - lo) * rand();
    let va: number, vb: number;
    try {
      va = ea.evaluate(scope);
    } catch {
      va = NaN;
    }
    try {
      vb = eb.evaluate(scope);
    } catch {
      vb = NaN;
    }
    const fa = Number.isFinite(va);
    const fb = Number.isFinite(vb);
    if (fa !== fb) {
      domainMismatch++;
      continue;
    }
    if (!fa) continue;
    compared++;
    if (Math.abs(va - vb) > Math.max(absTol, relTol * Math.max(Math.abs(va), Math.abs(vb)))) return false;
  }
  return compared >= Math.min(8, samples / 2) && domainMismatch <= samples * 0.1;
}
