/**
 * Validates curriculum integrity and regenerates content/curriculum/coverage-report.md.
 * Run: pnpm validate:curriculum   (exits non-zero on any error)
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  masterCore, prerequisites, academy, sourceManifest, allTopics, topicById, LESSONS, SIMULATIONS, STAGE_ORDER, chapterById,
  coverageSummary, academyTopicStatus, topicCoverage, lessonBySlug,
} from "../../packages/curriculum/src";
import { getTemplate, checkAnswer, canonicalInput, TEMPLATES, practicedSkills, type QuestionInstance } from "../../packages/question-engine/src";
import { SIM_SLUGS } from "../../packages/visualizers/src";

const errors: string[] = [];
const err = (m: string) => errors.push(m);
const topicIds = new Set(allTopics.map((t) => t.id));

// ---- Master Core
if (masterCore.levels.length !== 11) err("Master Core must have 11 levels");
if (topicIds.size !== allTopics.length) err("duplicate topic ids");

// ---- DAG
for (const [a, b] of prerequisites.edges) {
  if (!topicIds.has(a)) err(`prerequisite edge uses unknown topic ${a}`);
  if (!topicIds.has(b)) err(`prerequisite edge uses unknown topic ${b}`);
  if (a === b) err(`self-loop ${a}`);
}
{
  const adj = new Map<string, string[]>();
  for (const [a, b] of prerequisites.edges) adj.set(a, [...(adj.get(a) ?? []), b]);
  const state = new Map<string, number>();
  const visit = (n: string, path: string[]): void => {
    if (state.get(n) === 2) return;
    if (state.get(n) === 1) { err(`cycle: ${[...path, n].join(" → ")}`); return; }
    state.set(n, 1);
    for (const m of adj.get(n) ?? []) visit(m, [...path, n]);
    state.set(n, 2);
  };
  for (const t of topicIds) visit(t, []);
}
for (const [k, vs] of Object.entries(prerequisites.remediation)) for (const v of [k, ...vs]) if (!topicIds.has(v)) err(`remediation uses unknown topic ${v}`);

// ---- Academy vs manifest
if (sourceManifest.totalPdfs !== 33) err(`manifest has ${sourceManifest.totalPdfs} PDFs, expected 33`);
const mapped = new Set<string>();
for (const ch of academy.chapters) {
  const m = sourceManifest.files.find((f) => f.semesterId === ch.semesterId && f.path.endsWith("/" + ch.file));
  if (!m) { err(`academy chapter ${ch.id}: file not in manifest: ${ch.file}`); continue; }
  mapped.add(m.path);
  for (const t of ch.topics) {
    if (t.pages[0] > t.pages[1] || t.pages[1] > m.pageCount) err(`${ch.id}/${t.id}: pages ${t.pages} outside 1..${m.pageCount}`);
    for (const s of t.skills) if (!topicIds.has(s)) err(`${ch.id}/${t.id}: unknown skill ${s}`);
  }
  for (const f of ch.foundations) if (!topicIds.has(f)) err(`${ch.id}: unknown foundation ${f}`);
  if (ch.objectivesSource === "stated" && !ch.objectivesPage) err(`${ch.id}: stated objectives need a page`);
}
if (mapped.size !== sourceManifest.files.length) err(`only ${mapped.size} of ${sourceManifest.files.length} PDFs are mapped in academy-map.json`);

// ---- Simulations
const simSlugs = new Set(SIMULATIONS.map((s) => s.slug));
for (const s of SIMULATIONS) {
  if (!SIM_SLUGS.includes(s.slug)) err(`simulation ${s.slug} has no component`);
  for (const k of s.skills) if (!topicIds.has(k)) err(`simulation ${s.slug}: unknown skill ${k}`);
  for (const t of s.practice) if (!getTemplate(t)) err(`simulation ${s.slug}: unknown practice template ${t}`);
  if (s.presets.length === 0) err(`simulation ${s.slug}: needs at least one preset`);
}
for (const slug of SIM_SLUGS) if (!simSlugs.has(slug)) err(`component ${slug} is not registered in SIMULATIONS`);

// ---- Question templates
for (const t of TEMPLATES) if (!topicIds.has(t.skill)) err(`template ${t.id}: unknown skill ${t.skill}`);

// ---- Lessons
const slugs = new Set<string>();
for (const l of LESSONS) {
  if (slugs.has(l.slug)) err(`duplicate lesson slug ${l.slug}`);
  slugs.add(l.slug);
  if (!topicIds.has(l.topic)) err(`lesson ${l.slug}: unknown topic ${l.topic}`);
  for (const c of l.bridgesFor ?? []) if (!chapterById(c)) err(`lesson ${l.slug}: unknown academy chapter ${c}`);
  for (const st of STAGE_ORDER) {
    const stage = l.stages.find((s) => s.id === st);
    if (!stage || stage.blocks.length === 0) err(`lesson ${l.slug}: stage "${st}" is missing or empty`);
  }
  l.stages.forEach((stage) => stage.blocks.forEach((b, i) => {
    const where = `lesson ${l.slug} ${stage.id}#${i}`;
    if (b.t === "sim" && !simSlugs.has(b.slug)) err(`${where}: unknown sim ${b.slug}`);
    if (b.t === "sim" && b.preset && !SIMULATIONS.find((s) => s.slug === b.slug)?.presets.includes(b.preset)) err(`${where}: unknown preset ${b.preset}`);
    if ((b.t === "practice" || b.t === "mastery") && b.templates.some((t) => !getTemplate(t))) err(`${where}: unknown template in ${b.templates}`);
    if (b.t === "mastery" && b.templates.length !== 3) err(`${where}: mastery check should have 3 representations`);
    if (b.t === "links") for (const it of b.items) {
      const ok = it.kind === "lesson" ? slugs.has(it.id) || LESSONS.some((x) => x.slug === it.id) : it.kind === "topic" ? topicIds.has(it.id) : it.kind === "sim" ? simSlugs.has(it.id) : !!chapterById(it.id);
      if (!ok) err(`${where}: dead link ${it.kind}:${it.id}`);
    }
    if (b.t === "try") {
      const q: QuestionInstance = { templateId: "x", seed: 0, skill: l.topic, prompt: b.prompt, answer: b.answer, hints: b.hints, solution: [], answerDisplay: b.answerDisplay, exactness: "exact" };
      const r = checkAnswer(q, canonicalInput(q));
      if (!r.correct) err(`${where}: canonical answer ${canonicalInput(q)} is rejected by the checker`);
      for (const m of b.misconceptions ?? []) for (const v of m.values) if (checkAnswer(q, v).correct) err(`${where}: misconception value ${v} is actually accepted as correct`);
    }
  }));
}

// ---- Report
const cov = coverageSummary();
const pct = (a: number, b: number) => (b ? ((100 * a) / b).toFixed(0) : "0");
const lines: string[] = [];
lines.push("# Curriculum Coverage Report", "", "_Generated by `pnpm validate:curriculum` from the code. Do not edit by hand._", "");
lines.push("Statuses: **lesson** = full 12-stage lesson; **lab+practice** = working lab and seeded practice but no lesson; **practice-only** / **lab-only**; **not yet authored** = roadmap entry only.", "");
lines.push("## Totals", "");
lines.push(`- Full 12-stage lessons: **${cov.fullLessonCount}**`);
lines.push(`- Working simulations: **${SIMULATIONS.length}**`);
lines.push(`- Question templates: **${TEMPLATES.length}** covering **${practicedSkills().length}** skills`);
lines.push(`- University PDFs indexed (file + page ranges): **${mapped.size} / ${sourceManifest.totalPdfs}**`, "");
lines.push("## Master Core", "", "| Level | Topics | Lesson | Lab and/or practice only | Not yet authored | Taught % |", "|---|---|---|---|---|---|");
for (const l of cov.byLevel) lines.push(`| L${l.level} ${masterCore.levels[l.level].title} | ${l.total} | ${l.lesson} | ${l.labOrPractice} | ${l.none} | ${pct(l.lesson + l.labOrPractice, l.total)}% |`);
const totalT = cov.topics.length, taught = cov.topics.filter((t) => t.status !== "not-yet-authored").length, lessonT = cov.topics.filter((t) => t.status === "lesson").length;
lines.push(`| **All** | ${totalT} | ${lessonT} | ${taught - lessonT} | ${totalT - taught} | ${pct(taught, totalT)}% |`, "");
lines.push("## Academy Path (per PDF)", "", "Topic status: **implemented** = every skill of the topic has a lesson or lab+practice; **partial** = some support; **missing** = none.", "");
lines.push("| Semester | Chapter | PDF | Pages | Extraction | Topics | Implemented | Partial | Missing | Bridge lessons |", "|---|---|---|---|---|---|---|---|---|---|");
for (const ch of academy.chapters) {
  const m = sourceManifest.files.find((f) => f.semesterId === ch.semesterId && f.path.endsWith("/" + ch.file))!;
  const st = ch.topics.map((t) => academyTopicStatus(t.skills));
  const bridges = [...new Set(ch.foundations.flatMap((f) => topicCoverage(f).lessons.map((x) => x.slug)))];
  lines.push(`| ${ch.semesterId} | ${ch.chapter} ${ch.title} | ${ch.file} | ${m.pageCount} | ${m.extractionQuality} | ${st.length} | ${st.filter((s) => s === "implemented").length} | ${st.filter((s) => s === "partial").length} | ${st.filter((s) => s === "missing").length} | ${bridges.length} |`);
}
const allSt = academy.chapters.flatMap((c) => c.topics.map((t) => academyTopicStatus(t.skills)));
lines.push("", `Academy topics overall: ${allSt.length} — implemented ${allSt.filter((s) => s === "implemented").length} (${pct(allSt.filter((s) => s === "implemented").length, allSt.length)}%), partial ${allSt.filter((s) => s === "partial").length}, missing ${allSt.filter((s) => s === "missing").length}.`, "");
lines.push("**Not built for any Academy chapter yet:** lecture-matched question sets (questions reproducing specific lecture examples with page references). Practice is generated from MCC templates for the mapped skills.", "");
lines.push("## Lessons", "", "| Lesson | Topic | Level | Bridges for |", "|---|---|---|---|");
for (const l of LESSONS) lines.push(`| ${l.title} (\`/lesson/${l.slug}\`) | ${topicById(l.topic)?.title} | ${l.level} | ${(l.bridgesFor ?? []).join(", ")} |`);
lines.push("", "## Topic detail", "", "| Topic | Level | Status | Lessons | Labs | Templates |", "|---|---|---|---|---|---|");
for (const t of cov.topics) lines.push(`| ${t.title} | ${t.level} | ${t.status} | ${t.lessons.map((x) => x.slug).join(", ")} | ${t.sims.map((x) => x.slug).join(", ")} | ${t.templates.map((x) => x.id).join(", ")} |`);
writeFileSync(resolve(process.cwd(), "content/curriculum/coverage-report.md"), lines.join("\n") + "\n");
void lessonBySlug;

if (errors.length) {
  console.error(`✗ ${errors.length} curriculum error(s):\n- ` + errors.join("\n- "));
  process.exit(1);
}
console.log(`✓ curriculum valid: ${allTopics.length} topics, ${prerequisites.edges.length} DAG edges (acyclic), ${academy.chapters.length} academy chapters ↔ ${sourceManifest.totalPdfs} PDFs, ${SIMULATIONS.length} sims, ${TEMPLATES.length} templates, ${LESSONS.length} lessons (${cov.fullLessonCount} with all 12 stages).`);
console.log(`  wrote content/curriculum/coverage-report.md`);
