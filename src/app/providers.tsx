'use client';
import { WalletProvider } from '@/lib/wallet/adapter';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast'; // ✅ Import toast system
import { I18nProvider } from '@/lib/i18n';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Providers({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    // Theme bootstrap: apply dark/light/system at startup
    try {
      const applyTheme = (mode: string) => {
        const root = document.documentElement;
        if (mode === 'dark') root.classList.add('dark');
        else if (mode === 'light') root.classList.remove('dark');
        else {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', !!prefersDark);
        }
      };
      const saved = localStorage.getItem('bankii_pref_theme') || 'system';
      applyTheme(saved);
      // respond to system changes when in system mode
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        const mode = localStorage.getItem('bankii_pref_theme') || 'system';
        if (mode === 'system') applyTheme('system');
      };
      mql.addEventListener?.('change', listener);
      return () => mql.removeEventListener?.('change', listener);
    } catch {}
  }, []);

  useEffect(() => {
    // Initialize AOS (Animate On Scroll)
    try {
      AOS.init({
        duration: 800, // Animation duration
        once: true,    // Only animate once
        offset: 100,   // Trigger animation before element is in view
        easing: 'ease-out-cubic'
      });
    } catch {}

    const preloadAssets = [
      '/assets/tokens/sol.png',
      '/assets/tokens/bnky.png',
      '/assets/logos/bankii-logo.jpg'
    ];
    preloadAssets.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onerror = () => {
        console.warn(`Failed to preload: ${src}`);
      };
    });

    if (typeof window !== 'undefined' && 'fonts' in document) {
      const font = new FontFace(
        'Inter',
        'url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2)'
      );
      font.load()
        .then(() => document.fonts.add(font))
        .catch(e => console.warn('Font loading failed:', e));
    }
  }, []);

  return (
    <WalletProvider>
      <I18nProvider>
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            className: 'rounded-xl shadow-lg border text-sm font-medium px-4 py-3 bg-white text-gray-900 border-gray-200 dark:bg-[#1a1a1a] dark:text-white dark:border-gray-800',
            success: {
              className: 'rounded-xl shadow-lg border px-4 py-3 bg-white text-gray-900 border-emerald-400 dark:bg-[#1a1a1a] dark:text-white dark:border-emerald-500'
            },
            error: {
              className: 'rounded-xl shadow-lg border px-4 py-3 bg-white text-gray-900 border-red-400 dark:bg-[#1a1a1a] dark:text-white dark:border-red-500'
            },
            iconTheme: {
              primary: '#0049FF', // bankii-blue
              secondary: '#1a1a1a'
            }
          }}
        />
      </I18nProvider>
    </WalletProvider>
  );
}
