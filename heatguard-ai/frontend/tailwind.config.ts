import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // HeatGuard AI Custom Colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        
        // Temperature-based colors
        heat: {
          extreme: '#dc2626',  // Red - extreme danger
          high: '#ea580c',     // Orange - high risk
          moderate: '#f59e0b', // Amber - moderate risk
          low: '#10b981',      // Green - safe
          safe: '#059669',     // Darker green
        },
        
        // Semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#dc2626',
        info: '#3b82f6',
        
        // Background colors
        background: {
          primary: '#0f172a',  // Dark slate
          secondary: '#1e293b',
          tertiary: '#334155',
          card: '#0f172a',
        },
        
        // Text colors
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          tertiary: '#64748b',
        },
        
        // Border colors
        border: {
          primary: '#334155',
          secondary: '#475569',
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      borderRadius: {
        '4xl': '2rem',
      },
      
      boxShadow: {
        'heat': '0 0 20px rgba(220, 38, 38, 0.3)',
        'cool': '0 0 20px rgba(16, 185, 129, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glow-red': '0 0 15px rgba(220, 38, 38, 0.4)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.4)',
      },
      
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 10s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
        },
      },
      
      backgroundImage: {
        'heat-gradient': 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%)',
        'cool-gradient': 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
        'map-pattern': "url('/images/map-pattern.png')",
      },
    },
  },
  plugins: [],
}

export default config
