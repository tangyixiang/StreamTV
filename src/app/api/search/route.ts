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

  // 对搜索结果进行去重合并
  const uniqueResultsMap = new Map<string, SearchResult>();

  allResults.forEach((item) => {
    // 归一化标题：转小写、去除所有空白字符
    const normalizedTitle = item.title.replace(/\s+/g, '').toLowerCase();
    // 组合年份作为唯一键，防止同名不同年的影视剧被误合并
    const key = `${normalizedTitle}-${item.year || 'unknown'}`;
    
    if (uniqueResultsMap.has(key)) {
      const existing = uniqueResultsMap.get(key)!;
      // 如果新发现的资源集数更多，或者集数一样但更新（虽然暂时没更新时间字段），我们优先保留集数更多的源
      if (item.episodes.length > existing.episodes.length) {
        uniqueResultsMap.set(key, item);
      }
    } else {
      uniqueResultsMap.set(key, item);
    }
  });

  const mergedResults = Array.from(uniqueResultsMap.values());

  return NextResponse.json(
    { results: mergedResults },
    {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=600',
      },
    }
  );
}
