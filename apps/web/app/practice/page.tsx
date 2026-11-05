import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { PracticeHub } from "./PracticeHub";

export const metadata: Metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <div>
      <PageHeader title="Practice" kicker="Seeded, checked, never string-matched">
        Pick a skill, or let MCC build a mixed review from what’s due. Each set uses fresh numbers.
      </PageHeader>
      <PracticeHub />
    </div>
  );
}
