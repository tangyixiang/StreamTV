import { DoubanItem, DoubanResult } from './types';

/**
 * 通用豆瓣 API 抓取函数
 */
export async function fetchDoubanCategoryData(
  kind: 'tv' | 'movie',
  category: string,
  type: string,
  pageLimit = 20,
  pageStart = 0
): Promise<DoubanResult> {
  const target = `https://movie.douban.com/j/search_subjects?type=${kind}&tag=${encodeURIComponent(
    category
  )}&sort=recommend&page_limit=${pageLimit}&page_start=${pageStart}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(target, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        Referer: 'https://movie.douban.com/',
        Accept: 'application/json, text/plain, */*',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { code: response.status, message: '请求失败', list: [] };
    }

    const data = await response.json();
    const list: DoubanItem[] = (data.subjects || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      poster: item.cover,
      rate: item.rate,
      year: '',
    }));

    return { code: 200, message: '获取成功', list };
  } catch (error) {
    clearTimeout(timeoutId);
    return { code: 500, message: '请求超时或失败', list: [] };
  }
}
