'use client';

import { useRole } from '@/app/providers';
import VideoGrid from '@/components/VideoGrid';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';

const DashboardPage = () => {
  const { role } = useRole();
  const searchParams = useSearchParams();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Check if user just completed payment
    if (searchParams.get('success') === 'true' && role === 'subscriber') {
      setShowWelcomeModal(true);

      // Remove the success param from URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, role]);

  return (
    <>
      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowWelcomeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-electric-violet/20 border-2 border-electric-violet/50 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated background sparkles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-electric-violet rounded-full"
                    initial={{
                      x: Math.random() * 400,
                      y: Math.random() * 400,
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 2,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 3,
                    }}
                  />
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2, damping: 15 }}
                  className="w-24 h-24 rounded-full bg-electric-violet/20 border-4 border-electric-violet flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(124,58,237,0.5)]"
                >
                  <Check className="w-12 h-12 text-electric-violet" strokeWidth={3} />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-2"
                >
                  Welcome, Subscriber!
                  <Sparkles className="w-8 h-8 text-electric-violet" />
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-300 text-lg mb-6 leading-relaxed"
                >
                  Thank you for subscribing! You now have full access to all premium content.
                </motion.p>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10"
                >
                  <h3 className="text-sm font-bold text-electric-violet uppercase tracking-wider mb-3">
                    What's Unlocked:
                  </h3>
                  <ul className="space-y-2 text-left text-slate-300">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span>Access to all exclusive videos</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span>Premium content links</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span>Early access to new releases</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span>Ad-free experience</span>
                    </li>
                  </ul>
                </motion.div>

                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => setShowWelcomeModal(false)}
                  className="w-full px-8 py-4 bg-electric-violet hover:bg-violet-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-electric-violet/50 hover:scale-105 transform"
                >
                  Start Exploring
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard Content */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-electric-violet" />
              <p className="text-slate-400 text-sm uppercase tracking-wider">
                Role: {role}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-6">Videos</h2>
          <VideoGrid />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
