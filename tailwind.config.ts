import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './docs/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0E11',
          surface: '#151A21',
          elevated: '#1E2329',
        },
        primary: {
          DEFAULT: '#5865F2',
          hover: '#4752C4',
          active: '#3C45A5',
        },
        success: '#43B581',
        danger: '#F04747',
        warning: '#FAA61A',
        text: {
          primary: '#FFFFFF',
          secondary: '#B9BBBE',
          muted: '#72767D',
        },
        accent: {
          cyan: '#00E5FF',
          purple: '#B24BF3',
          plasma: '#00FF88',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'page-title': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        'section-heading': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-small': ['13px', { lineHeight: '1.6', fontWeight: '500' }],
        button: ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        label: ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'sunc-large': ['32px', { lineHeight: '1', fontWeight: '700' }],
        code: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      backgroundImage: {
        'glass-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'card-glass':
          'linear-gradient(135deg, rgba(21, 26, 33, 0.6) 0%, rgba(30, 35, 41, 0.6) 100%)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(88, 101, 242, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.4)',
        'glow-purple': '0 0 20px rgba(178, 75, 243, 0.4)',
        'glow-success': '0 0 20px rgba(67, 181, 129, 0.4)',
        'glow-primary': '0 0 20px rgba(88, 101, 242, 0.4)',
      },
      borderColor: {
        glass: 'rgba(255, 255, 255, 0.08)',
        'glass-strong': 'rgba(88, 101, 242, 0.3)',
        'glass-emphasis': 'rgba(88, 101, 242, 0.6)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
