'use client';

import SwapForm from '@/components/swap/SwapForm';

export default function SwapPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 md:py-20 bg-black relative overflow-x-hidden">
      <div className="w-full max-w-md relative px-2 sm:px-0">
        {/* Subtle ambient glow, but more black for hero effect */}
        <div className="absolute -inset-8 bg-gradient-to-br from-black via-black to-bankii-blue/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10">
          <SwapForm />
        </div>
      </div>
    </main>
  );
}
