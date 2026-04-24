/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f14',
        surface: '#1a1a24',
        surfaceElevated: '#22222f',
        border: '#2e2e3e',
        accent: '#00d4ff',
        accentMuted: '#00d4ff22',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        purple: '#a855f7',
        text: '#f0f0f5',
        textMuted: '#8888aa',
      },
      fontFamily: {
        sans: ['DMSans_400Regular'],
        medium: ['DMSans_500Medium'],
        bold: ['DMSans_700Bold'],
      },
    },
  },
  plugins: [],
};
