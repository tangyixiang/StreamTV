'use client';

import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import ScrollableRow from '@/components/ScrollableRow';
import VideoCard from '@/components/VideoCard';
import { DoubanItem } from '@/lib/types';
import Link from 'next/link';
import { ChevronRight, Film, Tv, Sparkles } from 'lucide-react';

export default function HomeClient() {
  const [hotMovies, setHotMovies] = useState<DoubanItem[]>([]);
  const [hotTvShows, setHotTvShows] = useState<DoubanItem[]>([]);
  const [hotVarietyShows, setHotVarietyShows] = useState<DoubanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 并行获取豆瓣热门分类
    const fetchData = async () => {
      try {
        setLoading(true);
        const [moviesRes, tvRes, varietyRes] = await Promise.allSettled([
          fetch('/api/douban?type=movie&tag=热门&pageSize=12').then((res) => res.json()),
          fetch('/api/douban?type=tv&tag=热门&pageSize=12').then((res) => res.json()),
          fetch('/api/douban?type=tv&tag=综艺&pageSize=12').then((res) => res.json()),
        ]);

        if (moviesRes.status === 'fulfilled' && moviesRes.value?.list) {
          setHotMovies(moviesRes.value.list);
        }
        if (tvRes.status === 'fulfilled' && tvRes.value?.list) {
          setHotTvShows(tvRes.value.list);
        }
        if (varietyRes.status === 'fulfilled' && varietyRes.value?.list) {
          setHotVarietyShows(varietyRes.value.list);
        }
      } catch (e) {
        console.error('Failed to load homepage data', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <PageLayout>
      <div className="space-y-10">

        {/* Hot Movies */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">热门电影</h2>
            </div>
            <Link href="/douban?type=movie" className="text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
              查看全部 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ScrollableRow>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="min-w-[110px] w-28 sm:min-w-[160px] sm:w-40 aspect-[2/3] bg-slate-800 animate-pulse rounded-xl flex-shrink-0" />
                ))
              : hotMovies.map((item) => (
                  <div key={item.id} className="min-w-[110px] w-28 sm:min-w-[160px] sm:w-40 flex-shrink-0">
                    <VideoCard
                      id={item.id}
                      title={item.title}
                      poster={item.poster}
                      rate={item.rate}
                      year={item.year}
                      from="douban"
                    />
                  </div>
                ))}
          </ScrollableRow>
        </section>

        {/* Hot TV Shows */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">热门剧集</h2>
            </div>
            <Link href="/douban?type=tv" className="text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
              查看全部 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ScrollableRow>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="min-w-[110px] w-28 sm:min-w-[160px] sm:w-40 aspect-[2/3] bg-slate-800 animate-pulse rounded-xl flex-shrink-0" />
                ))
              : hotTvShows.map((item) => (
                  <div key={item.id} className="min-w-[110px] w-28 sm:min-w-[160px] sm:w-40 flex-shrink-0">
                    <VideoCard
                      id={item.id}
                      title={item.title}
                      poster={item.poster}
                      rate={item.rate}
                      year={item.year}
                      from="douban"
                    />
                  </div>
                ))}
          </ScrollableRow>
        </section>

        {/* Hot Variety Shows */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">热门综艺</h2>
            </div>
          </div>
          <ScrollableRow>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="min-w-[110px] w-28 sm:min-w-[160px] sm:w-40 aspect-[2/3] bg-slate-800 animate-pulse rounded-xl flex-shrink-0" />
                ))
              : hotVarietyShows.map((item) => (
                  <div key={item.id} className="min-w-[110px] w-28 sm:min-w-[160px] sm:w-40 flex-shrink-0">
                    <VideoCard
                      id={item.id}
                      title={item.title}
                      poster={item.poster}
                      rate={item.rate}
                      year={item.year}
                      from="douban"
                    />
                  </div>
                ))}
          </ScrollableRow>
        </section>

      </div>
    </PageLayout>
  );
}
