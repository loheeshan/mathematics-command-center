import { createRng, hashSeed } from "@mcc/math-engine";
import type { QuestionInstance, QuestionTemplate } from "./types";
import { foundationTemplates } from "./templates/foundations";
import { algebraTemplates } from "./templates/algebra";
import { discreteCalculusTemplates } from "./templates/discrete-calculus";
import { appliedTemplates } from "./templates/applied";

export * from "./types";
export * from "./check";
export * from "./mastery";

export const TEMPLATES: QuestionTemplate[] = [...foundationTemplates, ...algebraTemplates, ...discreteCalculusTemplates, ...appliedTemplates];

const byId = new Map(TEMPLATES.map((t) => [t.id, t]));
if (byId.size !== TEMPLATES.length) throw new Error("duplicate question template id");

export const getTemplate = (id: string) => byId.get(id);
export const templatesForSkill = (skill: string) => TEMPLATES.filter((t) => t.skill === skill);
export const practicedSkills = () => [...new Set(TEMPLATES.map((t) => t.skill))];

/** Deterministic: the same template + seed always yields the same question and answer. */
export function generateQuestion(templateId: string, seed: number | string): QuestionInstance {
  const t = byId.get(templateId);
  if (!t) throw new Error(`unknown template ${templateId}`);
  const s = typeof seed === "number" ? seed >>> 0 : hashSeed(seed);
  const rng = createRng(hashSeed(`${templateId}:${s}`));
  return { ...t.generate(rng), templateId, seed: s, skill: t.skill };
}

/**
 * Build a practice set for one or more skills: cycles through each skill's templates so
 * representations vary, with seeds derived from `setSeed` so a retake gets fresh questions.
 */
export function buildPracticeSet(skills: string[], count: number, setSeed: number | string): QuestionInstance[] {
  const rng = createRng(typeof setSeed === "number" ? setSeed : hashSeed(setSeed));
  const pools = skills.map((s) => templatesForSkill(s)).filter((p) => p.length > 0);
  if (pools.length === 0) return [];
  const out: QuestionInstance[] = [];
  for (let i = 0; i < count; i++) {
    const pool = pools[i % pools.length];
    const t = pool[Math.floor(i / pools.length) % pool.length];
    out.push(generateQuestion(t.id, rng.int(1, 2 ** 31 - 1)));
  }
  return out;
}
