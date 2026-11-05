import type { Lesson } from "../types";
import { fractionsAdd } from "./fractions-add";
import { signedNumbers, orderOfOperations } from "./foundations-1";
import { percentages, ratio, linearEquations, slope } from "./foundations-2";
import { limits, derivative, determinants, newtonRaphson } from "./university";

/** Order = recommended path through the built lessons. */
export const LESSONS: Lesson[] = [signedNumbers, orderOfOperations, fractionsAdd, percentages, ratio, linearEquations, slope, limits, derivative, determinants, newtonRaphson];
