// src/components/layout/DappHeader.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { trackVisitBankii } from "@/lib/analytics-lite";
import { useSwapHistory } from '@/hooks/useSwapHistory';

// Removed AnalyticsMenu and UserMenu in Bankii minimal surface
const MobileDrawer = dynamic(() => import("@/components/navigation/MobileDrawer"), { ssr: false });
import PremiumWalletButton from "@/components/ui/PremiumWalletButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function DappHeader() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [slippage, setSlippage] = useState(0.5); // Global slippage state for drawer
  
  useEffect(() => setIsClient(true), []);

  // Track scroll position to add backdrop blur only when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onResize = () => {
      if (window.innerWidth >= 768) setIsDrawerOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isDrawerOpen]);

  const isSwap = pathname === "/" || pathname.startsWith("/swap");
  // Provide history to MobileDrawer for portfolio rendering
  const { history } = useSwapHistory();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 dark:bg-black/20 backdrop-blur-md' : 'bg-transparent'
    }`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile: condensed status bar with logo icon only */}
          <Link href="/swap" className="flex items-center gap-2 group">
            <Image
              src="/assets/logos/bankii-logo.jpg"
              alt="Bankii"
              width={32}
              height={32}
              className="rounded-lg transition-opacity group-hover:opacity-80"
              priority
            />
            {/* Hide text on mobile, keep on desktop for branding */}
            <span className="hidden md:inline text-xl font-heading font-heading-bold text-gray-900 dark:text-white group-hover:text-accent-start transition-colors">
              BankiiSwap
            </span>
          </Link>

            {/* Desktop navigation removed for minimal surface */}

          {/* Right side: Theme toggle and wallet button */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isClient ? (
              <PremiumWalletButton onOpenDrawer={() => setIsDrawerOpen(true)} />
            ) : (
              <div className="px-4 py-2 rounded-lg bg-bankii-blue/20 animate-pulse h-10 w-36" />
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isDrawerOpen && (
          <MobileDrawer 
            open={isDrawerOpen} 
            onClose={() => setIsDrawerOpen(false)} 
            history={history}
            slippage={slippage}
            setSlippage={setSlippage}
          />
        )}
      </AnimatePresence>
    </header>
  );
}