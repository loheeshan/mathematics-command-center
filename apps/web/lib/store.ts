"use client";
/**
 * Local-first learner store (guest mode).
 * Everything is kept in this browser's localStorage under one versioned key, validated
 * with zod on load. Nothing is sent to a server. Export/import/delete live in Settings.
 */
import { useSyncExternalStore } from "react";
import { z } from "zod";
import type { AttemptEvidence } from "@mcc/question-engine";
import type { ExplanationMode, StageId } from "@mcc/curriculum";

const KEY = "mcc:v1";
const MAX_ATTEMPTS = 5000;

const StageIdZ = z.enum(["why", "intuition", "visualize", "explore", "meaning", "worked", "try", "tools", "practice", "apply", "mastery", "next"]);
const AttemptZ = z.object({ skill: z.string(), templateId: z.string(), correct: z.boolean(), partialCredit: z.number(), hintsUsed: z.number(), revealedSolution: z.boolean(), at: z.number() });

export const StateZ = z.object({
  version: z.literal(1),
  createdAt: z.number(),
  profile: z.object({ entryMode: z.string().nullable(), goal: z.string().nullable() }),
  settings: z.object({
    theme: z.enum(["dark", "light", "system"]),
    contrast: z.enum(["normal", "high"]),
    reducedMotion: z.boolean(),
    explanationMode: z.enum(["simple", "formal", "university"]),
    fontScale: z.number().min(0.9).max(1.5),
  }),
  lessons: z.record(z.string(), z.object({ stage: StageIdZ, completed: z.array(StageIdZ), updatedAt: z.number() })),
  attempts: z.array(AttemptZ),
  bookmarks: z.array(z.object({ href: z.string(), label: z.string(), at: z.number() })),
  notes: z.record(z.string(), z.object({ text: z.string().max(20000), updatedAt: z.number() })),
  notebook: z.array(z.object({ id: z.string(), kind: z.enum(["math", "note", "plot"]), src: z.string().max(5000) })),
  recentSims: z.array(z.object({ slug: z.string(), at: z.number() })),
  returnTo: z.object({ href: z.string(), label: z.string() }).nullable(),
  exams: z.array(z.object({ id: z.string(), blueprint: z.string(), seed: z.number(), startedAt: z.number(), finishedAt: z.number(), score: z.number(), total: z.number(), timed: z.boolean(), weakSkills: z.array(z.string()) })),
  lastVisited: z.object({ href: z.string(), label: z.string(), at: z.number() }).nullable(),
});
export type State = z.infer<typeof StateZ>;

export const defaultState = (): State => ({
  version: 1,
  createdAt: 0,
  profile: { entryMode: null, goal: null },
  settings: { theme: "dark", contrast: "normal", reducedMotion: false, explanationMode: "simple", fontScale: 1 },
  lessons: {},
  attempts: [],
  bookmarks: [],
  notes: {},
  notebook: [],
  recentSims: [],
  returnTo: null,
  exams: [],
  lastVisited: null,
});

const SERVER_STATE = defaultState();
let state: State = SERVER_STATE;
let loaded = false;
let loadWarning: string | null = null;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      state = { ...defaultState(), createdAt: Date.now() };
      return;
    }
    const parsed = StateZ.safeParse(JSON.parse(raw));
    if (parsed.success) state = parsed.data;
    else {
      window.localStorage.setItem(`${KEY}:corrupt:${Date.now()}`, raw);
      state = { ...defaultState(), createdAt: Date.now() };
      loadWarning = "Your saved progress could not be read and was backed up; a fresh profile was started.";
    }
  } catch {
    state = { ...defaultState(), createdAt: Date.now() };
    loadWarning = "Browser storage is unavailable (private mode?). Progress will last only for this visit.";
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    loadWarning = "Could not save progress (storage full or blocked).";
  }
}

export function update(fn: (s: State) => State) {
  load();
  state = fn(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY || !e.newValue) return;
    const p = StateZ.safeParse(JSON.parse(e.newValue));
    if (p.success) {
      state = p.data;
      listeners.forEach((x) => x());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function getState() {
  load();
  return state;
}

/** Subscribe to (a slice of) the store. Server render uses defaults; the client re-renders after hydration. */
export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(SERVER_STATE),
  );
}
export const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false);
export const getLoadWarning = () => loadWarning;

// ---------------- actions ----------------
export const actions = {
  recordAttempt(a: AttemptEvidence) {
    update((s) => ({ ...s, attempts: [...s.attempts, a].slice(-MAX_ATTEMPTS) }));
  },
  setLessonStage(slug: string, stage: StageId, complete?: StageId) {
    update((s) => {
      const cur = s.lessons[slug] ?? { stage, completed: [], updatedAt: Date.now() };
      const completed = complete && !cur.completed.includes(complete) ? [...cur.completed, complete] : cur.completed;
      return { ...s, lessons: { ...s.lessons, [slug]: { stage, completed, updatedAt: Date.now() } } };
    });
  },
  setSettings(p: Partial<State["settings"]>) {
    update((s) => ({ ...s, settings: { ...s.settings, ...p } }));
  },
  setExplanationMode(m: ExplanationMode) {
    update((s) => ({ ...s, settings: { ...s.settings, explanationMode: m } }));
  },
  setProfile(p: Partial<State["profile"]>) {
    update((s) => ({ ...s, profile: { ...s.profile, ...p } }));
  },
  toggleBookmark(href: string, label: string) {
    update((s) => ({
      ...s,
      bookmarks: s.bookmarks.some((b) => b.href === href) ? s.bookmarks.filter((b) => b.href !== href) : [...s.bookmarks, { href, label, at: Date.now() }],
    }));
  },
  setNote(key: string, text: string) {
    update((s) => ({ ...s, notes: { ...s.notes, [key]: { text: text.slice(0, 20000), updatedAt: Date.now() } } }));
  },
  visitSim(slug: string) {
    update((s) => ({ ...s, recentSims: [{ slug, at: Date.now() }, ...s.recentSims.filter((r) => r.slug !== slug)].slice(0, 8) }));
  },
  setReturnTo(r: State["returnTo"]) {
    update((s) => ({ ...s, returnTo: r }));
  },
  setLastVisited(href: string, label: string) {
    update((s) => (s.lastVisited?.href === href ? s : { ...s, lastVisited: { href, label, at: Date.now() } }));
  },
  setNotebook(cells: State["notebook"]) {
    update((s) => ({ ...s, notebook: cells.slice(0, 200) }));
  },
  recordExam(e: State["exams"][number]) {
    update((s) => ({ ...s, exams: [...s.exams, e].slice(-100) }));
  },
  importJson(json: string): { ok: true } | { ok: false; error: string } {
    try {
      const p = StateZ.safeParse(JSON.parse(json));
      if (!p.success) return { ok: false, error: "That file is not a valid MCC progress export." };
      update(() => p.data);
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not read that file as JSON." };
    }
  },
  exportJson() {
    return JSON.stringify(getState(), null, 2);
  },
  deleteAll() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    update(() => ({ ...defaultState(), createdAt: Date.now() }));
  },
};
