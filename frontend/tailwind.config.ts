import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F9F9F6', // Off-white newspaper paper
        foreground: '#111111', // Deep charcoal ink
        card: '#FFFFFF',       // Pure white for cards/sections
        'card-hover': '#F0F0EA',
        border: '#111111',     // Stark black borders
        'border-hover': '#444444',
        muted: '#555555',      // Muted text
        accent: '#D32F2F',     // Financial Times style red accent or strict black
        'accent-subtle': '#EAEAE5',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['var(--font-serif)', 'Playfair Display', 'Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
