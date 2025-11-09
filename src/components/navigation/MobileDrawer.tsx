"use client";

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
// Bankii minimal: remove external nav config dependencies
import { motion, AnimatePresence } from 'framer-motion';
import { PnlPortfolio } from '@/components/swap/TraderDashboardPanel';
import { SwapHistoryEntry } from '@/hooks/useSwapHistory';
import Settings from '@/components/swap/Settings';

export default function MobileDrawer({ 
  open, 
  onClose, 
  history,
  slippage,
  setSlippage 
}: { 
  open: boolean; 
  onClose: () => void; 
  history: SwapHistoryEntry[];
  slippage: number;
  setSlippage: (value: number) => void;
}) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const { disconnect, connected } = useWallet();

  // Mount-only flag for portal usage
  useEffect(() => setIsClient(true), []);

  // Lock body scroll when open
  useEffect(() => {
    if (!isClient) return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Reset scroll to top so nav items are visible, not the CTA
      requestAnimationFrame(() => {
        if (contentRef.current) contentRef.current.scrollTop = 0;
        firstLinkRef.current?.focus();
      });
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open, isClient]);

  // Handle ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !isClient) return null;

  // Basic focus trap handler
  const onTrapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !asideRef.current) return;
    const focusable = asideRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Disconnect handler
  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  if (!open || !isClient) return null;

  const drawer = (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.aside
        key="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Dashboard navigation"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.2 }}
        /* Stripe x DeFi: dark neutral surface with subtle liquid magma overlay */
        className="fixed right-0 top-0 bottom-0 z-[101] w-80 max-w-[85vw] bg-neutral-darker border-l border-gray-800 shadow-2xl overflow-hidden flex flex-col"
        ref={asideRef}
        onKeyDown={onTrapFocus}
      >
        {/* Liquid magma background (whatamesh-style) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-24 w-[420px] h-[420px] rounded-full bg-gradient-to-bl from-[#00A6FF] to-[#0049FF] blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#0049FF] to-[#00A6FF] blur-3xl" />
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-800 bg-neutral-darker/80 backdrop-blur flex-shrink-0">
          <h3 className="text-sm font-medium text-white">Dashboard</h3>
          <button onClick={onClose} aria-label="Close menu" className="text-gray-400 hover:text-white p-1">✕</button>
        </div>

        {/* Main content - scrollable area with P&L and Settings */}
        <div ref={contentRef} className="flex-grow overflow-y-auto px-3 py-4 space-y-6">
          {/* Top: P&L Portfolio (priority feature) */}
          <section aria-label="Portfolio">
            <PnlPortfolio history={history} />
          </section>

          {/* Middle: Settings with slippage controls */}
          <section aria-label="Settings" className="bg-black/40 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Transaction Settings</h4>
              <Settings slippage={slippage} setSlippage={setSlippage} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Current Slippage</span>
                <span className="text-white font-medium">{slippage}%</span>
              </div>
              <p className="text-xs text-gray-400">
                Click the settings icon to adjust your slippage tolerance
              </p>
            </div>
          </section>
        </div>

        {/* Footer - pinned to bottom with nav links and disconnect */}
        <div className="flex-shrink-0 border-t border-gray-800/50 bg-neutral-darker/90 backdrop-blur">
          {/* Navigation Links */}
          <nav className="px-3 py-3 space-y-2">
            <Link
              ref={firstLinkRef}
              href="/home"
              onClick={onClose}
              className={pathname === '/home' ? 'block px-3 py-2 rounded-lg bg-white/5 text-white font-medium text-sm' : 'block px-3 py-2 rounded-lg text-gray-200 hover:bg-white/5 text-sm'}
              target="_blank"
              rel="noopener noreferrer"
            >
              Home
            </Link>
            <a
              href="https://bankii.finance"
              target="_blank"
              rel="noopener noreferrer"
              className='block px-3 py-2 rounded-lg text-gray-200 hover:bg-white/5 text-sm'
            >
              Visit Bankii.finance
            </a>
          </nav>

          {/* Disconnect Button */}
          {connected && (
            <div className="px-3 pb-3">
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium transition-colors text-sm"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );

  // Render above any header stacking context to avoid clipping/overlap
  return createPortal(drawer, document.body);
}

// Wallet CTA removed in favor of header wallet button and premium drawer content
