import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS, lessonBySlug, topicById } from "@mcc/curriculum";
import { LessonPlayer } from "@/components/LessonPlayer";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: lessonBySlug(slug)?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessonBySlug(slug);
  if (!lesson) notFound();
  const topic = topicById(lesson.topic);
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-2 text-sm text-muted">
        <Link href="/learn" className="underline">Master Core</Link> › <Link href={`/learn#level-${lesson.level}`} className="underline">Level {lesson.level}</Link> › <Link href={`/learn/${lesson.topic}`} className="underline">{topic?.title}</Link>
      </nav>
      <h1 className="text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
      <p className="mb-6 mt-1 max-w-3xl text-muted">{lesson.summary}</p>
      <LessonPlayer lesson={lesson} />
    </div>
  );
}
