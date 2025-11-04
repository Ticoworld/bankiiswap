/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bankii Brand Colors (NEW)
        'bankii-blue': '#0049FF',
        'bankii-blue-light': '#00A6FF',
        'bankii-dark': '#161D38',
        'bankii-grey': '#B7B9BD',
        
        // Accent Gradient
        'accent-start': '#0049FF',
        'accent-end': '#00A6FF',
        
        // Backward-compatible aliases (prevents breaking existing components)
        'brand-purple': '#0049FF',      // OLD → maps to bankii-blue
        'brand-blue': '#00A6FF',        // OLD → maps to bankii-blue-light
        
        // Premium Brand Color - DEPRECATED (use bankii-blue instead)
        brand: {
          purple: '#0049FF',            // Maps to bankii-blue
          'purple-dark': '#0038CC',     // Darker shade of bankii-blue
        },
        
        // Neutrals (keep dark theme support)
        'neutral-dark': '#0f172a',
        'neutral-darker': '#020617',
        'neutral-card': '#1e293b',
        'neutral-light': '#f8fafc',
        
        // Background System - Professional black/gray palette (LEGACY)
        surface: {
          dark: '#0f172a',         // slate-900
          darker: '#020617',       // slate-950
          light: '#f8fafc',        // slate-50
          card: '#1e293b',         // slate-800
        }
      },
      fontFamily: {
        // Use next/font CSS variables to avoid CLS and ensure consistent fallback
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontWeight: {
        'heading-bold': '600', // Poppins SemiBold for H1-H2
      },
      fontSize: {
        // Professional typography scale
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-sm': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-xl': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-md': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.75', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'premium': '1rem',
        'card': '0.75rem',
      },
      boxShadow: {
        'bankii': '0 4px 20px rgba(0, 73, 255, 0.15)',
        'bankii-lg': '0 10px 40px rgba(0, 73, 255, 0.25)',
        'premium': '0 20px 60px -15px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.2)',
        'glow-purple': '0 0 40px rgba(0, 73, 255, 0.3)', // Updated to bankii-blue
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
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
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}