/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff1f1',
          100: '#ffdede',
          200: '#ffbcbc',
          300: '#ff8a8a',
          400: '#ff4e4e',
          500: '#f82525',
          600: '#e51111',
          700: '#c00909',
          800: '#9f0d0d',
          900: '#840f0f',
          950: '#480303',
        },
        dark: {
          50:  '#f6f6f6',
          900: '#111111',
          950: '#0a0a0a',
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.05)',
        'primary': '0 4px 20px rgba(229, 17, 17, 0.25)',
      },
    },
  },
  plugins: [],
}
