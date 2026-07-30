import he from 'he';

/**
 * 处理豆瓣图片代理（自带 SSR 安全判断）
 */
export function processImageUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;

  // 仅处理豆瓣图片代理
  if (!originalUrl.includes('doubanio.com')) {
    return originalUrl;
  }

  // 默认使用 cmliussss-cdn-tencent 高速镜像源
  return originalUrl.replace(
    /img\d+\.doubanio\.com/g,
    'img.doubanio.cmliussss.net'
  );
}

/**
 * 清理 HTML 标签
 */
export function cleanHtmlTags(text: string): string {
  if (!text) return '';

  const cleanedText = text
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/^\n+|\n+$/g, '')
    .trim();

  return he.decode(cleanedText);
}

/**
 * 格式化播放时间为 MM:SS 或 HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * 安全的带超时的 fetch JSON 方法，使用 Promise.race 保证绝对不会挂起
 */
export async function fetchJsonWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<any> {
  const controller = new AbortController();
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error(`Timeout of ${timeoutMs}ms exceeded`));
    }, timeoutMs);
  });

  const fetchPromise = fetch(url, { ...options, signal: controller.signal }).then(async (res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  });

  return Promise.race([fetchPromise, timeoutPromise]);
}

