'use client';

import SwapForm from '@/components/swap/SwapForm';

export default function SwapPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 md:py-20 bg-white dark:bg-black relative overflow-x-hidden">
      <div className="w-full max-w-md relative px-2 sm:px-0">
        {/* Subtle ambient glow: lighter in light mode, stronger in dark */}
        <div className="absolute -inset-8 rounded-full pointer-events-none blur-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-bankii-blue/10 dark:from-black dark:via-black dark:to-bankii-blue/10 opacity-60 dark:opacity-100" />
        <div className="relative z-10">
          <SwapForm />
        </div>
      </div>
    </main>
  );
}
