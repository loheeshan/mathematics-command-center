"use client";
import { useState } from "react";
import { PracticeSession } from "@/components/PracticeSession";

export function ChapterPractice({ skills, chapterId }: { skills: string[]; chapterId: string }) {
  const [open, setOpen] = useState(false);
  if (!open) return <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg" onClick={() => setOpen(true)}>Start {Math.min(8, Math.max(4, skills.length * 2))} questions</button>;
  return <PracticeSession skills={skills} count={Math.min(8, Math.max(4, skills.length * 2))} seedKey={`academy:${chapterId}`} />;
}
