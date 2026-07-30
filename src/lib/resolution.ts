import Hls from 'hls.js';

export interface ResolutionInfo {
  quality: string; // "4K" | "2K" | "1080p" | "720p" | "480p" | "SD"
  pingTime: number;
}

/**
 * 实时通过离屏 Hls.js 加载视频头元数据，读取真实视频物理宽度 (videoWidth)
 */
export async function detectVideoResolution(
  url: string,
  timeoutMs = 4000
): Promise<ResolutionInfo> {
  if (typeof window === 'undefined' || !url) {
    return { quality: '1080p', pingTime: 100 };
  }

  // 静态解析备用
  const staticQuality = parseQualityFromUrl(url);

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';
    const startTime = performance.now();

    if (!Hls.isSupported()) {
      resolve({ quality: staticQuality, pingTime: 120 });
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });

    const timer = setTimeout(() => {
      try {
        hls.destroy();
        video.remove();
      } catch {}
      resolve({
        quality: staticQuality,
        pingTime: Math.round(performance.now() - startTime),
      });
    }, timeoutMs);

    hls.on(Hls.Events.ERROR, () => {
      clearTimeout(timer);
      try {
        hls.destroy();
        video.remove();
      } catch {}
      resolve({
        quality: staticQuality,
        pingTime: Math.round(performance.now() - startTime),
      });
    });

    video.onloadedmetadata = () => {
      clearTimeout(timer);
      const pingTime = Math.round(performance.now() - startTime);
      const w = video.videoWidth;
      let quality = staticQuality;

      if (w >= 3840) quality = '4K';
      else if (w >= 2560) quality = '2K';
      else if (w >= 1800) quality = '1080p';
      else if (w >= 1200) quality = '720p';
      else if (w >= 800) quality = '480p';
      else if (w > 0) quality = 'SD';

      try {
        hls.destroy();
        video.remove();
      } catch {}

      resolve({ quality, pingTime });
    };

    try {
      hls.loadSource(url);
      hls.attachMedia(video);
    } catch {
      clearTimeout(timer);
      resolve({ quality: staticQuality, pingTime: 120 });
    }
  });
}

function parseQualityFromUrl(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('4k') || u.includes('2160')) return '4K';
  if (u.includes('2k') || u.includes('1440')) return '2K';
  if (u.includes('720p') || u.includes('720')) return '720p';
  if (u.includes('480p') || u.includes('480')) return '480p';
  return '1080p';
}
