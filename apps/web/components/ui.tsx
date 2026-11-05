import Link from "next/link";
import type { ReactNode } from "react";
import type { MasteryLevel } from "@mcc/question-engine";
import type { TopicStatus } from "@mcc/curriculum";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-card p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function PageHeader({ title, kicker, children }: { title: string; kicker?: string; children?: ReactNode }) {
  return (
    <header className="mb-6">
      {kicker && <p className="text-sm font-medium uppercase tracking-wider text-accent">{kicker}</p>}
      <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h1>
      {children && <div className="mt-2 max-w-3xl text-muted">{children}</div>}
    </header>
  );
}

const MASTERY: Record<MasteryLevel, { label: string; icon: string; cls: string }> = {
  "not-started": { label: "Not started", icon: "○", cls: "border-line text-muted" },
  learning: { label: "Learning", icon: "◔", cls: "border-info text-info" },
  practising: { label: "Practising", icon: "◑", cls: "border-warn text-warn" },
  mastered: { label: "Mastered", icon: "●", cls: "border-ok text-ok" },
  "review-needed": { label: "Review due", icon: "↻", cls: "border-bad text-bad" },
};
export function MasteryBadge({ level }: { level: MasteryLevel }) {
  const m = MASTERY[level];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${m.cls}`}>
      <span aria-hidden>{m.icon}</span>
      {m.label}
    </span>
  );
}

const STATUS: Record<TopicStatus, { label: string; icon: string; cls: string }> = {
  lesson: { label: "Lesson", icon: "■", cls: "border-ok text-ok" },
  "lab-and-practice": { label: "Lab + practice", icon: "◧", cls: "border-info text-info" },
  "lab-only": { label: "Lab only", icon: "◫", cls: "border-info text-info" },
  "practice-only": { label: "Practice only", icon: "◫", cls: "border-warn text-warn" },
  "not-yet-authored": { label: "Not yet authored", icon: "□", cls: "border-line text-muted" },
};
export function StatusBadge({ status }: { status: TopicStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${s.cls}`}>
      <span aria-hidden>{s.icon}</span>
      {s.label}
    </span>
  );
}

const ACADEMY: Record<"implemented" | "partial" | "missing", { icon: string; cls: string }> = {
  implemented: { icon: "■", cls: "border-ok text-ok" },
  partial: { icon: "◧", cls: "border-warn text-warn" },
  missing: { icon: "□", cls: "border-line text-muted" },
};
export function AcademyBadge({ status }: { status: "implemented" | "partial" | "missing" }) {
  const s = ACADEMY[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${s.cls}`}>
      <span aria-hidden>{s.icon}</span>
      {status}
    </span>
  );
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "ghost" }) {
  return (
    <Link href={href} className={variant === "primary" ? "inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg no-underline" : "inline-block rounded-lg border border-line px-4 py-2 no-underline"}>
      {children}
    </Link>
  );
}
