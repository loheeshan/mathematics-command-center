"use client";
import type { ComponentType } from "react";
import { NumberLineSim, FractionKitchenSim, PercentGridSim, RatioMixerSim, BalanceEquationSim, SlopeLabSim, QuadraticPlaygroundSim, GraphingStudioSim, type SimProps } from "./sims/foundation";
import { UnitCircleSim, VennStudioSim, TruthTableSim, ModularClockSim, CountingLabSim } from "./sims/discrete";
import { LimitExplorerSim, TangentLabSim, RiemannLabSim, SeriesLabSim, MatrixTransformSim, VectorLabSim } from "./sims/calculus";
import { ProbabilityLabSim, DistributionBuilderSim, CltLabSim, RegressionStudioSim, NewtonRaphsonSim, OdeLabSim, FourierSynthSim, GradientDescentSim } from "./sims/applied";

export type { SimProps };
export { Plot, FnPath, DragPoint, Slider, Readouts, TextAlternative, DataTable } from "./kit";

/** slug → component. Must stay in sync with SIMULATIONS in @mcc/curriculum (checked by validate-curriculum). */
export const SIM_COMPONENTS: Record<string, ComponentType<SimProps>> = {
  "number-line": NumberLineSim,
  "fraction-kitchen": FractionKitchenSim,
  "percent-grid": PercentGridSim,
  "ratio-mixer": RatioMixerSim,
  "balance-equation": BalanceEquationSim,
  "slope-lab": SlopeLabSim,
  "quadratic-playground": QuadraticPlaygroundSim,
  "graphing-studio": GraphingStudioSim,
  "unit-circle": UnitCircleSim,
  "venn-studio": VennStudioSim,
  "truth-table": TruthTableSim,
  "modular-clock": ModularClockSim,
  "counting-lab": CountingLabSim,
  "limit-explorer": LimitExplorerSim,
  "tangent-lab": TangentLabSim,
  "riemann-lab": RiemannLabSim,
  "series-lab": SeriesLabSim,
  "matrix-transform": MatrixTransformSim,
  "vector-lab": VectorLabSim,
  "probability-lab": ProbabilityLabSim,
  "distribution-builder": DistributionBuilderSim,
  "clt-lab": CltLabSim,
  "regression-studio": RegressionStudioSim,
  "newton-raphson": NewtonRaphsonSim,
  "ode-lab": OdeLabSim,
  "fourier-synth": FourierSynthSim,
  "gradient-descent": GradientDescentSim,
};

export const SIM_SLUGS = Object.keys(SIM_COMPONENTS);
