export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { fetchDoubanCategoryData } from '@/lib/douban';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') || 'movie') as 'tv' | 'movie';
  const tag = searchParams.get('tag') || '热门';
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const pageStart = parseInt(searchParams.get('pageStart') || '0');

  const result = await fetchDoubanCategoryData(type, tag, type, pageSize, pageStart);

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, max-age=7200, s-maxage=7200',
    },
  });
}
