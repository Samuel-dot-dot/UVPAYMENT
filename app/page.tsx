'use client';

import { signIn } from 'next-auth/react';
import { ArrowRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const handleSignIn = () => {
    signIn('discord', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen w-full bg-void relative overflow-hidden flex flex-col">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-electric-violet/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] opacity-30" />

      <div className="flex-1 flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full mx-4"
        >
          <div className="bg-black/40 backdrop-blur-2xl border border-glass-border p-10 rounded-3xl shadow-2xl text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 bg-electric-violet rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.6)] transform rotate-3 hover:rotate-0 transition-transform duration-300"
            >
              <span className="font-bold text-2xl text-white">UV</span>
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Restricted Access</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Discord Member Verification Required. Please authenticate to confirm your membership status.
            </p>

            <button
              onClick={handleSignIn}
              className="group relative flex items-center justify-center w-full py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-[#5865F2]/40"
            >
              <svg className="w-6 h-6 mr-3 fill-current" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c.63-23.28-3.56-47.26-18.89-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
              </svg>
              <span>Sign in with Discord</span>
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>System Operational</span>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="relative z-10 p-6 text-center border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <div className="mb-2 md:mb-0">
            &copy; {new Date().getFullYear()} UVPayment. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center" title="Secured by Stripe">
              <Lock className="w-3 h-3 mr-1.5 text-slate-600" />
              <span>Secured by Stripe</span>
            </div>
            <div className="flex items-center space-x-2 opacity-50 grayscale">
              <div className="h-4 px-1.5 bg-white/5 rounded border border-white/10 flex items-center"><span className="text-[9px] font-bold text-white">VISA</span></div>
              <div className="h-4 px-1.5 bg-white/5 rounded border border-white/10 flex items-center"><span className="text-[9px] font-bold text-white">MC</span></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
