'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Search, Film, Tv } from 'lucide-react';

function NavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type') || 'movie';

  const navLinks = [
    { href: '/', label: '首页', icon: Film, key: 'home' },
    { href: '/douban?type=movie', label: '电影', icon: Film, key: 'movie' },
    { href: '/douban?type=tv', label: '电视剧', icon: Tv, key: 'tv' },
  ];

  return (
    <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
      {navLinks.map((link) => {
        let isActive = false;
        if (link.key === 'home') {
          isActive = pathname === '/';
        } else if (link.key === 'movie') {
          isActive = pathname === '/douban' && currentType === 'movie';
        } else if (link.key === 'tv') {
          isActive = pathname === '/douban' && currentType === 'tv';
        }

        const Icon = link.icon;
        return (
          <Link
            key={link.key}
            href={link.href}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function MobileNavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type') || 'movie';

  const navLinks = [
    { href: '/', label: '首页', icon: Film, key: 'home' },
    { href: '/douban?type=movie', label: '电影', icon: Film, key: 'movie' },
    { href: '/douban?type=tv', label: '电视剧', icon: Tv, key: 'tv' },
  ];

  return (
    <div className="md:hidden flex items-center overflow-x-auto py-2 gap-2 border-t border-slate-800/60 no-scrollbar">
      {navLinks.map((link) => {
        let isActive = false;
        if (link.key === 'home') {
          isActive = pathname === '/';
        } else if (link.key === 'movie') {
          isActive = pathname === '/douban' && currentType === 'movie';
        } else if (link.key === 'tv') {
          isActive = pathname === '/douban' && currentType === 'tv';
        }

        return (
          <Link
            key={link.key}
            href={link.href}
            className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              isActive
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <nav className="glass-nav fixed top-0 w-full z-50 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Category Navigation */}
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 tracking-tight drop-shadow-sm">
                StreamTV
              </span>
            </Link>

            <Suspense fallback={null}>
              <NavLinks />
            </Suspense>
          </div>

          {/* Search Box */}
          <div className="flex items-center">
            <form onSubmit={handleSearchSubmit} className="relative w-44 sm:w-64 lg:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索电影、电视剧..."
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </form>
          </div>
        </div>

        <Suspense fallback={null}>
          <MobileNavLinks />
        </Suspense>
      </div>
    </nav>
  );
}

