/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0e1a',
          card: '#111827',
          'card-hover': '#1a2235',
          border: '#1f2d40',
          green: '#00ff88',
          blue: '#00d4ff',
          purple: '#7c3aed',
          red: '#ff4444',
          yellow: '#ffd700',
          text: '#e2e8f0',
          muted: '#64748b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
