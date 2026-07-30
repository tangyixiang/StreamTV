import { Suspense } from 'react';
import DoubanClient from './DoubanClient';

export default function DoubanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <DoubanClient />
    </Suspense>
  );
}
