'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Crown,
  LayoutDashboard,
  LogOut,
  PlaySquare,
  UploadCloud,
  User,
  Users,
} from 'lucide-react';
import { useRole } from '@/app/providers';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useRole();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const getAvatarBorder = () => {
    if (role === 'owner') return 'border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]';
    if (role === 'admin') return 'border-2 border-blue-500';
    if (role === 'subscriber') return 'border-2 border-electric-violet';
    return 'border border-glass-border';
  };

  const getRoleBadge = () => {
    if (role === 'owner') return <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/30 uppercase">Owner</span>;
    if (role === 'admin') return <span className="text-[10px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded border border-blue-500/30 uppercase">Admin</span>;
    if (role === 'subscriber') return <span className="text-[10px] bg-electric-violet/20 text-electric-violet px-2 py-0.5 rounded border border-electric-violet/30 uppercase">Premium</span>;
    return <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase">Guest</span>;
  };

  const linkClasses = (href: string) => {
    const base = 'flex items-center px-4 py-3 rounded-xl transition-all duration-200';
    const active = 'bg-electric-violet/20 text-electric-violet border border-electric-violet/20';
    const inactive = 'text-slate-400 hover:bg-white/5 hover:text-white';
    return `${base} ${pathname === href ? active : inactive}`;
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-void/90 backdrop-blur-xl border-r border-glass-border flex flex-col z-50">
      <div className="h-20 flex items-center px-8 border-b border-glass-border bg-black/20">
        <div className="w-8 h-8 bg-electric-violet rounded-lg mr-3 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]">
          <span className="font-bold text-white">UV</span>
        </div>
        <span className="font-bold text-xl tracking-tight text-white">UVPayment</span>
      </div>

      <div className="p-6 flex flex-col items-center border-b border-glass-border bg-white/5">
        <div className={`w-20 h-20 rounded-full overflow-hidden mb-3 ${getAvatarBorder()} transition-all duration-300`}>
          <img
            src={session?.user?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (session?.user?.email || 'default')}
            alt={session?.user?.name || 'User Avatar'}
            className="w-full h-full object-cover bg-slate-800"
          />
        </div>
        <h3 className="font-medium text-white truncate max-w-[180px]">
          {session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}
        </h3>
        <div className="mt-1">{getRoleBadge()}</div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <Link href="/dashboard" className={linkClasses('/dashboard')}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </Link>

        <Link href="/videos" className={linkClasses('/videos')}>
          <PlaySquare className="w-5 h-5 mr-3" />
          Videos
        </Link>

        {role === 'guest' && (
          <Link href="/pricing" className={linkClasses('/pricing')}>
            <Crown className="w-5 h-5 mr-3 text-yellow-400" />
            Upgrade
          </Link>
        )}

        <Link href="/profile" className={linkClasses('/profile')}>
          <User className="w-5 h-5 mr-3" />
          Profile
        </Link>

        {(role === 'admin' || role === 'owner') && (
          <>
            <div className="pt-4 pb-2 px-4 text-[10px] uppercase tracking-widest text-slate-600 font-bold">Admin Controls</div>
            <Link href="/upload" className={linkClasses('/upload')}>
              <UploadCloud className="w-5 h-5 mr-3" />
              Upload Video
            </Link>

            <Link href="/users" className={linkClasses('/users')}>
              <Users className="w-5 h-5 mr-3" />
              Users
            </Link>
          </>
        )}
      </nav>

      {role === 'guest' && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-br from-electric-violet/20 to-purple-900/20 border border-electric-violet/30 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-electric-violet/10 blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center mb-2">
              <Crown className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-xs font-bold text-white">PREMIUM ACCESS</span>
            </div>
            <p className="text-[10px] text-slate-300 mb-3 leading-relaxed">Unlock uncensored videos for just ��4.99.</p>
            <button
              onClick={() => router.push('/pricing')}
              className="w-full py-2 text-xs font-bold text-white bg-electric-violet rounded-lg hover:bg-violet-600 transition-colors shadow-[0_0_10px_rgba(124,58,237,0.3)]"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-glass-border bg-black/20">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-white transition-colors group mb-2"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:text-red-400 transition-colors" />
          Sign Out
        </button>
        <div className="text-[10px] text-slate-600 text-center font-mono">
          &copy; 2025 UVPayment v1.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
