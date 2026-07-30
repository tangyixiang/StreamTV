export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { DEFAULT_SOURCES } from '@/lib/sources';
import { fetchVideoDetail } from '@/lib/downstream';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourceKey = searchParams.get('source');
  const id = searchParams.get('id');

  if (!sourceKey || !id) {
    return NextResponse.json({ error: 'Missing source or id' }, { status: 400 });
  }

  const source = DEFAULT_SOURCES.find((s) => s.key === sourceKey);
  if (!source) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  const detail = await fetchVideoDetail(source, id);
  if (!detail) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  return NextResponse.json(detail, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
