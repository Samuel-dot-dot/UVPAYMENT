import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#05010B',
        midnight: '#090313',
        'electric-violet': '#7C3AED',
        'electric-violet-dark': '#4C1D95',
        'glow-violet': '#A855F7',
        'glass-border': 'rgba(255,255,255,0.08)',
        'glass-border-strong': 'rgba(255,255,255,0.16)',
        'noir-ink': '#0F0B1E',
        'success-neon': '#22C55E',
        'warning-amber': '#FACC15',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 45px rgba(124, 58, 237, 0.35)',
        'inner-glow': 'inset 0 0 25px rgba(124, 58, 237, 0.2)',
      },
      backgroundImage: {
        'noir-radial':
          'radial-gradient(circle at 20% 20%, rgba(124,58,237,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(79,70,229,0.2), transparent 40%), radial-gradient(circle at 50% 80%, rgba(15,23,42,0.6), transparent 60%)',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        glow: 'glow 4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
