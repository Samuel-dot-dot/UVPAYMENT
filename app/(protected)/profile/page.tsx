'use client';

import { useSession } from 'next-auth/react';
import { useRole } from '@/app/providers';
import { Calendar, Crown, Mail, ShieldCheck, User, AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { data: session } = useSession();
  const { role } = useRole();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error && data) {
          setProfileData(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [session?.user?.id]);

  const getRoleBadge = () => {
    if (role === 'owner') return { label: 'Owner', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', icon: <Crown className="w-4 h-4" /> };
    if (role === 'admin') return { label: 'Admin', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', icon: <ShieldCheck className="w-4 h-4" /> };
    if (role === 'subscriber') return { label: 'Premium', color: 'bg-electric-violet/20 text-electric-violet border-electric-violet/30', icon: <Crown className="w-4 h-4" /> };
    return { label: 'Guest', color: 'bg-slate-700 text-slate-300 border-slate-600', icon: <User className="w-4 h-4" /> };
  };

  const roleBadge = getRoleBadge();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setCancelSuccess(true);
      setTimeout(() => {
        setShowCancelModal(false);
        setCancelSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-violet border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-slate-400">Manage your account settings and subscription</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white/5 border border-glass-border rounded-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="h-32 bg-gradient-to-r from-electric-violet/20 via-purple-600/20 to-indigo-600/20 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        </div>

        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="flex items-start -mt-16 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-void bg-slate-800 shadow-2xl">
                <img
                  src={session?.user?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (session?.user?.email || 'default')}
                  alt={session?.user?.name || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-lg text-xs font-bold border ${roleBadge.color} backdrop-blur-sm flex items-center gap-1.5`}>
                {roleBadge.icon}
                {roleBadge.label}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {session?.user?.name || 'Discord User'}
              </h2>
              <p className="text-slate-400 text-sm">Member since {formatDate(profileData?.created_at)}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-glass-border rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Mail className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Email</span>
                </div>
                <p className="text-white font-medium">{session?.user?.email || 'Not available'}</p>
              </div>

              <div className="bg-white/5 border border-glass-border rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Account Type</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium capitalize">{role}</span>
                  {roleBadge.icon}
                </div>
              </div>

              <div className="bg-white/5 border border-glass-border rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Subscription Status</span>
                </div>
                <p className="text-white font-medium capitalize">
                  {profileData?.subscription_status || 'inactive'}
                </p>
              </div>

              <div className="bg-white/5 border border-glass-border rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Discord ID</span>
                </div>
                <p className="text-white font-medium font-mono text-sm">
                  {profileData?.discord_id || 'Not linked'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {role === 'guest' && (
        <div className="bg-gradient-to-br from-electric-violet/10 to-purple-900/10 border border-electric-violet/30 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                Upgrade to Premium
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                Get unlimited access to all uncensored content for just £4.99/month
              </p>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-6 py-2 bg-electric-violet hover:bg-violet-600 text-white font-bold text-sm rounded-lg transition-colors shadow-[0_0_15px_rgba(124,58,237,0.4)]"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {role === 'subscriber' && (
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-900/10 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                <Crown className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Premium Member</h3>
                <p className="text-slate-300 text-sm">
                  You have full access to all premium content. Thank you for your support!
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  Status: <span className="text-green-400 font-semibold capitalize">{profileData?.subscription_status}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            {!cancelSuccess ? (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>

                <h3 className="text-2xl font-bold text-white text-center mb-3">
                  Cancel Subscription?
                </h3>

                <p className="text-slate-300 text-center mb-6">
                  Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
                </p>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <p className="text-yellow-400 text-sm">
                    <strong>Note:</strong> Your subscription will remain active until the end of your billing cycle. After that, you'll lose access to premium content.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Yes, Cancel'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Subscription Cancelled</h3>
                <p className="text-slate-300">
                  Your subscription has been cancelled. You'll continue to have access until the end of your billing period.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
