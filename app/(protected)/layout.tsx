'use client';

import type { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen bg-void items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-violet border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-void text-slate-200 font-sans selection:bg-electric-violet selection:text-white">
      <Sidebar />
      <main className="flex-1 ml-64 h-screen overflow-y-auto flex flex-col relative scroll-smooth">
        <div className="fixed top-0 right-0 w-[800px] h-[600px] bg-electric-violet/5 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="flex-1 p-8 z-10">
          <div className="relative z-10 max-w-6xl mx-auto mt-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
