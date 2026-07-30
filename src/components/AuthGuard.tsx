'use client';

import { useState, useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem('auth_pass') === 'tyx') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'tyx') {
      localStorage.setItem('auth_pass', 'tyx');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm glass-card p-8 rounded-3xl shadow-2xl border border-slate-700/50 flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-blue-400/20">
          <Lock className="w-8 h-8 text-blue-400" />
        </div>
        
        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">影视库</h1>
        <p className="text-slate-400 text-sm mb-8 text-center font-medium">请输入访问凭证以继续浏览</p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="输入访问密码..."
              className={`w-full bg-slate-800/80 border ${error ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-700/50 focus:border-blue-500 focus:ring-blue-500/20'} rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all focus:ring-4 text-sm font-medium`}
              autoFocus
            />
            {error && (
              <p className="absolute -bottom-6 left-1 text-[11px] text-rose-400 font-semibold">密码错误，请重试</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-2"
          >
            解锁访问
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
