"use client";
import Link from 'next/link';
import { journeyLesson } from '@mcc/curriculum';
import { actions, useStore } from '@/lib/store';
import { JOURNEY_STEPS } from './LearningNotebook';
export function SavedVisualNotes() {
  const notes=useStore(s=>s.journey.notes);
  return <section className="saved-notes" aria-label="Saved visual notes"><h2>Your visual field notes</h2><p className="text-muted">Capture an idea in a guided lesson. Reopen a note to restore its exact visual settings. Notes and progress are included in your Settings export.</p>{!notes.length?<div className="experiment-callout">Your notebook starts with your own words. <Link href="/" className="underline">Open a lesson</Link>, explore the visual, then choose Reflect.</div>:[...notes].reverse().map(note=>{
    const l=journeyLesson(note.lesson);
    return <article className="saved-note" key={note.id}><h3 className="font-semibold">{l?.title??note.lesson}</h3><p className="note-meta">{JOURNEY_STEPS[note.step]} · {new Date(note.at).toLocaleDateString()} · {l?.params.map((p,i)=>`${p.label}: ${note.values[i]}`).join(' / ')}</p><p>{note.text}</p><div className="flex flex-wrap gap-3"><Link className="primary-button" href={`/?lesson=${encodeURIComponent(note.lesson)}&step=${note.step}&a=${note.values[0]}&b=${note.values[1]}`}>Reopen this visual</Link><button className="quiet-button" onClick={()=>actions.deleteJourneyNote(note.id)}>Delete note</button></div></article>;
  })}</section>;
}
