export const runtime = 'edge';

import { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <SearchClient />
    </Suspense>
  );
}
