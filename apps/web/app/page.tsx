import { Suspense } from 'react';
import { LearningNotebook } from '@/components/LearningNotebook';

export default function Home() {
  return <Suspense fallback={<p className="p-8">Opening your mathematics notebook…</p>}><LearningNotebook /></Suspense>;
}
