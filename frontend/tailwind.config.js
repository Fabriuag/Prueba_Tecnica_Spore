/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal expandida
        brand: {
          50:  '#F3F2FF',
          100: '#E6E4FF',
          200: '#C6C1FE',
          300: '#A69FFC',
          400: '#7A6CE6',
          500: '#5C4DCC', // principal
          600: '#4B3DB5',
          700: '#3D3294',
          800: '#2C2469',
          900: '#1F1A4A',
        },
        // Acento turquesa
        'brand-accent': '#1CD2C6',
        // Nuevo acento secundario
        'brand-secondary': '#FF6B9D',
        // Variantes cyber
        cyber: {
          50:  '#F0FDFC',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#1CD2C6', // principal
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        // Grises futurísticos
        slate: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          850: '#172033', // nuevo
          900: '#0F172A',
          950: '#020617',
        },
        // Efectos holográficos
        hologram: {
          primary: '#1CD2C6',
          secondary: '#5C4DCC',
          accent: '#FF6B9D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['2rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.5rem', { lineHeight: '2.75rem' }],
        '5xl': ['3.5rem', { lineHeight: '3.75rem' }],
        '6xl': ['4rem', { lineHeight: '4.25rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'soft': '0 10px 25px -10px rgba(16,24,40,.25)',
        'hover': '0 16px 40px -10px rgba(16,24,40,.35)',
        'cyber': '0 0 20px rgba(28, 210, 198, 0.4)',
        'neon': '0 0 5px rgba(28,210,198,0.3), inset 0 0 5px rgba(28,210,198,0.1)',
        'neon-strong': '0 0 20px rgba(28,210,198,0.4), inset 0 0 10px rgba(28,210,198,0.2)',
        'hologram': '0 8px 32px rgba(28,210,198,0.12)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
        '4xl': '72px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        // Animaciones existentes mejoradas
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
        
        // Nuevas animaciones futurísticas
        'hologram': 'hologram 4s ease-in-out infinite',
        'cyber-pulse': 'cyber-pulse 2s ease-in-out infinite alternate',
        'data-flow': 'data-flow 3s linear infinite',
        'grid-shift': 'grid-shift 10s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'particle-float': 'particle-float 15s linear infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        
        // Animaciones de entrada
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        hologram: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'cyber-pulse': {
          'from': { 
            boxShadow: '0 0 5px rgba(28,210,198,0.3), inset 0 0 5px rgba(28,210,198,0.1)' 
          },
          'to': { 
            boxShadow: '0 0 20px rgba(28,210,198,0.4), inset 0 0 10px rgba(28,210,198,0.2)' 
          },
        },
        'data-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '400% 50%' },
        },
        'grid-shift': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '20px 20px' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'particle-float': {
          '0%': { 
            transform: 'translateY(100vh) translateX(0)', 
            opacity: '0' 
          },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { 
            transform: 'translateY(-10vh) translateX(50px)', 
            opacity: '0' 
          },
        },
        'neon-pulse': {
          'from': { opacity: '0.7' },
          'to': { opacity: '1' },
        },
        'glow-pulse': {
          'from': { filter: 'brightness(1)' },
          'to': { filter: 'brightness(1.2)' },
        },
        'slide-up': {
          'from': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'slide-down': {
          'from': { 
            opacity: '0', 
            transform: 'translateY(-20px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'scale-in': {
          'from': { 
            opacity: '0', 
            transform: 'scale(0.95)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'scale(1)' 
          },
        },
      },
      backgroundImage: {
        'hologram-gradient': 'linear-gradient(135deg, #1CD2C6 0%, #5C4DCC 50%, #FF6B9D 100%)',
        'cyber-gradient': 'linear-gradient(135deg, #1CD2C6 0%, #5C4DCC 100%)',
        'neon-gradient': 'linear-gradient(90deg, #1CD2C6 0%, #00D9FF 100%)',
        'dark-gradient': 'linear-gradient(160deg, #000000 0%, #0a0015 30%, #001122 70%, #000000 100%)',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'cyber': 'cubic-bezier(0.23, 1, 0.320, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      blur: {
        '4xl': '72px',
        '5xl': '96px',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
        '105': '1.05',
      },
    },
  },
  plugins: [
    // Plugin personalizado para efectos futurísticos
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-hologram': {
          background: theme('backgroundImage.hologram-gradient'),
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          animation: theme('animation.hologram'),
        },
        '.border-hologram': {
          borderImage: `${theme('backgroundImage.hologram-gradient')} 1`,
          animation: theme('animation.hologram'),
        },
        '.glass-morphism': {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
        '.cyber-glow': {
          boxShadow: theme('boxShadow.cyber'),
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.transform-gpu': {
          transform: 'translateZ(0)',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none',
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
}