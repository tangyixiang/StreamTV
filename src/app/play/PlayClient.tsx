'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import Player from '@/components/Player';
import { SearchResult } from '@/lib/types';
import { detectVideoResolution } from '@/lib/resolution';
import { List, Info, Loader2, Zap, Server, Film, CheckCircle2 } from 'lucide-react';

interface SourceOption {
  source: string;
  source_name: string;
  latency: number;
  quality: string;
  remarks?: string;
  video: SearchResult;
}

export default function PlayClient() {
  const searchParams = useSearchParams();
  const initialSource = searchParams.get('source') || 'jisu';
  const initialId = searchParams.get('id') || '';
  const initialTitle = searchParams.get('title') || '';

  const [sources, setSources] = useState<SourceOption[]>([]);
  const [activeSourceIndex, setActiveSourceIndex] = useState<number>(0);
  const [currentEpIndex, setCurrentEpIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadVideoAndSources = async () => {
      try {
        setLoading(true);

        // 1. 先尝试直接拉取当前指定 source 和 id 的详情
        let currentDetail: SearchResult | null = null;
        if (initialSource && initialId) {
          const detailRes = await fetch(`/api/detail?source=${initialSource}&id=${initialId}`);
          if (detailRes.ok) {
            currentDetail = await detailRes.json();
          }
        }

        const videoTitle = initialTitle || currentDetail?.title || '';

        // 2. 拉取所有线路列表并测速
        if (videoTitle) {
          const sourcesRes = await fetch(`/api/videos?title=${encodeURIComponent(videoTitle)}`);
          if (sourcesRes.ok) {
            const data = await sourcesRes.json();
            const fetchedSources: SourceOption[] = data.sources || [];

            if (fetchedSources.length > 0) {
              // 按延迟排序升序
              fetchedSources.sort((a, b) => a.latency - b.latency);
              setSources(fetchedSources);

              const matchedIdx = fetchedSources.findIndex((s) => s.source === initialSource);
              setActiveSourceIndex(matchedIdx >= 0 ? matchedIdx : 0);
              setLoading(false);

              // 客户端离屏探测真实视频像素分辨率 (videoWidth -> 1080p / 720p / 4K)
              fetchedSources.forEach(async (src, idx) => {
                if (src.video.episodes[0]) {
                  const res = await detectVideoResolution(src.video.episodes[0]);
                  setSources((prev) =>
                    prev.map((s, i) =>
                      i === idx
                        ? { ...s, quality: res.quality, latency: res.pingTime || s.latency }
                        : s
                    )
                  );
                }
              });

              return;
            }
          }
        }

        // 兜底单线路 fallback
        if (currentDetail) {
          const initialOpt = {
            source: currentDetail.source,
            source_name: currentDetail.source_name,
            latency: 50,
            quality: currentDetail.quality || '1080p',
            remarks: currentDetail.remarks || '',
            video: currentDetail,
          };
          setSources([initialOpt]);
          setActiveSourceIndex(0);
          setLoading(false);

          if (currentDetail.episodes[0]) {
            detectVideoResolution(currentDetail.episodes[0]).then((res) => {
              setSources([{ ...initialOpt, quality: res.quality, latency: res.pingTime }]);
            });
          }
        }
      } catch (e) {
        console.error('Failed to load video sources', e);
      } flex: {
        setLoading(false);
      }
    };

    loadVideoAndSources();
  }, [initialSource, initialId, initialTitle]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-sm text-slate-400">正在智能检测各线路物理分辨率 (1080p/720p/4K) 与响应速度...</p>
        </div>
      </PageLayout>
    );
  }

  const currentSourceOption = sources[activeSourceIndex];
  const currentVideo = currentSourceOption?.video;

  if (!currentVideo || currentVideo.episodes.length === 0) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
          <p className="text-base text-slate-300 font-semibold">视频不存在或已被下架</p>
          <a href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold">
            返回首页
          </a>
        </div>
      </PageLayout>
    );
  }

  const currentM3u8Url = currentVideo.episodes[currentEpIndex];

  return (
    <PageLayout>
      <div className="space-y-6">
        
        {/* Two-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Player & Video Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ArtPlayer Container */}
            <Player
              url={currentM3u8Url}
              onEnded={() => {
                if (currentEpIndex + 1 < currentVideo.episodes.length) {
                  setCurrentEpIndex(currentEpIndex + 1);
                }
              }}
            />

            {/* Video Header Meta */}
            <div className="glass-card p-6 rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-extrabold text-white tracking-tight">{currentVideo.title}</h1>
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                      {currentSourceOption.source_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    当前播放：<span className="text-blue-400 font-semibold">第 {currentEpIndex + 1} 集</span> / 共 {currentVideo.episodes.length} 集
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {currentSourceOption.latency}ms 延迟
                  </span>
                  
                  {/* Real Resolution Badge (1080p / 720p / 4K) */}
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-extrabold shadow-sm font-mono">
                    {currentSourceOption.quality}
                  </span>

                  {currentSourceOption.remarks && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 text-xs font-medium">
                      {currentSourceOption.remarks}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {currentVideo.desc && (
                <div className="pt-3 border-t border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    剧情简介
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {currentVideo.desc}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Line Selection & Episode Selector */}
          <div className="space-y-6">
            
            {/* Line Selection */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-bold text-white">线路与分辨率选择</h2>
                </div>
                <span className="text-[11px] text-slate-400">共 {sources.length} 条有效线路</span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {sources.map((item, index) => {
                  const isActive = index === activeSourceIndex;
                  return (
                    <button
                      key={item.source}
                      onClick={() => {
                        setActiveSourceIndex(index);
                        setCurrentEpIndex(0);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all border ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-sm'
                          : 'bg-slate-800/60 text-slate-300 border-slate-700/40 hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        ) : (
                          <Film className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        )}
                        <span className="font-semibold">{item.source_name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        {/* Precise Resolution Badge (1080p / 720p / 4K) */}
                        <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 font-extrabold border border-purple-800/50 font-mono">
                          {item.quality}
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                            item.latency < 100
                              ? 'text-emerald-400 bg-emerald-950/60'
                              : item.latency < 300
                              ? 'text-amber-400 bg-amber-950/60'
                              : 'text-rose-400 bg-rose-950/60'
                          }`}
                        >
                          {item.latency}ms
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Episode Grid */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-bold text-white">剧集选择</h2>
                </div>
                <span className="text-[11px] text-slate-400">共 {currentVideo.episodes.length} 集</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                {currentVideo.episodes.map((_, index) => {
                  const isActive = index === currentEpIndex;
                  const epTitle = currentVideo.episodes_titles?.[index] || `第 ${index + 1} 集`;
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentEpIndex(index)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all text-center truncate ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50 scale-105'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/40'
                      }`}
                      title={epTitle}
                    >
                      {epTitle}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </PageLayout>
  );
}
