export const runtime = 'edge';

import { Suspense } from 'react';
import PlayClient from './PlayClient';

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <PlayClient />
    </Suspense>
  );
}
