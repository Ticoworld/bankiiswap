'use client';

import SwapForm from '@/components/swap/SwapForm';
import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-darker via-neutral-dark to-black flex flex-col px-4 py-4 sm:py-6 overflow-x-hidden">
      {/* Header with Bankii.finance link */}
      <header className="w-full max-w-6xl mx-auto mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-heading font-heading-bold text-white">
            BankiiSwap
          </h1>
          <span className="text-xs text-bankii-grey bg-bankii-blue/10 px-2 py-0.5 rounded-full border border-bankii-blue/20">
            Beta
          </span>
        </div>
        <a
          href="https://bankii.finance"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-accent-start to-accent-end text-white font-medium rounded-lg hover:shadow-bankii transition-all duration-300"
        >
          Visit Bankii.finance
          <FiExternalLink className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Main swap container */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div className="w-full max-w-md relative px-2 sm:px-0">
          {/* Ambient glow effect - updated to Bankii blue */}
          <div className="absolute -inset-8 bg-bankii-blue/5 blur-3xl rounded-full pointer-events-none" />
          
          {/* Swap form with relative positioning */}
          <div className="relative z-10">
            <SwapForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-bankii-grey">
        <div className="flex items-center gap-2">
          <span>Powered by</span>
          <a
            href="https://jup.ag"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-start hover:text-accent-end transition-colors font-semibold"
          >
            Jupiter
          </a>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          <Link href="/about" className="hover:text-white transition-colors">
            Learn more
          </Link>
          <span>•</span>
          <Link href="/legal/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <span>•</span>
          <Link href="/legal/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
