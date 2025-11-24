'use client';

import { Check, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const features = [
  'Full Uncensored Library Access',
  '4K Ultra HD Streaming',
  'Cancel Anytime',
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!session?.user) {
      setError('You must be signed in to subscribe');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-lg mb-12"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-electric-violet to-purple-600 rounded-3xl blur opacity-30 animate-pulse-slow" />

        <div className="relative bg-[#0F0F0F] border border-glass-border rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <div className="bg-electric-violet/20 border border-electric-violet/40 text-electric-violet text-xs font-bold px-3 py-1 rounded-full flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              PREMIUM
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-slate-400 mb-2">Monthly Access</h2>
            <div className="flex items-center justify-center text-white">
              <span className="text-2xl font-light text-slate-400 mr-1">£</span>
              <span className="text-6xl font-bold tracking-tight">4.99</span>
              <span className="text-slate-500 self-end mb-2 ml-2">/ month</span>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-glass-border to-transparent my-8" />

          <ul className="space-y-4 mb-10">
            {features.map((feature, index) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center text-slate-300"
              >
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center mr-3 border border-green-500/20">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                {feature}
              </motion.li>
            ))}
          </ul>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="group relative w-full py-4 bg-electric-violet hover:bg-violet-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Subscribe with Stripe'
              )}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>

          <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center">
            <Lock className="w-3 h-3 mr-1" />
            Secure payment processed by Stripe
          </p>
        </div>
      </motion.div>

      <div className="flex flex-col items-center space-y-3 text-slate-500">
        <div className="flex items-center space-x-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
          <div className="h-6 px-2 bg-white/5 rounded border border-white/10 flex items-center" title="Visa">
            <span className="font-bold text-[10px] tracking-tighter italic text-white">VISA</span>
          </div>
          <div className="h-6 px-2 bg-white/5 rounded border border-white/10 flex items-center" title="Mastercard">
            <div className="flex -space-x-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            </div>
          </div>
          <div className="h-6 px-2 bg-white/5 rounded border border-white/10 flex items-center" title="American Express">
            <span className="font-bold text-[9px] tracking-tighter text-blue-400">AMEX</span>
          </div>
        </div>
        <div className="text-[10px]">&copy; 2025 UVPayment. All rights reserved.</div>
      </div>
    </div>
  );
}
