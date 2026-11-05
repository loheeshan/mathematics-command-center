import Link from "next/link";
import { LESSONS, SIMULATIONS, academy, coverageSummary } from "@mcc/curriculum";
import { TEMPLATES } from "@mcc/question-engine";
import { SimEmbed } from "@/components/SimEmbed";
import { ButtonLink } from "@/components/ui";

const ENTRY = [
  { href: "/start?mode=zero", title: "Start from zero", text: "Begin with numbers, the number line and the four operations. No assumed knowledge." },
  { href: "/start?mode=find-level", title: "Find my level", text: "A short, optional check that suggests where to begin. Nothing is locked." },
  { href: "/academy", title: "Follow my university", text: "First Year S1/S2 and Second Year S1 lectures, mapped page by page with bridges." },
  { href: "/learn", title: "Explore a topic", text: "The full Master Core map from Level 0 to Level 10." },
  { href: "/learn?level=9", title: "Math for AI & Data Science", text: "Gradients, probability, linear algebra and optimisation behind modern ML." },
];

export default function Home() {
  const cov = coverageSummary();
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Mathematics Command Center</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-5xl">See it. Move it. Calculate it. Master it.</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            From adding fractions to gradient descent — every idea explained in plain language, shown visually, explored with a working simulation, calculated by hand, and practised until it sticks. Built for learners who never took advanced maths at school.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/start">Get started</ButtonLink>
            <ButtonLink href="/lesson/fractions-adding-unlike" variant="ghost">Try a full lesson</ButtonLink>
          </div>
          <p className="mt-4 text-sm text-muted">
            Built today: {cov.lessonCount} full 12-stage lessons · {SIMULATIONS.length} working labs · {TEMPLATES.length} seeded question templates · {academy.chapters.length} university chapters mapped. <Link href="/coverage" className="underline">See exactly what is and isn’t built →</Link>
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="mb-2 text-sm text-muted">Live demo — why is ½ + ⅓ not 2/5? Press <strong>Re-cut</strong>.</p>
          <SimEmbed slug="fraction-kitchen" preset="half-plus-third" />
        </div>
      </section>

      <section aria-labelledby="ways">
        <h2 id="ways" className="text-2xl font-bold">Choose how to begin</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {ENTRY.map((e) => (
            <li key={e.title}>
              <Link href={e.href} className="block h-full rounded-xl border border-line bg-card p-4 no-underline hover:border-accent">
                <div className="font-semibold">{e.title}</div>
                <p className="mt-1 text-sm text-muted">{e.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how" className="grid gap-4 md:grid-cols-3">
        <h2 id="how" className="sr-only">How MCC teaches</h2>
        {[
          ["Two paths, one map", "The Master Core teaches everything from counting to AI maths. The Academy Path follows your lecture PDFs in order and links every gap to a beginner bridge — and back."],
          ["Real practice", "Questions are generated from seeds, checked for mathematical equivalence (never string matching), with three progressive hints and feedback on common misconceptions."],
          ["Honest about status", "Every topic shows whether it has a full lesson, a lab, practice, or nothing yet. Exact and approximate answers are labelled."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-line bg-card p-5">
            <h3 className="font-semibold">{t}</h3>
            <p className="mt-2 text-sm text-muted">{d}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold">Lessons available now</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LESSONS.map((l) => (
            <li key={l.slug}>
              <Link href={`/lesson/${l.slug}`} className="block h-full rounded-xl border border-line bg-card p-4 no-underline hover:border-accent">
                <div className="text-xs text-muted">Level {l.level}</div>
                <div className="font-semibold">{l.title}</div>
                <p className="mt-1 text-sm text-muted">{l.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
