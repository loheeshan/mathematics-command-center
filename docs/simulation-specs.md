# Simulation specifications

Every lab: computes with `@mcc/math-engine`; live readouts; presets (deep-linkable via `?preset=`); reset (remount); text/data alternative; keyboard operation; 3-question practice from registered templates; no network access.

| Lab | Model / invariants | Edge cases handled | Verified by |
|---|---|---|---|
| Number Line | result = a + (±b); subtraction shown as adding the opposite | fractions in ¼ steps | `signed-*` templates |
| Fraction Kitchen | exact `Rational`; re-cut to lcm; mixed numbers | totals > 1 (up to 3 wholes), negative results, decimal labelled approximate when non-terminating | Rational tests, E2E (lcm updates live) |
| Percent Grid | p/100 as fraction/decimal; multiplier 1 ± p/100 | 0% and 100% | percent templates |
| Ratio Mixer | part = total/(a+b); simplest form via gcd | — | ratio template |
| Balance Equation | ax+b = cx+d; solution (d−b)/(a−c) shown invariant across steps | divide only offered when exact; no-solution/every-x | linear templates |
| Slope Lab | m = Δy/Δx exact rational; intercept exact | vertical line (undefined slope) | E2E keyboard test |
| Quadratic Playground | discriminant, vertex, exact roots when √D integral | D < 0, D = 0; a ≠ 0 enforced | quadratic validator |
| Graphing Studio | whitelisted expressions; bisection for f₁ = f₂ | domain gaps, asymptotes split curves | expression tests |
| Unit Circle | (cos θ, sin θ); exact values at multiples of 30°/45° | tan undefined at 90°/270°; identity check shown | trig templates |
| Venn Studio | ∪, ∩, −, complement, △ on U = {1..16}; n(A∪B) identity shown | disjoint and subset presets | set tests |
| Logic Table Builder | recursive-descent parser; T before F row order | parse errors shown; ≤ 6 letters | logic tests |
| Modular Clock | a mod m in [0, m); visited classes; linear congruence solutions | negative a; gcd(a, m) > 1 → no/many solutions | modular tests (lecture 7x ≡ 11 mod 17) |
| Counting Tree | enumerated permutations/combinations equal nPr/nCr | r = 0, r = n | counting tests |
| Limit Explorer | one-sided tables h = 10⁻¹…10⁻⁶ | hole, jump, infinite limit, sin x/x | E2E hydration fix (literal h values) |
| Tangent Lab | secant slope vs symbolic f′ (mathjs) | h ≠ 0 enforced; user functions | symbolic vs numeric derivative tests |
| Integral Area Explorer | left/right/midpoint/trapezoid; Simpson check | negative area shown red | convergence-order validator |
| Series Lab | partial sums vs known limits | divergent harmonic series | geometric partial sums test |
| Matrix Transformation | image of grid/unit square; det = signed area; eigenvectors | singular, reflection, complex eigenvalues | linear algebra tests |
| Vector Playground | sum, dot, angle, projection | zero vector → angle undefined | dot/cross tests |
| Probability Lab | seeded dice/coin experiments vs exact probabilities | variability stated explicitly | seeded RNG tests |
| Distribution Builder | binomial/Poisson sums, normal/exponential CDF differences; matching R call shown | p = 0/1, a > b swapped | sum-to-1 and Φ-vs-∫pdf validator |
| Sampling & CLT | sample means vs N(μ, σ²/n) | small n stays skewed | — |
| Regression Studio | least squares, residuals, r, R²; R `cars` data | all-x-equal → slope undefined | cars R² = 0.6511 test; normal-equation validator |
| Newton–Raphson | iterates with outcome: converged / zero derivative / cycle / diverged | lecture cubic's double root (slow convergence) | 2-cycle and zero-derivative tests |
| Differential Equation Lab | direction field; Euler vs RK4 vs exact | step-size effect on error | Euler/RK4 tests |
| Fourier Synthesizer | square/sawtooth/triangle partial sums; DFT of custom sums | Gibbs overshoot readout | DFT amplitude test |
| Gradient Descent | w ← w − η∇L on (w−1)² and an elongated bowl | oscillation (0.5<η<1), η = 1 bounce, divergence (η > 1) | converge/diverge tests |
