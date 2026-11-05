import { templatesForSkill } from "@mcc/question-engine";
import { academy, allTopics } from "./data";
import { LESSONS } from "./lessons";
import { simulationsForSkill } from "./simulations";
import { STAGE_ORDER } from "./types";

export type TopicStatus = "lesson" | "lab-and-practice" | "lab-only" | "practice-only" | "not-yet-authored";

export const lessonsForTopic = (topicId: string) => LESSONS.filter((l) => l.topic === topicId || l.alsoCovers?.includes(topicId));
export const lessonBySlug = (slug: string) => LESSONS.find((l) => l.slug === slug);

export function topicCoverage(topicId: string) {
  const lessons = lessonsForTopic(topicId);
  const sims = simulationsForSkill(topicId);
  const templates = templatesForSkill(topicId);
  let status: TopicStatus;
  if (lessons.length) status = "lesson";
  else if (sims.length && templates.length) status = "lab-and-practice";
  else if (sims.length) status = "lab-only";
  else if (templates.length) status = "practice-only";
  else status = "not-yet-authored";
  return { topicId, status, lessons, sims, templates };
}

export const STATUS_LABEL: Record<TopicStatus, string> = {
  lesson: "Full lesson",
  "lab-and-practice": "Lab + practice (no lesson yet)",
  "lab-only": "Lab only",
  "practice-only": "Practice only",
  "not-yet-authored": "Not yet authored",
};

/** Academy topic status per the spec: implemented / partial / missing. */
export function academyTopicStatus(skills: string[]): "implemented" | "partial" | "missing" {
  const st = skills.map((s) => topicCoverage(s).status);
  const strong = st.filter((s) => s === "lesson" || s === "lab-and-practice").length;
  const any = st.filter((s) => s !== "not-yet-authored").length;
  if (strong === skills.length) return "implemented";
  if (any > 0) return "partial";
  return "missing";
}

export function coverageSummary() {
  const topics = allTopics.map((t) => ({ ...topicCoverage(t.id), level: t.level.number, title: t.title }));
  const byLevel = Array.from({ length: 11 }, (_, n) => {
    const ts = topics.filter((t) => t.level === n);
    return {
      level: n,
      total: ts.length,
      lesson: ts.filter((t) => t.status === "lesson").length,
      labOrPractice: ts.filter((t) => t.status !== "lesson" && t.status !== "not-yet-authored").length,
      none: ts.filter((t) => t.status === "not-yet-authored").length,
    };
  });
  const chapters = academy.chapters.map((c) => {
    const statuses = c.topics.map((t) => academyTopicStatus(t.skills));
    return {
      id: c.id,
      semesterId: c.semesterId,
      title: c.title,
      file: c.file,
      topics: c.topics.length,
      implemented: statuses.filter((s) => s === "implemented").length,
      partial: statuses.filter((s) => s === "partial").length,
      missing: statuses.filter((s) => s === "missing").length,
      bridgeLessons: [...new Set(c.foundations.flatMap((f) => lessonsForTopic(f).map((l) => l.slug)))],
    };
  });
  const fullLessons = LESSONS.filter((l) => STAGE_ORDER.every((s) => l.stages.some((st) => st.id === s && st.blocks.length > 0)));
  return { topics, byLevel, chapters, lessonCount: LESSONS.length, fullLessonCount: fullLessons.length };
}
