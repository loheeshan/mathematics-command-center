import { describe, it, expect } from 'vitest';
import { JOURNEY } from '../../packages/curriculum/src/journey';
import { normalizeParameters, visualModel } from '../../apps/web/lib/journey-model';
import { defaultState, StateZ } from '../../apps/web/lib/store';

describe('visual mathematics', () => {
  const model = (id:string, a:number, b:number) => visualModel(JOURNEY.find(l=>l.id===id)!,[a,b]);
  it('computes independent reference examples', () => {
    expect(model('counting',0,5).value).toBe(0);
    expect(model('addition',4,3).value).toBe(7);
    expect(model('subtraction',2,6).value).toBe(-4);
    expect(model('division',20,6).equation).toContain('3 remainder 2');
    expect(model('fractions',2,4).value).toBe(.5);
    expect(model('percentages',200,15).value).toBe(30);
    expect(model('powers',3,3).value).toBe(27);
    expect(model('functions',3,2).value).toBe(8);
    expect(model('trigonometry',90,3).value).toBeCloseTo(3);
    expect(model('probability',3,7).value).toBeCloseTo(.3);
    expect(model('mean',8,1).value).toBe(5);
    expect(model('variance',4,2).value).toBeCloseTo(8/3);
    expect(model('vectors',3,4).value).toBe(5);
    expect(model('derivatives',3,.1).value).toBe(6);
    expect(model('integrals',4,8).value).toBe(8);
    expect(model('gradient-descent',3,.1).value).toBeCloseTo(2.4);
    expect(model('gradient-descent',3,1.1).detail).toContain('Loss increased');
    expect(model('bayes',10,10).value).toBeCloseTo(.5);
  });
  it('remains finite at all control boundaries', () => {
    for(const l of JOURNEY) for(const a of [l.params[0].min,l.params[0].initial,l.params[0].max]) for(const b of [l.params[1].min,l.params[1].initial,l.params[1].max]) {
      const result=visualModel(l,[a,b]);
      expect(Number.isFinite(result.value),l.id).toBe(true);
      expect(result.detail).not.toMatch(/NaN|Infinity/);
    }
  });
  it('clamps imported and URL parameters to safe ranges and steps', () => {
    const l=JOURNEY.find(l=>l.id==='derivatives')!;
    expect(normalizeParameters(l,[Infinity,NaN])).toEqual([1,.5]);
    expect(normalizeParameters(l,[-999,999])).toEqual([-2,1]);
    expect(normalizeParameters(l,[.26,.11])).toEqual([.25,.1]);
  });
});
describe('saved data compatibility', () => {
  it('adds guided state to original v1 exports without losing notes', () => {
    const original:Partial<ReturnType<typeof defaultState>> = defaultState();
    delete original.journey;
    original.notes={'lesson:fractions':{text:'Keep my original note',updatedAt:1}};
    const migrated=StateZ.parse(original);
    expect(migrated.notes['lesson:fractions'].text).toBe('Keep my original note');
    expect(migrated.journey.lastLesson).toBe('counting');
  });
  it('round-trips snapshots and rejects unsafe nonfinite state', () => {
    const state=defaultState();
    state.journey.notes.push({id:'a',lesson:'fractions',step:3,values:[2,4],text:'Half',at:1});
    expect(StateZ.parse(JSON.parse(JSON.stringify(state)))).toEqual(state);
    state.journey.notes[0].values[0]=Infinity;
    expect(StateZ.safeParse(state).success).toBe(false);
  });
});
