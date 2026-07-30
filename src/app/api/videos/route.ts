export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { DEFAULT_SOURCES } from '@/lib/sources';
import { searchSingleSource } from '@/lib/downstream';
import { SearchResult } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title || !title.trim()) {
    return NextResponse.json({ sources: [] });
  }

  const queryTitle = title.trim();

  // 并行获取所有资源站对此影片匹配的线路
  const searchPromises = DEFAULT_SOURCES.map(async (source) => {
    const startTime = Date.now();
    try {
      const results = await searchSingleSource(source, queryTitle, 5000);
      const latency = Date.now() - startTime;

      // 寻找名称高度相似的结果
      const match = results.find(
        (r) =>
          r.title.replaceAll(/\s+/g, '') === queryTitle.replaceAll(/\s+/g, '') ||
          r.title.includes(queryTitle) ||
          queryTitle.includes(r.title)
      );

      if (match) {
        return {
          source: source.key,
          source_name: source.name,
          latency,
          quality: match.quality || '1080p',
          remarks: match.remarks || '',
          video: match,
        };
      }
    } catch {
      // ignore
    }
    return null;
  });

  const matchedSources = (await Promise.all(searchPromises)).filter(Boolean);

  return NextResponse.json(
    { sources: matchedSources },
    {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=600',
      },
    }
  );
}
