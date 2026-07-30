'use client';

import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

interface PlayerProps {
  url: string;
  onEnded?: () => void;
}

export default function Player({ url, onEnded }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<Artplayer | null>(null);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    if (artRef.current) {
      artRef.current.destroy(false);
    }

    const art = new Artplayer({
      container: containerRef.current,
      url: url,
      type: 'm3u8',
      customType: {
        m3u8: function (video: HTMLVideoElement, url: string, art: Artplayer) {
          if (Hls.isSupported()) {
            if ((art as any).hls) (art as any).hls.destroy();
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            (art as any).hls = hls;
            art.on('destroy', () => hls.destroy());
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          } else {
            art.notice.show = 'Unsupported video format';
          }
        },
      },
      autoplay: true,
      autoMini: true,
      setting: true,
      pip: true,
      fullscreen: true,
      fullscreenWeb: true,
      playbackRate: true,
      aspectRatio: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoSize: false,
      airplay: true,
      theme: '#3b82f6',
    });

    artRef.current = art;

    if (onEnded) {
      art.on('video:ended', onEnded);
    }

    return () => {
      if (artRef.current) {
        artRef.current.destroy(false);
        artRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
