'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import VideoCard from '@/components/VideoCard';
import { SearchResult } from '@/lib/types';
import { Search, Loader2 } from 'lucide-react';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const doSearch = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data && data.results) {
          setResults(data.results);
        }
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setLoading(false);
      }
    };

    doSearch();
  }, [query]);

  return (
    <PageLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">
                搜索结果：<span className="text-blue-400">“{query}”</span>
              </h1>
              <p className="text-xs text-slate-400">已聚合极速、量子、非凡、光速等高清 MacCMS 资源站结果</p>
            </div>
          </div>
          {loading && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-slate-800 animate-pulse rounded-xl" />
              ))
            : results.map((item) => (
                <VideoCard
                  key={`${item.source}+${item.id}`}
                  id={item.id}
                  source={item.source}
                  title={item.title}
                  poster={item.poster}
                  year={item.year}
                  source_name={item.source_name}
                  episodes={item.episodes.length}
                  from="search"
                />
              ))}
        </div>

        {!loading && results.length === 0 && query && (
          <div className="text-center py-24 space-y-3">
            <div className="text-slate-400 text-base font-semibold">未找到匹配的影片结果</div>
            <p className="text-slate-500 text-xs">请尝试更换关键词，或缩短影片名称搜索</p>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
