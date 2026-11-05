import { z } from "zod";
import type { AnswerSpec } from "@mcc/question-engine";

// ---------------- Master Core ----------------
export const TopicSchema = z.object({ id: z.string().regex(/^[a-z0-9-]+$/), title: z.string().min(3) });
export const UnitSchema = z.object({ id: z.string(), title: z.string(), topics: z.array(TopicSchema).min(1) });
export const LevelSchema = z.object({
  id: z.string().regex(/^L\d+$/),
  number: z.number().int().min(0).max(10),
  title: z.string(),
  summary: z.string(),
  units: z.array(UnitSchema).min(1),
});
export const MasterCoreSchema = z.object({ levels: z.array(LevelSchema).length(11) });
export type Topic = z.infer<typeof TopicSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type Level = z.infer<typeof LevelSchema>;

export const PrerequisitesSchema = z.object({
  edges: z.array(z.tuple([z.string(), z.string()])),
  remediation: z.record(z.string(), z.array(z.string())),
});

// ---------------- Academy ----------------
export const AcademyTopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  pages: z.tuple([z.number().int().min(1), z.number().int().min(1)]),
  skills: z.array(z.string()).min(1),
});
export const AcademyChapterSchema = z.object({
  id: z.string(),
  semesterId: z.enum(["fy-s1", "fy-s2", "sy-s1"]),
  order: z.number().int(),
  chapter: z.string(),
  title: z.string(),
  file: z.string(),
  objectivesSource: z.enum(["stated", "derived"]),
  objectivesPage: z.number().int().optional(),
  objectives: z.array(z.string()).min(1),
  foundations: z.array(z.string()),
  topics: z.array(AcademyTopicSchema).min(1),
});
export const AcademyMapSchema = z.object({
  university: z.string(),
  semesters: z.array(z.object({ id: z.string(), label: z.string(), course: z.string(), dir: z.string() })),
  chapters: z.array(AcademyChapterSchema),
});
export type AcademyChapter = z.infer<typeof AcademyChapterSchema>;
export type AcademyTopic = z.infer<typeof AcademyTopicSchema>;

export const SourceManifestSchema = z.object({
  totalPdfs: z.number(),
  countsBySemester: z.record(z.string(), z.number()),
  files: z.array(
    z.object({
      path: z.string(),
      semesterId: z.string(),
      chapterNumber: z.string(),
      chapterTitle: z.string(),
      sha256: z.string().length(64),
      pageCount: z.number().int().positive(),
      lowTextPages: z.array(z.number().int()),
      extractionQuality: z.enum(["good", "partial", "image-only"]),
      annotated: z.boolean(),
    }),
  ),
});

// ---------------- Simulations ----------------
export type SimDomain = "number" | "algebra" | "geometry-trig" | "discrete" | "calculus" | "linear-algebra" | "probability-stats" | "numerical" | "ai-ml";

export interface SimulationMeta {
  slug: string;
  title: string;
  summary: string;
  level: number;
  domain: SimDomain;
  /** Master Core skill ids this lab teaches */
  skills: string[];
  /** question templates used for the lab's 3-question practice */
  practice: string[];
  presets: string[];
}

// ---------------- Lessons ----------------
export type StageId = "why" | "intuition" | "visualize" | "explore" | "meaning" | "worked" | "try" | "tools" | "practice" | "apply" | "mastery" | "next";

export const STAGE_TITLES: Record<StageId, string> = {
  why: "Why does this matter?",
  intuition: "Understand intuitively",
  visualize: "Visualize",
  explore: "Explore",
  meaning: "Math meaning",
  worked: "Worked example",
  try: "Try by hand",
  tools: "Solve with tools",
  practice: "Practice",
  apply: "Apply",
  mastery: "Check mastery",
  next: "Continue or remediate",
};
export const STAGE_ORDER: StageId[] = ["why", "intuition", "visualize", "explore", "meaning", "worked", "try", "tools", "practice", "apply", "mastery", "next"];

export type ExplanationMode = "simple" | "formal" | "university";

export type Block =
  | { t: "text"; md: string; mode?: ExplanationMode }
  | { t: "math"; tex: string; caption?: string }
  | { t: "callout"; kind: "note" | "warning" | "analogy" | "exact"; md: string }
  | { t: "sim"; slug: string; preset?: string; caption?: string }
  | { t: "steps"; title?: string; steps: { md: string; tex?: string }[] }
  | {
      t: "try";
      prompt: string;
      answer: AnswerSpec;
      hints: [string, string, string];
      solution: { md: string; tex?: string }[];
      answerDisplay: string;
      misconceptions?: { id: string; values: string[]; feedback: string }[];
    }
  | { t: "symbols"; items: { symbol: string; name: string; meaning: string; values?: string }[] }
  | { t: "code"; lang: "python" | "r"; code: string; note: string; computed?: { label: string; value: string }[] }
  | { t: "practice"; templates: string[]; count: number }
  | { t: "mastery"; templates: string[] }
  | { t: "links"; items: { kind: "lesson" | "topic" | "sim" | "academy"; id: string; label: string; why?: string }[] }
  | { t: "table"; caption: string; head: string[]; rows: string[][] };

export interface Stage {
  id: StageId;
  blocks: Block[];
}

export interface Lesson {
  slug: string;
  title: string;
  /** primary Master Core topic id */
  topic: string;
  /** other topics this lesson also teaches */
  alsoCovers?: string[];
  level: number;
  summary: string;
  /** Academy chapters for which this is a bridge lesson */
  bridgesFor?: string[];
  stages: Stage[];
}
