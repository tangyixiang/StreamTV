import type { Metadata } from 'next';
import AuthGuard from '@/components/AuthGuard';
import './globals.css';

export const metadata: Metadata = {
  title: 'StreamTV - 影视聚合',
  description: '免费海量在线影视、电影、电视剧、综艺、动漫聚合搜索与播放平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="bg-slate-900 text-slate-100 min-h-screen antialiased">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
