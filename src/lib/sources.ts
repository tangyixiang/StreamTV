import { ApiSource } from './types';

export const DEFAULT_SOURCES: ApiSource[] = [
  {
    key: 'jisu',
    name: '极速资源',
    api: 'https://jszyapi.com/api.php/provide/vod/at/json',
  },
  {
    key: 'liangzi',
    name: '量子资源',
    api: 'https://cj.lziapi.com/api.php/provide/vod/at/json',
  },
  {
    key: 'ffzy',
    name: '非凡资源',
    api: 'https://cj.ffzyapi.com/api.php/provide/vod/at/json',
  },
  {
    key: 'guangsu',
    name: '光速资源',
    api: 'https://api.guangsuapi.com/api.php/provide/vod/at/json',
  },
  {
    key: 'suoni',
    name: '索尼资源',
    api: 'https://suoniapi.com/api.php/provide/vod/at/json',
  },
  {
    key: 'bfzy',
    name: '暴风资源',
    api: 'https://bfzyapi.com/api.php/provide/vod/at/json',
  },
  {
    key: 'hnzy',
    name: '红牛资源',
    api: 'https://www.hongniuzy2.com/api.php/provide/vod/at/json',
  },
];
