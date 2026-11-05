import masterCoreJson from "../../../content/core/master-core.json";
import prerequisitesJson from "../../../content/curriculum/prerequisites.json";
import academyJson from "../../../content/curriculum/academy-map.json";
import manifestJson from "../../../content/curriculum/source-manifest.json";
import { AcademyMapSchema, MasterCoreSchema, PrerequisitesSchema, SourceManifestSchema, type AcademyChapter, type Level, type Topic, type Unit } from "./types";

export const masterCore = MasterCoreSchema.parse(masterCoreJson);
export const prerequisites = PrerequisitesSchema.parse(prerequisitesJson);
export const academy = AcademyMapSchema.parse(academyJson);
export const sourceManifest = SourceManifestSchema.parse(manifestJson);

export interface TopicRef extends Topic {
  level: Level;
  unit: Unit;
}

export const allTopics: TopicRef[] = masterCore.levels.flatMap((level) => level.units.flatMap((unit) => unit.topics.map((t) => ({ ...t, level, unit }))));
const topicMap = new Map(allTopics.map((t) => [t.id, t]));
export const topicById = (id: string) => topicMap.get(id);

export const prerequisitesOf = (id: string) => prerequisites.edges.filter(([, b]) => b === id).map(([a]) => a);
export const dependentsOf = (id: string) => prerequisites.edges.filter(([a]) => a === id).map(([, b]) => b);

/** All ancestors in dependency order (deepest first). */
export function ancestorsOf(id: string): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  const visit = (n: string) => {
    for (const p of prerequisitesOf(n)) {
      if (seen.has(p)) continue;
      seen.add(p);
      visit(p);
      order.push(p);
    }
  };
  visit(id);
  return order;
}

export const chapterById = (id: string) => academy.chapters.find((c) => c.id === id);
export const chaptersForSemester = (semesterId: string) => academy.chapters.filter((c) => c.semesterId === semesterId).sort((a, b) => a.order - b.order);
export const manifestEntryFor = (ch: AcademyChapter) => sourceManifest.files.find((f) => f.semesterId === ch.semesterId && f.path.endsWith("/" + ch.file));
export const chaptersUsingSkill = (skill: string) => academy.chapters.filter((c) => c.topics.some((t) => t.skills.includes(skill)) || c.foundations.includes(skill));
