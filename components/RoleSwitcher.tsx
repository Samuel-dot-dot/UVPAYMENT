'use client';

import { motion } from 'framer-motion';
import { Crown, Key, Shield, User } from 'lucide-react';
import type { JSX } from 'react';
import { useRole } from '@/app/providers';
import type { UserRole } from '@/types';

const roles: Array<{ id: UserRole; label: string; icon: JSX.Element; color: string }> = [
  { id: 'guest', label: 'Guest', icon: <User className="w-3 h-3" />, color: 'bg-slate-500' },
  { id: 'subscriber', label: 'Subscriber', icon: <Crown className="w-3 h-3" />, color: 'bg-electric-violet' },
  { id: 'admin', label: 'Admin', icon: <Shield className="w-3 h-3" />, color: 'bg-blue-500' },
  { id: 'owner', label: 'Owner', icon: <Key className="w-3 h-3" />, color: 'bg-yellow-500' },
];

export default function RoleSwitcher() {
  const { role, setRole, realRole } = useRole();

  if (realRole !== 'owner') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-void/90 backdrop-blur-xl border border-glass-border p-2 rounded-2xl shadow-2xl flex space-x-2"
      >
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`
              relative flex flex-col items-center justify-center w-20 h-16 rounded-xl transition-all duration-300
              ${role === r.id
                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] border border-white/20'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'}
            `}
          >
            <div className={`mb-1 p-1 rounded-full ${role === r.id ? r.color : 'bg-slate-800'}`}>{r.icon}</div>
            <span className="text-[10px] font-medium uppercase tracking-wider">{r.label}</span>

            {role === r.id && (
              <motion.div layoutId="activeRoleIndicator" className="absolute -bottom-1 w-1 h-1 rounded-full bg-white" />
            )}
          </button>
        ))}
      </motion.div>
      <div className="text-right mt-2 mr-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Owner Debug Mode</span>
      </div>
    </div>
  );
}
