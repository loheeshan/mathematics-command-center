"use client";
import Link from 'next/link';
import { ROLE_PATHS } from '@mcc/curriculum';
import { useStore, actions } from '@/lib/store';
export function LearningPaths() {
  const journey=useStore(s=>s.journey);
  return <><div className="path-intro"><p className="eyebrow">One foundation. Many directions.</p><h1>Math for where you want to go.</h1><p>Start from zero, or revisit the ideas you need. Every path includes its foundations. Switching paths keeps your notes and progress, and no lesson is locked.</p></div><div className="path-grid">{ROLE_PATHS.map((r,i)=>{
    const checked=r.lessons.filter(id=>journey.lessons[id]?.checked).length;
    const resume=r.lessons.find(id=>!journey.lessons[id]?.checked)??r.lessons[0];
    return <article className="path-card" key={r.id}><span className="eyebrow">{r.lessons.length} guided lessons · {checked} checked</span><div aria-hidden="true" style={{fontSize:32,color:'var(--accent)',fontFamily:'Georgia'}}>{['∞','∑','{ }','ƒ(x)','∩','∇'][i]}</div><h2>{r.title}</h2><p>{r.description}</p><p>{r.focus}</p><Link className="primary-button" onClick={()=>actions.setJourneyRole(r.id)} href={`/?lesson=${resume}&path=${r.id}`}>{checked?'Continue this path':'Start this path'}</Link></article>;
  })}</div><div className="experiment-callout"><strong>Go deeper when you are ready</strong>These lessons introduce advanced ideas through small, worked models. For longer lessons, more exercises and university mappings, use the <Link href="/learn" className="underline">full reference library</Link>. A passed checkpoint shows understanding of that question, not mastery of an entire subject.</div></>;
}
