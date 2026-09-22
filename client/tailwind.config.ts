import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1a1a2e',
        blood: '#e63946',
        gold: '#f4a261',
        paper: '#fdf6e3',
        slime: '#7bd389',
      },
      fontFamily: {
        marker: ['"Permanent Marker"', 'cursive'],
        hand: ['"Patrick Hand"', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ink: '4px 4px 0 0 #1a1a2e',
        'ink-sm': '2px 2px 0 0 #1a1a2e',
        blood: '4px 4px 0 0 #e63946',
      },
      keyframes: {
        wiggle: {
          '0%,100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(8deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.6) rotate(-6deg)', opacity: '0' },
          '70%': { transform: 'scale(1.08) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0)' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-6px) rotate(-1deg)' },
          '40%,80%': { transform: 'translateX(6px) rotate(1deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 0.25s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        pop: 'pop 0.35s cubic-bezier(.2,1.6,.4,1) both',
        shake: 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
