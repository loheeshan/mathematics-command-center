/**
 * Exact rational arithmetic with normalised sign and lowest terms.
 * Uses JS numbers but refuses to operate outside the safe-integer range,
 * so a result is either exact or an explicit error — never silently rounded.
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

function checkSafe(...xs: number[]) {
  for (const x of xs) {
    if (!Number.isSafeInteger(x)) throw new RangeError(`Rational overflow or non-integer: ${x}`);
  }
}

export class Rational {
  readonly n: number;
  readonly d: number;

  constructor(n: number, d = 1) {
    checkSafe(n, d);
    if (d === 0) throw new RangeError("Denominator cannot be zero");
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d) || 1;
    this.n = n / g + 0; // +0 normalises -0
    this.d = d / g;
  }

  static of(x: Rational | number): Rational {
    return x instanceof Rational ? x : Rational.fromNumber(x);
  }

  /** exact conversion of a finite decimal number (up to 12 decimal places) */
  static fromNumber(x: number): Rational {
    if (!Number.isFinite(x)) throw new RangeError("not finite");
    if (Number.isInteger(x)) return new Rational(x, 1);
    const s = x.toString();
    if (s.includes("e")) throw new RangeError("use fraction input for very large/small numbers");
    const [i, f = ""] = s.split(".");
    if (f.length > 12) throw new RangeError("too many decimal places for exact conversion");
    const d = 10 ** f.length;
    return new Rational(Number(i.replace("-", "") + f) * (x < 0 ? -1 : 1), d);
  }

  add(o: Rational | number) {
    const r = Rational.of(o);
    const l = lcm(this.d, r.d);
    const a = this.n * (l / this.d);
    const b = r.n * (l / r.d);
    checkSafe(a, b, a + b, l);
    return new Rational(a + b, l);
  }
  sub(o: Rational | number) {
    return this.add(Rational.of(o).neg());
  }
  mul(o: Rational | number) {
    const r = Rational.of(o);
    const g1 = gcd(this.n, r.d) || 1;
    const g2 = gcd(r.n, this.d) || 1;
    const n = (this.n / g1) * (r.n / g2);
    const d = (this.d / g2) * (r.d / g1);
    checkSafe(n, d);
    return new Rational(n, d);
  }
  div(o: Rational | number) {
    const r = Rational.of(o);
    if (r.n === 0) throw new RangeError("Division by zero");
    return this.mul(new Rational(r.d, r.n));
  }
  neg() {
    return new Rational(-this.n, this.d);
  }
  abs() {
    return new Rational(Math.abs(this.n), this.d);
  }
  equals(o: Rational | number) {
    const r = Rational.of(o);
    return this.n === r.n && this.d === r.d;
  }
  compare(o: Rational | number) {
    const r = Rational.of(o);
    return Math.sign(this.n * r.d - r.n * this.d);
  }
  isInteger() {
    return this.d === 1;
  }
  valueOf() {
    return this.n / this.d;
  }
  toNumber() {
    return this.n / this.d;
  }
  /** "5/6", "-3/2", "4" */
  toString() {
    return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`;
  }
  /** LaTeX, e.g. \frac{5}{6} or -\frac{3}{2} */
  toTex() {
    if (this.d === 1) return String(this.n);
    return `${this.n < 0 ? "-" : ""}\\frac{${Math.abs(this.n)}}{${this.d}}`;
  }
  /** mixed-number parts: -7/2 -> { sign: -1, whole: 3, num: 1, den: 2 } */
  toMixed() {
    const sign = this.n < 0 ? -1 : 1;
    const a = Math.abs(this.n);
    return { sign, whole: Math.floor(a / this.d), num: a % this.d, den: this.d };
  }
  toMixedString() {
    const m = this.toMixed();
    if (m.num === 0) return String(m.sign * m.whole);
    if (m.whole === 0) return this.toString();
    return `${m.sign < 0 ? "-" : ""}${m.whole} ${m.num}/${m.den}`;
  }
  /** true when the decimal expansion terminates (denominator has only factors 2 and 5) */
  terminates() {
    let d = this.d;
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    return d === 1;
  }
}

/**
 * Parse learner input as an exact rational.
 * Accepts: "5/6", "-5/6", "5 / -6", "1 1/2" (mixed), "-1 1/2", "3", "0.25".
 * Returns null for anything else (expressions are handled by the expression checker).
 */
export function parseRational(raw: string): Rational | null {
  const s = raw.trim().replace(/−/g, "-").replace(/\s+/g, " ");
  if (!s) return null;
  let m = s.match(/^([+-]?)(\d+) (\d+) ?\/ ?(\d+)$/); // mixed number
  if (m) {
    const sign = m[1] === "-" ? -1 : 1;
    const whole = Number(m[2]);
    const num = Number(m[3]);
    const den = Number(m[4]);
    if (den === 0) return null;
    return new Rational(whole * den + num, den).mul(sign);
  }
  m = s.match(/^([+-]?\d+) ?\/ ?([+-]?\d+)$/);
  if (m) {
    const d = Number(m[2]);
    if (d === 0) return null;
    return new Rational(Number(m[1]), d);
  }
  if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) {
    try {
      return Rational.fromNumber(Number(s));
    } catch {
      return null;
    }
  }
  return null;
}
