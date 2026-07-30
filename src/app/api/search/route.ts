export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { DEFAULT_SOURCES } from '@/lib/sources';
import { searchSingleSource } from '@/lib/downstream';
import { SearchResult } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const query = q.trim();

  // 并行搜索所有 MacCMS 资源站
  const searchPromises = DEFAULT_SOURCES.map((source) =>
    searchSingleSource(source, query, 5000)
  );

  const resultsArrays = await Promise.all(searchPromises);
  const allResults: SearchResult[] = resultsArrays.flat();

  return NextResponse.json(
    { results: allResults },
    {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=600',
      },
    }
  );
}
