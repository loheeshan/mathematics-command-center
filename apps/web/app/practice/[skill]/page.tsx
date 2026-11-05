import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { practicedSkills, templatesForSkill } from "@mcc/question-engine";
import { topicById, lessonsForTopic } from "@mcc/curriculum";
import { PageHeader } from "@/components/ui";
import { SkillPractice } from "./SkillPractice";

export function generateStaticParams() {
  return practicedSkills().map((skill) => ({ skill }));
}
export async function generateMetadata({ params }: { params: Promise<{ skill: string }> }): Promise<Metadata> {
  const { skill } = await params;
  return { title: `Practice: ${topicById(skill)?.title ?? skill}` };
}

export default async function SkillPage({ params }: { params: Promise<{ skill: string }> }) {
  const { skill } = await params;
  const t = topicById(skill);
  if (!t || templatesForSkill(skill).length === 0) notFound();
  const lesson = lessonsForTopic(skill)[0];
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} kicker={`Practice · Level ${t.level.number}`}>
        {lesson ? <>Need a refresher? <Link href={`/lesson/${lesson.slug}`} className="underline">Open the lesson</Link>.</> : <Link href={`/learn/${skill}`} className="underline">Topic overview</Link>}
      </PageHeader>
      <SkillPractice skill={skill} />
    </div>
  );
}
