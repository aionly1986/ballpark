import type { Config } from 'tailwindcss'

// One shared design system across every calculator.
// cal.com-clean / Notion-minimal: one accent color, generous space, high legibility.
const config: Config = {
  content: [
    './src/**/*.{ts,tsx,md,mdx}',
    './mdx-components.tsx',
  ],
  theme: {
    extend: {
      colors: {
        // Single accent color used everywhere for emphasis + CTAs.
        accent: {
          DEFAULT: '#4f46e5', // indigo-600
          soft: '#eef2ff',
          ink: '#3730a3',
        },
        ink: {
          DEFAULT: '#111827', // near-black headings
          soft: '#4b5563', // body copy
          faint: '#9ca3af', // captions
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f9fafb',
          border: '#e5e7eb',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI',
          'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif',
        ],
      },
      maxWidth: {
        content: '48rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(17,24,39,0.06), 0 8px 24px rgba(17,24,39,0.04)',
      },
    },
  },
  plugins: [],
}

export default config
