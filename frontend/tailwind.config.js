/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  // Tailwind preflight resets break Angular Material outlined form fields
  // (overlapping labels, invisible input text).
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glass: {
          bg: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.12)',
        },
        surface: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
      },
      backdropBlur: {
        xs: '4px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)' },
        },
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.7) 100%)',
      },
    },
  },
  plugins: [],
}

