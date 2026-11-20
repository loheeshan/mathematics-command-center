import { describe, it, expect } from 'vitest';
import { JOURNEY, ROLE_PATHS, checkJourneyAnswer } from '../../packages/curriculum/src/journey';

describe('guided curriculum', () => {
  it('orders every prerequisite before the lesson that uses it', () => {
    expect(new Set(JOURNEY.map(l => l.id)).size).toBe(JOURNEY.length);
    for (const [index, lesson] of JOURNEY.entries()) {
      for (const prerequisite of lesson.prerequisites) {
        const position = JOURNEY.findIndex(l => l.id === prerequisite);
        expect(position).toBeGreaterThanOrEqual(0);
        expect(position).toBeLessThan(index);
      }
      for (const param of lesson.params) {
        expect(param.initial).toBeGreaterThanOrEqual(param.min);
        expect(param.initial).toBeLessThanOrEqual(param.max);
      }
    }
  });
  it('keeps all required foundations in each role path', () => {
    for (const role of ROLE_PATHS) {
      expect(role.lessons[0]).toBe('counting');
      for (const id of role.lessons) {
        const lesson = JOURNEY.find(l => l.id === id)!;
        expect(lesson).toBeDefined();
        for (const required of lesson.prerequisites) expect(role.lessons).toContain(required);
      }
    }
  });
  it('checks numeric understanding without accepting blank, expressions or non-finite input', () => {
    for (const lesson of JOURNEY) {
      expect(checkJourneyAnswer(lesson, String(lesson.check.answer))).toBe(true);
      expect(checkJourneyAnswer(lesson, ` ${lesson.check.answer.toFixed(3)} `)).toBe(true);
      for (const invalid of ['', ' ', 'NaN', 'Infinity', '1+1', '0x7', String(lesson.check.answer + 1)]) {
        expect(checkJourneyAnswer(lesson, invalid)).toBe(false);
      }
    }
  });
});
