/** Small dense linear algebra for teaching (sizes up to ~10×10). */
export type Vec = number[];
export type Mat = number[][];

export const dims = (A: Mat) => [A.length, A[0]?.length ?? 0] as const;

export function assertRect(A: Mat) {
  const c = A[0]?.length ?? 0;
  if (A.length === 0 || c === 0 || A.some((r) => r.length !== c)) throw new RangeError("matrix must be non-empty and rectangular");
}

export function identity(n: number): Mat {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

export function transpose(A: Mat): Mat {
  assertRect(A);
  return A[0].map((_, j) => A.map((r) => r[j]));
}

export function add(A: Mat, B: Mat): Mat {
  if (A.length !== B.length || A[0].length !== B[0].length) throw new RangeError("orders must match for addition");
  return A.map((r, i) => r.map((v, j) => v + B[i][j]));
}

export const scale = (A: Mat, k: number): Mat => A.map((r) => r.map((v) => v * k));

export function multiply(A: Mat, B: Mat): Mat {
  assertRect(A);
  assertRect(B);
  if (A[0].length !== B.length) throw new RangeError(`cannot multiply ${A.length}×${A[0].length} by ${B.length}×${B[0].length}: columns of A must equal rows of B`);
  return A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
}

export const apply = (A: Mat, v: Vec): Vec => A.map((r) => r.reduce((s, a, j) => s + a * v[j], 0));

/** Minor matrix with row i and column j removed. */
export const minorMatrix = (A: Mat, i: number, j: number): Mat => A.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));

/** Determinant by cofactor expansion along row 1 — exact for integer entries, intended for n ≤ 5. */
export function det(A: Mat): number {
  assertRect(A);
  const n = A.length;
  if (A[0].length !== n) throw new RangeError("determinant needs a square matrix");
  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
  let s = 0;
  for (let j = 0; j < n; j++) {
    if (A[0][j] === 0) continue;
    s += (j % 2 ? -1 : 1) * A[0][j] * det(minorMatrix(A, 0, j));
  }
  return s;
}

export const minors = (A: Mat): Mat => A.map((r, i) => r.map((_, j) => det(minorMatrix(A, i, j))));
export const cofactors = (A: Mat): Mat => minors(A).map((r, i) => r.map((m, j) => ((i + j) % 2 ? -m : m)));
export const adjugate = (A: Mat): Mat => transpose(cofactors(A));

/** Inverse via Gauss–Jordan with partial pivoting; null if singular. */
export function inverse(A: Mat, eps = 1e-12): Mat | null {
  const n = A.length;
  if (A[0].length !== n) throw new RangeError("inverse needs a square matrix");
  const M = A.map((r, i) => [...r, ...identity(n)[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < eps) return null;
    [M[c], M[p]] = [M[p], M[c]];
    const pv = M[c][c];
    for (let j = 0; j < 2 * n; j++) M[c][j] /= pv;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c];
      if (f !== 0) for (let j = 0; j < 2 * n; j++) M[r][j] -= f * M[c][j];
    }
  }
  return M.map((r) => r.slice(n));
}

export function solve(A: Mat, b: Vec): Vec | null {
  const inv = inverse(A);
  return inv ? apply(inv, b) : null;
}

/** Classify a 2×2 system a1x+b1y=c1, a2x+b2y=c2. */
export function classify2x2System(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number) {
  const D = a1 * b2 - a2 * b1;
  if (Math.abs(D) > 1e-12) return { kind: "unique" as const, x: (c1 * b2 - c2 * b1) / D, y: (a1 * c2 - a2 * c1) / D };
  // parallel or same line: check consistency via rank of augmented matrix
  const Dx = c1 * b2 - c2 * b1;
  const Dy = a1 * c2 - a2 * c1;
  if (Math.abs(Dx) < 1e-12 && Math.abs(Dy) < 1e-12) return { kind: "infinite" as const };
  return { kind: "none" as const };
}

/** Eigenvalues of a 2×2 real matrix (may be complex). */
export function eigen2x2(A: Mat) {
  const [[a, b], [c, d]] = A;
  const tr = a + d;
  const dt = a * d - b * c;
  const disc = tr * tr - 4 * dt;
  if (disc >= 0) {
    const s = Math.sqrt(disc);
    const l1 = (tr + s) / 2;
    const l2 = (tr - s) / 2;
    const vec = (l: number): Vec => {
      // (A - lI)v = 0
      if (Math.abs(b) > 1e-12) return normalize([b, l - a]);
      if (Math.abs(c) > 1e-12) return normalize([l - d, c]);
      return Math.abs(a - l) < 1e-12 ? [1, 0] : [0, 1];
    };
    return { real: true as const, values: [l1, l2], vectors: [vec(l1), vec(l2)] };
  }
  return { real: false as const, re: tr / 2, im: Math.sqrt(-disc) / 2 };
}

export const dot = (u: Vec, v: Vec) => {
  if (u.length !== v.length) throw new RangeError("vectors must have the same dimension");
  return u.reduce((s, x, i) => s + x * v[i], 0);
};
export const norm = (u: Vec) => Math.sqrt(dot(u, u));
export function normalize(u: Vec): Vec {
  const n = norm(u);
  if (n === 0) throw new RangeError("cannot normalise the zero vector");
  return u.map((x) => x / n);
}
export function cross(u: Vec, v: Vec): Vec {
  if (u.length !== 3 || v.length !== 3) throw new RangeError("cross product is defined for 3-D vectors");
  return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
}
/** angle between vectors in radians */
export function angleBetween(u: Vec, v: Vec) {
  const c = dot(u, v) / (norm(u) * norm(v));
  return Math.acos(Math.max(-1, Math.min(1, c)));
}
/** vector projection of u onto v */
export function projection(u: Vec, v: Vec): Vec {
  const k = dot(u, v) / dot(v, v);
  return v.map((x) => k * x);
}
export const directionCosines = (u: Vec) => {
  const n = norm(u);
  return u.map((x) => x / n);
};
