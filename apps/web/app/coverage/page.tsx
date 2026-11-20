import Link from 'next/link';
import { JOURNEY, ROLE_PATHS, coverageSummary, SIMULATIONS } from '@mcc/curriculum';

export const metadata = { title: 'Learning coverage' };
export default function Coverage() {
  const coverage = coverageSummary();
  return <div className="mx-auto max-w-4xl space-y-6">
    <div className="path-intro"><p className="eyebrow">What you can study today</p><h1>Learning coverage</h1><p>A clear distinction between the compact guided notebook and the larger reference curriculum. These counts come from the actual course data.</p></div>
    <section className="concept-callout"><h2 className="text-xl font-semibold">Guided notebook</h2><p className="mt-3">{JOURNEY.length} authored introductory lessons with a visual, worked example, experiment, checkpoint and reflection. {ROLE_PATHS.length} role paths include their required foundations. This introduces advanced ideas; it does not claim complete coverage of every advanced subject.</p><Link className="primary-button mt-4" href="/">Open the guided notebook</Link></section>
    <section><h2 className="text-xl font-semibold">Reference library</h2><p className="my-3">{coverage.topics.length} mapped topics, {coverage.fullLessonCount} detailed lessons, {SIMULATIONS.length} visual labs and {coverage.chapters.length} university chapter mappings. One detailed lesson may cover several topics.</p>
      <div className="overflow-x-auto rounded-lg border border-line bg-card"><table className="w-full text-sm"><caption className="p-4 text-left text-muted">Reference material available by level. “Lab or practice” means there is no detailed lesson for that topic yet.</caption><thead><tr className="border-b border-line text-left">{['Level','Topics','Detailed lesson','Lab or practice','Not authored'].map(h=><th key={h} scope="col" className="p-3">{h}</th>)}</tr></thead><tbody>{coverage.byLevel.map(level=><tr className="border-b border-line" key={level.level}><th scope="row" className="p-3 text-left"><Link className="underline" href={`/learn?level=${level.level}`}>{level.level}</Link></th><td className="p-3">{level.total}</td><td className="p-3">{level.lesson}</td><td className="p-3">{level.labOrPractice}</td><td className="p-3">{level.none}</td></tr>)}</tbody></table></div>
    </section><p className="text-muted">Progress and notes are saved in your browser. Accounts, cross-device sync and an AI tutor are not included. Use <Link href="/settings" className="underline">Settings</Link> to export a backup.</p>
  </div>;
}
