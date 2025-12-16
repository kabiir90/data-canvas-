/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937',
        secondary: '#374151',
        background: '#ffffff',
        surface: '#f9fafb',
        border: '#e5e7eb',
        accent: '#2563eb',
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        loading: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        glow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1) translate(0, 0)' },
          '33%': { opacity: '0.7', transform: 'scale(1.2) translate(30px, -30px)' },
          '66%': { opacity: '0.5', transform: 'scale(0.9) translate(-20px, 20px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-15px) translateX(10px) rotate(5deg)' },
          '50%': { transform: 'translateY(-25px) translateX(-10px) rotate(-5deg)' },
          '75%': { transform: 'translateY(-10px) translateX(5px) rotate(3deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(15px) translateX(-10px) rotate(-5deg)' },
          '50%': { transform: 'translateY(25px) translateX(10px) rotate(5deg)' },
          '75%': { transform: 'translateY(10px) translateX(-5px) rotate(-3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(99, 102, 241, 0.6), 0 0 120px rgba(139, 92, 246, 0.4)' },
        },
        dataFlow: {
          '0%': { transform: 'translateX(-200px) translateY(100px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '50%': { opacity: '1', transform: 'translateX(0px) translateY(0px) rotate(180deg)' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateX(200px) translateY(-100px) rotate(360deg)', opacity: '0' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(150px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(150px) rotate(-360deg)' },
        },
        orbitReverse: {
          '0%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
          '100%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.1)' },
        },
        drift: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(50px, -30px) rotate(90deg)' },
          '50%': { transform: 'translate(0, -60px) rotate(180deg)' },
          '75%': { transform: 'translate(-50px, -30px) rotate(270deg)' },
          '100%': { transform: 'translate(0, 0) rotate(360deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-40px) translateX(20px)' },
        },
        floatSlowReverse: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(40px) translateX(-20px)' },
        },
        driftHorizontal: {
          '0%': { transform: 'translateX(-100px)' },
          '100%': { transform: 'translateX(calc(100vw + 100px))' },
        },
        driftVertical: {
          '0%': { transform: 'translateY(-100px)' },
          '100%': { transform: 'translateY(calc(100vh + 100px))' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.2)' },
        },
        slideDiagonal: {
          '0%': { transform: 'translate(-50px, -50px)' },
          '100%': { transform: 'translate(calc(100vw + 50px), calc(100vh + 50px))' },
        },
      },
      animation: {
        loading: 'loading 1.5s ease-in-out infinite',
        glow: 'glow 8s ease-in-out infinite',
        float: 'float 8s ease-in-out infinite',
        floatReverse: 'floatReverse 10s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        dataFlow: 'dataFlow 15s linear infinite',
        orbit: 'orbit 20s linear infinite',
        orbitReverse: 'orbitReverse 25s linear infinite',
        wave: 'wave 4s ease-in-out infinite',
        drift: 'drift 12s ease-in-out infinite',
        floatSlow: 'floatSlow 20s ease-in-out infinite',
        floatSlowReverse: 'floatSlowReverse 25s ease-in-out infinite',
        driftHorizontal: 'driftHorizontal 30s linear infinite',
        driftVertical: 'driftVertical 40s linear infinite',
        rotateSlow: 'rotateSlow 60s linear infinite',
        pulseSoft: 'pulseSoft 8s ease-in-out infinite',
        slideDiagonal: 'slideDiagonal 50s linear infinite',
      },
    },
  },
  plugins: [],
}

