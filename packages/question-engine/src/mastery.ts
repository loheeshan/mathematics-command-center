/**
 * Transparent mastery model. Shown to learners on the Progress page — no hidden scores.
 *
 * Each attempt contributes evidence e = correctness × hint penalty, where
 *   correctness = partial credit (0..1), hint penalty = 1 − 0.2 × hints used (min 0.4),
 *   and revealing the worked solution before answering counts as 0 evidence.
 * Evidence is averaged with recency weights 0.8^k (k = 0 for the newest attempt).
 *
 * Levels:
 *   not-started  no attempts
 *   learning     score < 0.6
 *   practising   0.6 ≤ score < 0.85, or < 3 correct answers, or only one question template seen
 *   mastered     score ≥ 0.85 AND ≥ 3 correct AND correct answers from ≥ 2 templates
 * Mastered skills are scheduled for spaced review at 1, 3, 7, 14, 30, 60 days after
 * consecutive successful reviews; a wrong review drops the interval back to 1 day and
 * the level shows "review needed" when the due date has passed.
 */
export interface AttemptEvidence {
  skill: string;
  templateId: string;
  correct: boolean;
  partialCredit: number;
  hintsUsed: number;
  revealedSolution: boolean;
  at: number; // epoch ms
}

export type MasteryLevel = "not-started" | "learning" | "practising" | "mastered" | "review-needed";

export interface MasteryState {
  skill: string;
  score: number;
  level: MasteryLevel;
  attempts: number;
  correct: number;
  templatesCorrect: number;
  lastAttemptAt: number | null;
  nextReviewAt: number | null;
  reviewStreak: number;
}

export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];
const DAY = 86_400_000;

export function evidenceOf(a: AttemptEvidence) {
  if (a.revealedSolution) return 0;
  const penalty = Math.max(0.4, 1 - 0.2 * a.hintsUsed);
  return Math.max(0, Math.min(1, a.partialCredit)) * penalty;
}

export function computeMastery(skill: string, attempts: AttemptEvidence[], now = Date.now()): MasteryState {
  const mine = attempts.filter((a) => a.skill === skill).sort((a, b) => a.at - b.at);
  if (mine.length === 0) {
    return { skill, score: 0, level: "not-started", attempts: 0, correct: 0, templatesCorrect: 0, lastAttemptAt: null, nextReviewAt: null, reviewStreak: 0 };
  }
  let wSum = 0;
  let eSum = 0;
  mine.slice().reverse().forEach((a, k) => {
    const w = 0.8 ** k;
    wSum += w;
    eSum += w * evidenceOf(a);
  });
  const score = eSum / wSum;
  const correctOnes = mine.filter((a) => a.correct && !a.revealedSolution);
  const templatesCorrect = new Set(correctOnes.map((a) => a.templateId)).size;
  const masteredNow = score >= 0.85 && correctOnes.length >= 3 && templatesCorrect >= 2;

  // spaced review: walk the attempts, grouping same-day sessions
  let reviewStreak = 0;
  let nextReviewAt: number | null = null;
  let achieved = false;
  let lastDay = -1;
  for (let i = 0; i < mine.length; i++) {
    const a = mine[i];
    const day = Math.floor(a.at / DAY);
    if (!achieved) {
      const prefix = mine.slice(0, i + 1);
      const st = scoreOf(prefix);
      if (st.score >= 0.85 && st.correct >= 3 && st.templates >= 2) {
        achieved = true;
        reviewStreak = 0;
        nextReviewAt = a.at + REVIEW_INTERVALS_DAYS[0] * DAY;
        lastDay = day;
      }
      continue;
    }
    if (day === lastDay) continue; // only the first attempt of a later day counts as a review
    lastDay = day;
    if (nextReviewAt !== null && a.at >= nextReviewAt - DAY / 2) {
      if (a.correct && !a.revealedSolution) reviewStreak = Math.min(reviewStreak + 1, REVIEW_INTERVALS_DAYS.length - 1);
      else reviewStreak = 0;
      nextReviewAt = a.at + REVIEW_INTERVALS_DAYS[reviewStreak] * DAY;
    }
  }

  let level: MasteryLevel;
  if (masteredNow) level = nextReviewAt !== null && now > nextReviewAt ? "review-needed" : "mastered";
  else if (achieved && nextReviewAt !== null && now > nextReviewAt) level = "review-needed";
  else level = score < 0.6 ? "learning" : "practising";

  return {
    skill,
    score,
    level,
    attempts: mine.length,
    correct: correctOnes.length,
    templatesCorrect,
    lastAttemptAt: mine[mine.length - 1].at,
    nextReviewAt: achieved ? nextReviewAt : null,
    reviewStreak,
  };
}

function scoreOf(as: AttemptEvidence[]) {
  let w = 0, e = 0;
  as.slice().reverse().forEach((a, k) => {
    w += 0.8 ** k;
    e += 0.8 ** k * evidenceOf(a);
  });
  const corr = as.filter((a) => a.correct && !a.revealedSolution);
  return { score: e / w, correct: corr.length, templates: new Set(corr.map((a) => a.templateId)).size };
}
