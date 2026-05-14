/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',   // ✅ toggle dark mode via class on <html>
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2874F0', dark: '#1a5dc8', light: '#e8f0fe' },
        accent:  { DEFAULT: '#FB641B', dark: '#e05510', light: '#fff3ec' },
        success: { DEFAULT: '#26A541', light: '#e6f7ea' },
        danger:  { DEFAULT: '#FF4D4D', light: '#fff0f0' },
        purple:  { DEFAULT: '#7C3AED', light: '#f0ebff' },
        teal:    { DEFAULT: '#0F9D8A', light: '#e0f5f3' },
        ink: {
          900: '#11132A', 800: '#1E2035', 700: '#32354A', 600: '#4A4D5E',
          500: '#6B6F80', 400: '#9699A8', 300: '#C9CBD6', 200: '#E2E4EB',
          100: '#F0F1F5', 50:  '#F7F8FA',
        },
        // ✅ Dark mode palette — use as dark:bg-dm-card etc.
        dm: {
          bg:     '#0D1117',
          card:   '#161B22',
          hover:  '#21262D',
          border: '#30363D',
          text:   '#E6EDF3',
          muted:  '#8B949E',
          subtle: '#484F58',
        },
      },
      fontFamily: {
        head: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        card:   '0 2px 8px rgba(0,0,0,0.08)',
        hover:  '0 12px 36px rgba(0,0,0,0.15)',
        glass:  '0 8px 32px rgba(31,38,135,0.18)',
        'dark-card': '0 2px 12px rgba(0,0,0,0.4)',
        'dark-hover':'0 12px 40px rgba(0,0,0,0.55)',
      },
      animation: {
        'fade-in':    'fadeIn 0.35s ease both',
        'slide-down': 'slideDown 0.22s ease both',
        'spin-slow':  'spin 0.7s linear infinite',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 1.4s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
        slideDown:  { from: { opacity: 0, transform: 'translateY(-10px)' }, to: { opacity: 1, transform: 'none' } },
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        shimmer:    { from: { backgroundPosition: '-600px 0' }, to: { backgroundPosition: '600px 0' } },
        pulseSoft:  { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};
