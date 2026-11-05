/**
 * Deterministic, seedable pseudo-random numbers (mulberry32).
 * Every generated exercise and simulation run is reproducible from its seed.
 */
export interface Rng {
  /** uniform float in [0, 1) */
  next(): number;
  /** integer in [lo, hi] inclusive */
  int(lo: number, hi: number): number;
  /** integer in [lo, hi] excluding the listed values */
  intExcept(lo: number, hi: number, except: number[]): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
  /** standard normal sample (Box–Muller) */
  normal(): number;
  readonly seed: number;
}

export function hashSeed(input: string | number): number {
  const s = String(input);
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function createRng(seed: number | string): Rng {
  const initial = typeof seed === "number" ? seed >>> 0 : hashSeed(seed);
  let a = initial || 0x9e3779b9;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => {
    if (!Number.isInteger(lo) || !Number.isInteger(hi) || hi < lo) throw new RangeError(`bad int range ${lo}..${hi}`);
    return lo + Math.floor(next() * (hi - lo + 1));
  };
  let spare: number | null = null;
  return {
    seed: initial,
    next,
    int,
    intExcept(lo, hi, except) {
      const allowed: number[] = [];
      for (let v = lo; v <= hi; v++) if (!except.includes(v)) allowed.push(v);
      if (allowed.length === 0) throw new RangeError("no values left in range");
      return allowed[Math.floor(next() * allowed.length)];
    },
    pick(items) {
      if (items.length === 0) throw new RangeError("pick from empty list");
      return items[Math.floor(next() * items.length)];
    },
    shuffle(items) {
      const out = items.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    normal() {
      if (spare !== null) {
        const s = spare;
        spare = null;
        return s;
      }
      let u = 0;
      while (u === 0) u = next();
      const v = next();
      const r = Math.sqrt(-2 * Math.log(u));
      spare = r * Math.sin(2 * Math.PI * v);
      return r * Math.cos(2 * Math.PI * v);
    },
  };
}
