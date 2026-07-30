import { ApiSource, SearchResult } from './types';
import { cleanHtmlTags } from './utils';

interface ApiSearchItem {
  vod_id: string;
  vod_name: string;
  vod_pic: string;
  vod_remarks?: string;
  vod_play_url?: string;
  vod_class?: string;
  vod_year?: string;
  vod_content?: string;
  vod_douban_id?: number;
  type_name?: string;
}

/**
 * 智能提取精确分辨率标识（如 1080p, 720p, 4K, 2K）
 */
export function extractResolutionQuality(item: ApiSearchItem): string {
  const text = `${item.vod_remarks || ''} ${item.vod_name || ''} ${item.vod_play_url || ''}`.toLowerCase();

  if (text.includes('4k') || text.includes('2160p') || text.includes('uhd')) return '4K';
  if (text.includes('2k') || text.includes('1440p')) return '2K';
  if (text.includes('720p') || text.includes('720')) return '720p';
  if (text.includes('480p') || text.includes('480')) return '480p';
  if (text.includes('sd') || text.includes('标清')) return 'SD';
  if (text.includes('1080p') || text.includes('1080') || text.includes('bd') || text.includes('蓝光')) return '1080p';

  return '1080p';
}

/**
 * 单资源站 MacCMS API 搜索逻辑
 */
export async function searchSingleSource(
  apiSite: ApiSource,
  query: string,
  timeoutMs = 5000
): Promise<SearchResult[]> {
  const url = `${apiSite.api}?ac=videolist&wd=${encodeURIComponent(query.trim())}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data || !data.list || !Array.isArray(data.list)) return [];

    return data.list.map((item: ApiSearchItem) => {
      let episodes: string[] = [];
      let titles: string[] = [];

      if (item.vod_play_url) {
        const vod_play_url_array = item.vod_play_url.split('$$$');
        vod_play_url_array.forEach((urlGroup: string) => {
          const matchEpisodes: string[] = [];
          const matchTitles: string[] = [];
          const title_url_array = urlGroup.split('#');
          title_url_array.forEach((title_url: string) => {
            const episode_title_url = title_url.split('$');
            if (
              episode_title_url.length === 2 &&
              episode_title_url[1].endsWith('.m3u8')
            ) {
              matchTitles.push(episode_title_url[0]);
              matchEpisodes.push(episode_title_url[1]);
            }
          });
          if (matchEpisodes.length > episodes.length) {
            episodes = matchEpisodes;
            titles = matchTitles;
          }
        });
      }

      return {
        id: item.vod_id.toString(),
        title: item.vod_name.trim().replace(/\s+/g, ' '),
        poster: item.vod_pic,
        episodes,
        episodes_titles: titles,
        source: apiSite.key,
        source_name: apiSite.name,
        class: item.vod_class,
        year: item.vod_year
          ? item.vod_year.match(/\d{4}/)?.[0] || ''
          : 'unknown',
        desc: cleanHtmlTags(item.vod_content || ''),
        type_name: item.type_name,
        douban_id: item.vod_douban_id,
        remarks: item.vod_remarks || '',
        quality: extractResolutionQuality(item),
      };
    }).filter((res: SearchResult) => res.episodes.length > 0);
  } catch (error) {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 获取单个视频详情
 */
export async function fetchVideoDetail(
  apiSite: ApiSource,
  id: string,
  timeoutMs = 5000
): Promise<SearchResult | null> {
  const url = `${apiSite.api}?ac=videolist&ids=${id}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !data.list || !Array.isArray(data.list) || data.list.length === 0) return null;

    const item = data.list[0];
    let episodes: string[] = [];
    let titles: string[] = [];

    if (item.vod_play_url) {
      const vod_play_url_array = item.vod_play_url.split('$$$');
      vod_play_url_array.forEach((urlGroup: string) => {
        const matchEpisodes: string[] = [];
        const matchTitles: string[] = [];
        const title_url_array = urlGroup.split('#');
        title_url_array.forEach((title_url: string) => {
          const episode_title_url = title_url.split('$');
          if (
            episode_title_url.length === 2 &&
            episode_title_url[1].endsWith('.m3u8')
          ) {
            matchTitles.push(episode_title_url[0]);
            matchEpisodes.push(episode_title_url[1]);
          }
        });
        if (matchEpisodes.length > episodes.length) {
          episodes = matchEpisodes;
          titles = matchTitles;
        }
      });
    }

    return {
      id: item.vod_id.toString(),
      title: item.vod_name.trim().replace(/\s+/g, ' '),
      poster: item.vod_pic,
      episodes,
      episodes_titles: titles,
      source: apiSite.key,
      source_name: apiSite.name,
      class: item.vod_class,
      year: item.vod_year
        ? item.vod_year.match(/\d{4}/)?.[0] || ''
        : 'unknown',
      desc: cleanHtmlTags(item.vod_content || ''),
      type_name: item.type_name,
      douban_id: item.vod_douban_id,
      remarks: item.vod_remarks || '',
      quality: extractResolutionQuality(item),
    };
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
