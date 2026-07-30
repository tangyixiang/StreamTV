'use client';

import Link from 'next/link';
import { processImageUrl } from '@/lib/utils';
import { Play } from 'lucide-react';

interface VideoCardProps {
  id: string;
  source?: string;
  title: string;
  poster?: string;
  rate?: string;
  year?: string;
  source_name?: string;
  episodes?: number;
  from?: 'douban' | 'search';
}

export default function VideoCard({
  id,
  source = 'jisu',
  title,
  poster = '',
  rate,
  year,
  source_name,
  from = 'douban',
}: VideoCardProps) {
  const imageUrl = processImageUrl(poster);

  const href =
    from === 'douban'
      ? `/search?q=${encodeURIComponent(title)}`
      : `/play?source=${source}&id=${id}`;

  return (
    <Link href={href} className="group block relative w-full">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-slate-800/80 border border-slate-700/50 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:border-blue-500/50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
            暂无封面
          </div>
        )}

        {/* Hover Play Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-10 h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Score Badge */}
        {rate && rate !== '0.0' && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-amber-500/90 text-slate-950 font-extrabold text-[10px] shadow-sm backdrop-blur-sm">
            {rate}
          </div>
        )}

        {/* Source Badge */}
        {source_name && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-blue-400 font-semibold text-[10px] border border-slate-700/80 backdrop-blur-sm">
            {source_name}
          </div>
        )}
      </div>

      {/* Title & Metadata */}
      <div className="mt-2.5 px-0.5 space-y-0.5">
        <h3 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        {year && (
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{year}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
