"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { JOURNEY, JOURNEY_UNITS, ROLE_PATHS, checkJourneyAnswer, journeyLesson } from '@mcc/curriculum';
import { actions, getLoadWarning, useHydrated, useStore } from '@/lib/store';
import { normalizeParameters, visualModel } from '@/lib/journey-model';
import { JourneyVisual } from './JourneyVisual';

export const JOURNEY_STEPS = ['Understand', 'Explore', 'Check', 'Reflect'];
export function LearningNotebook() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const journey = useStore(s => s.journey);
  const selected = params.get('lesson') ?? (hydrated ? journey.lastLesson : 'counting');
  const lesson = journeyLesson(selected) ?? JOURNEY[0];
  const roleId = params.get('path') ?? journey.role;
  const role = ROLE_PATHS.find(r => r.id === roleId) ?? ROLE_PATHS[0];
  const requestedStep = params.get('step');
  const saved = journey.lessons[lesson.id];
  const step = requestedStep !== null && /^[0-3]$/.test(requestedStep) ? Number(requestedStep) : saved?.step ?? 0;
  const values = normalizeParameters(lesson, lesson.params.map((p,i) => {
    const query = params.get(i===0?'a':'b');
    return query !== null && query.trim() !== '' ? Number(query) : saved?.values[i] ?? p.initial;
  }));
  const [search,setSearch] = useState('');
  const [mobileOpen,setMobileOpen] = useState(false);
  const [tab,setTab] = useState('idea');
  const [answer,setAnswer] = useState('');
  const [feedback,setFeedback] = useState<'correct'|'incorrect'|null>(null);
  const [hint,setHint] = useState(false);
  const [draft,setDraft] = useState('');
  const [noteSaved,setNoteSaved] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousLesson = useRef(lesson.id);
  const model = visualModel(lesson,values);
  const pathLessons = JOURNEY.filter(l => role.lessons.includes(l.id));
  const completed = pathLessons.filter(l=>journey.lessons[l.id]?.checked).length;
  const index = pathLessons.findIndex(l=>l.id===lesson.id);
  const next = pathLessons[index+1];

  // Store only known lesson IDs and normalized values; opening a lesson records viewing, not mastery.
  useEffect(() => {
    if (!hydrated) return;
    actions.updateJourneyLesson(lesson.id, values, step);
    if (journey.role !== role.id) actions.setJourneyRole(role.id);
  // Values are compared as primitives to avoid a feedback loop from store notifications.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, lesson.id, values[0], values[1], step, role.id]);
  useEffect(() => {
    setAnswer(''); setFeedback(null); setHint(false); setTab('idea'); setDraft(''); setNoteSaved(false);
    if (previousLesson.current !== lesson.id) heading.current?.focus();
    previousLesson.current = lesson.id;
  }, [lesson.id]);

  const navigate = (id: string, nextStep=0, path=role.id) => {
    window.history.pushState(null,'',`/?lesson=${encodeURIComponent(id)}&step=${nextStep}&path=${encodeURIComponent(path)}`);
    setMobileOpen(false);
  };
  const setStep = (s:number) => {
    const query = new URLSearchParams(params.toString());
    query.set('lesson',lesson.id); query.set('step',String(s));
    window.history.pushState(null,'',`/?${query}`); setTab('idea');
  };
  const setValues = (nextValues:[number,number], explored=true) => {
    const normalized=normalizeParameters(lesson,nextValues);
    actions.updateJourneyLesson(lesson.id,normalized,step,explored?'explored':undefined);
    const query = new URLSearchParams(params.toString());
    query.set('lesson',lesson.id); query.set('a',String(normalized[0])); query.set('b',String(normalized[1]));
    window.history.replaceState(null,'',`/?${query}`); setNoteSaved(false);
  };
  const matches = (title:string,concept:string) => `${title} ${concept}`.toLowerCase().includes(search.trim().toLowerCase());
  const visible = pathLessons.filter(l=>matches(l.title,l.concept));
  return <div className="learning-layout" aria-busy={!hydrated}>
    <button className="mobile-course-toggle" aria-expanded={mobileOpen} aria-controls="course-nav" onClick={()=>setMobileOpen(!mobileOpen)}>Course & search <span>{mobileOpen?'Close':'Open'}</span></button>
    <aside id="course-nav" className={`course-sidebar ${mobileOpen?'mobile-open':''}`}>
      <p className="eyebrow">Your learning journey</p><h2 className="course-heading">Small steps. Big ideas.</h2>
      <label htmlFor="learning-path" className="sr-only">Learning path</label>
      <select id="learning-path" value={role.id} onChange={e=>{ const r=ROLE_PATHS.find(r=>r.id===e.target.value)!; actions.setJourneyRole(r.id); navigate(r.lessons.includes(lesson.id)?lesson.id:r.lessons[0],0,r.id); }}>{ROLE_PATHS.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select>
      <div className="course-summary">{completed} of {pathLessons.length} checkpoints passed<progress aria-label="Checkpoints passed" value={completed} max={pathLessons.length}/></div>
      <label htmlFor="course-search" className="sr-only">Search guided lessons</label><input id="course-search" className="course-search" type="search" placeholder="Search a concept…" value={search} onChange={e=>setSearch(e.target.value)}/>
      <nav aria-label="Course lessons">{JOURNEY_UNITS.map((unit,i)=>{
        const lessons=visible.filter(l=>l.unit===i); if(!lessons.length)return null;
        return <details className="course-unit" key={`${i}-${lesson.unit}-${search?1:0}`} open={search?true:lesson.unit===i}><summary>{unit.title}</summary><ul>{lessons.map(l=>{const status=journey.lessons[l.id];return <li key={l.id}><button className="lesson-link" aria-current={l.id===lesson.id?'page':undefined} onClick={()=>navigate(l.id)}><span className={`lesson-status ${status?.checked?'checked':''}`} aria-hidden="true">{status?.checked?'✓':status?.explored?'◐':status?.viewed?'·':''}</span><span>{l.title}<span className="sr-only">{status?.checked?', checkpoint passed':status?.explored?', explored':status?.viewed?', viewed':', not started'}</span></span></button></li>;})}</ul></details>;
      })}{visible.length===0&&<p className="sidebar-help">No matching lessons in this path. Try a different word or choose Complete explorer.</p>}</nav>
      <div className="sidebar-help">Start wherever you feel comfortable. Every lesson stays open.<Link href="/paths">Explore learning paths</Link><Link href="/learn">Browse the full reference library</Link></div>
    </aside>
    <section className="lesson-workspace" aria-label="Current lesson">
      <div className="lesson-breadcrumb"><span>THE MATH NOTEBOOK</span><span aria-hidden="true">/</span><span>{JOURNEY_UNITS[lesson.unit].title}</span></div>
      <div className="lesson-title-row"><div><p className="eyebrow">{lesson.unit===0?'Begin at the beginning':'Build on what you know'} · About {lesson.minutes} min</p><h1 tabIndex={-1} ref={heading}>{lesson.title}</h1><p className="lesson-subtitle">{lesson.subtitle}</p></div><span className="lesson-badge">{saved?.checked?'✓ Checkpoint passed':saved?.explored?'◐ Explored':'A little curiosity is enough'}</span></div>
      {selected!==lesson.id&&<p className="feedback" role="status">That lesson was not found. Start here or use the course search.</p>}
      <div className="workbench-grid">
        <section className="visual-panel" aria-label="Interactive visual">
          <div className="visual-toolbar"><span>THE VISUAL WORKBENCH</span><button onClick={()=>setValues(lesson.params.map(p=>p.initial) as [number,number],false)}>Reset</button></div>
          <div className="visual-canvas"><JourneyVisual lesson={lesson} values={values}/></div>
          <div className="visual-result" aria-live="polite" aria-atomic="true"><strong>{model.equation}</strong><span>{saved?.explored?'You changed the model':'Try moving a control below'}</span></div>
          <div className="visual-controls">{lesson.params.map((p,i)=><div key={`${lesson.id}-${i}`}><label htmlFor={`parameter-${i}`}>{p.label}<output>{values[i]}</output></label><input id={`parameter-${i}`} type="range" disabled={!hydrated} min={p.min} max={p.max} step={p.step??1} value={values[i]} onChange={e=>{const v:[number,number]=[...values];v[i]=Number(e.target.value);setValues(v);}}/></div>)}</div>
          <details className="visual-text"><summary>Read the visual as text</summary><p>{model.detail}</p></details>
        </section>
        <section className="explanation-panel" aria-label="Lesson explanation">
          <div className="explanation-tabs" role="group" aria-label="Explanation depth">{[['idea','The idea'],['math','The math'],['code','In code']].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</div>
          {tab==='math'?<><p className="eyebrow">Look a little closer</p><h2>The relationship</h2><p className="formula">{lesson.formula}</p><p className="explanation-copy">{lesson.worked}</p><div className="concept-callout"><strong>In the current visual</strong>{model.detail}</div></>:tab==='code'?<><p className="eyebrow">From idea to implementation</p><h2>A small piece of JavaScript</h2><pre className="code-example"><code>{lesson.code}</code></pre><p className="explanation-copy">{lesson.application}</p><p className="sidebar-help">Illustrative code to read or run in your own environment. The controls on the left run the visual model.</p></>:<>
            <p className="eyebrow">Step {step+1} of 4 · {JOURNEY_STEPS[step]}</p>
            <h2>{['First, the simple idea.','Make a change. Notice what happens.','Make the idea your own.','Leave a note for future you.'][step]}</h2>
            {step===0&&<><p className="explanation-copy">{lesson.concept}</p><div className="concept-callout"><strong>The thing to remember</strong>{lesson.takeaway}</div></>}
            {step===1&&<><p className="explanation-copy">{lesson.experiment}</p><div className="experiment-callout"><strong>Your experiment</strong>{saved?.explored?'You have changed the visual. Can you explain why the result changed—or stayed the same?':'Move either control. Predict the result before you change it.'}</div><p className="sidebar-help">{lesson.application}</p></>}
            {step===2&&<><p className="explanation-copy">{lesson.check.prompt}</p><form className="checkpoint-form" onSubmit={e=>{e.preventDefault();const correct=checkJourneyAnswer(lesson,answer);setFeedback(correct?'correct':'incorrect');if(correct)actions.updateJourneyLesson(lesson.id,values,step,'checked');}}><label htmlFor="checkpoint-answer">Your answer <span className="text-muted">(a number)</span></label><input id="checkpoint-answer" autoComplete="off" inputMode="decimal" value={answer} onChange={e=>{setAnswer(e.target.value);setFeedback(null);}} placeholder="Type your answer"/><button className="primary-button" type="submit">Check understanding</button></form><button className="quiet-button" onClick={()=>setHint(!hint)} aria-expanded={hint}>{hint?'Hide hint':'Give me a hint'}</button>{hint&&<p className="experiment-callout">{lesson.check.hint}</p>}{feedback&&<p role="status" className={`feedback ${feedback}`}>{feedback==='correct'?`Correct. ${lesson.check.explanation}`:'Not quite yet. Use the hint or return to the idea, then try again.'}</p>}<p className="sidebar-help">A checkpoint checks this one idea. It is not a claim of full topic mastery.</p></>}
            {step===3&&<><p className="explanation-copy">What changed? Why did it happen? Write it in your own words. Your note will remember this lesson and its visual settings.</p><label htmlFor="reflection" className="sr-only">My understanding</label><textarea id="reflection" className="reflection-input" maxLength={5000} value={draft} onChange={e=>{setDraft(e.target.value);setNoteSaved(false);}} placeholder="I used to think… Now I notice…"/><button className="primary-button" disabled={!draft.trim()||noteSaved} onClick={()=>{actions.saveJourneyNote({lesson:lesson.id,step,values,text:draft.trim()});setNoteSaved(true);}}>Save note & visual</button>{noteSaved&&<p role="status" className="feedback correct">{getLoadWarning()?'Note kept for this visit. Browser storage could not be written; export your data in Settings.':'Saved to your notebook with these visual settings.'} <Link href="/notebook" className="underline">Open notebook</Link></p>}{!saved?.checked&&<p className="sidebar-help">Your note is saved separately from the checkpoint. Return to Check whenever you are ready.</p>}</>}
          </>}
        </section>
      </div>
      <div className="step-footer"><nav className="step-track" aria-label="Lesson steps">{JOURNEY_STEPS.map((label,i)=><button key={label} aria-current={step===i?'step':undefined} onClick={()=>setStep(i)}><span className="step-number" aria-hidden="true">{i===2&&saved?.checked?'✓':i+1}</span>{label}</button>)}</nav>{step<3?<button className="primary-button" onClick={()=>setStep(step+1)}>{['Let’s explore','Try the checkpoint','Write a reflection'][step]}</button>:next?<button className="primary-button" onClick={()=>navigate(next.id)}>Next lesson</button>:<Link href="/paths" className="primary-button">Review your learning path</Link>}</div>
      <div className="lesson-bottom-note"><span>{lesson.prerequisites.length?<>Helpful first: {lesson.prerequisites.map((id,i)=><span key={id}>{i>0?' · ':''}<button className="underline" onClick={()=>navigate(id)}>{journeyLesson(id)?.title}</button></span>)}</>:'No prerequisites. You are in the right place.'}</span><span>Viewed ≠ explored ≠ checkpoint passed</span></div>
    </section>
  </div>;
}
