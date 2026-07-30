'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import VideoCard from '@/components/VideoCard';
import { DoubanItem } from '@/lib/types';

export default function DoubanClient() {
  const searchParams = useSearchParams();
  const currentType = (searchParams.get('type') || 'movie') as 'movie' | 'tv';

  const [type, setType] = useState<'movie' | 'tv'>(currentType);
  const [tag, setTag] = useState<string>('热门');
  const [items, setItems] = useState<DoubanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 监听 URL 中的 type 参数变化，实现点击 Header "电影"/"电视剧" 秒级响应
  useEffect(() => {
    if (currentType && currentType !== type) {
      setType(currentType);
    }
  }, [currentType]);

  const categoryTags = [
    '热门', '最新', '经典', '可播放', '豆瓣高分', '冷门佳片',
    '华语', '欧美', '韩国', '日本', '动作', '喜剧', '爱情', '科幻', '悬疑', '动画'
  ];

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/douban?type=${type}&tag=${encodeURIComponent(tag)}&pageSize=30`);
        const data = await res.json();
        if (data && data.list) {
          setItems(data.list);
        }
      } catch (e) {
        console.error('Failed to fetch Douban category', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [type, tag]);

  return (
    <PageLayout>
      <div className="space-y-6">
        
        {/* Category Controls & Tags Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Filter Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryTags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  tag === t
                    ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 shadow-sm font-semibold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 border border-slate-700/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Type Toggle */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto flex-shrink-0">
            <button
              onClick={() => setType('movie')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'movie' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              电影
            </button>
            <button
              onClick={() => setType('tv')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'tv' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              电视剧
            </button>
          </div>

        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-slate-800 animate-pulse rounded-xl" />
              ))
            : items.map((item) => (
                <VideoCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  poster={item.poster}
                  rate={item.rate}
                  year={item.year}
                  from="douban"
                />
              ))}
        </div>

        {!loading && items.length === 0 && (
          <div className="text-center py-20 text-slate-400 text-sm">
            暂无匹配数据
          </div>
        )}

      </div>
    </PageLayout>
  );
}
