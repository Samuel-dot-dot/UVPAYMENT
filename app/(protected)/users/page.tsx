'use client';

import { useEffect, useState } from 'react';
import { useRole } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Users, Crown, Shield, UserPlus, Loader2, Search, Check, X } from 'lucide-react';

interface User {
  id: string;
  discord_id: string;
  email: string;
  role: 'guest' | 'subscriber' | 'admin' | 'owner';
  subscription_status: string;
  avatar_url?: string;
  created_at: string;
}

export default function UsersPage() {
  const { role } = useRole();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const canManage = role === 'admin' || role === 'owner';

  useEffect(() => {
    if (!canManage) {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [canManage, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'guest' | 'subscriber' | 'admin') => {
    setUpdatingUserId(userId);
    try {
      const response = await fetch('/api/users/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.discord_id?.includes(searchTerm)
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'subscriber':
        return <Check className="w-4 h-4 text-green-400" />;
      default:
        return <UserPlus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'admin':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'subscriber':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (!canManage) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-electric-violet animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <Users className="w-8 h-8 text-electric-violet" />
          <h1 className="text-3xl font-bold text-white">User Management</h1>
        </div>
        <p className="text-slate-400">Manage user roles and permissions</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by email or Discord ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-glass-border rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet transition-all"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-glass-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-slate-400" />
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm">Subscribers</p>
              <p className="text-2xl font-bold text-green-400">
                {users.filter(u => u.role === 'subscriber').length}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm">Admins</p>
              <p className="text-2xl font-bold text-blue-400">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Guests</p>
              <p className="text-2xl font-bold text-slate-400">
                {users.filter(u => u.role === 'guest').length}
              </p>
            </div>
            <UserPlus className="w-8 h-8 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-glass-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-glass-border">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full border border-glass-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-electric-violet/20 border border-electric-violet/30 flex items-center justify-center">
                          <Users className="w-5 h-5 text-electric-violet" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{user.email || 'No email'}</p>
                        <p className="text-slate-500 text-xs">{user.discord_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="text-xs font-bold uppercase">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.subscription_status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {user.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {user.role !== 'owner' && (
                      <div className="flex items-center space-x-2">
                        {user.role !== 'subscriber' && (
                          <button
                            onClick={() => updateUserRole(user.id, 'subscriber')}
                            disabled={updatingUserId === user.id}
                            className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingUserId === user.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              '→ Subscriber'
                            )}
                          </button>
                        )}

                        {role === 'owner' && user.role !== 'admin' && (
                          <button
                            onClick={() => updateUserRole(user.id, 'admin')}
                            disabled={updatingUserId === user.id}
                            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingUserId === user.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              '→ Admin'
                            )}
                          </button>
                        )}

                        {user.role !== 'guest' && (
                          <button
                            onClick={() => updateUserRole(user.id, 'guest')}
                            disabled={updatingUserId === user.id}
                            className="px-3 py-1.5 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingUserId === user.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              '→ Guest'
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No users found</p>
        </div>
      )}
    </div>
  );
}
