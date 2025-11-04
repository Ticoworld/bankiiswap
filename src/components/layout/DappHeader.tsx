// src/components/layout/DappHeader.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { trackVisitBankii } from "@/lib/analytics-lite";

// Removed AnalyticsMenu and UserMenu in Bankii minimal surface
const MobileDrawer = dynamic(() => import("@/components/navigation/MobileDrawer"), { ssr: false });
import WalletButton from "@/components/ui/WalletButton";

export function DappHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mobileOpen]);

  const isSwap = pathname === "/" || pathname.startsWith("/swap");

  return (
    <header className="bg-black border-b-2 border-bankii-blue/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/swap" className="flex items-center gap-2 group">
            <Image
              src="/assets/logos/bankii-logo.jpg"
              alt="BankiiSwap"
              width={32}
              height={32}
              className="rounded-lg transition-opacity group-hover:opacity-80"
              priority
            />
            <span className="text-xl font-heading font-heading-bold text-white group-hover:text-accent-start transition-colors">
              BankiiSwap
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/swap"
              className={`relative px-3 py-2 rounded-card text-body-md font-medium transition-all duration-300 ${
                isSwap ? "text-bankii-blue" : "text-gray-400 hover:text-white"
              }`}
            >
              Swap
              {isSwap && (
                <motion.span 
                  layoutId="nav-underline" 
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-gradient-to-r from-bankii-blue to-brand-blue rounded-full" 
                />
              )}
            </Link>
            <Link 
              href="/about" 
              className="px-3 py-2 rounded-card text-body-md font-medium text-gray-400 hover:text-white transition-all duration-300"
            >
              About
            </Link>
            <a 
              href="https://bankii.finance" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-card text-body-md font-medium text-gray-400 hover:text-white transition-all duration-300"
              onClick={() => trackVisitBankii()}
            >
              Visit Bankii.finance
            </a>
          </nav>

          {/* Right side: wallet + user + mobile toggle */}
          <div className="flex items-center gap-2">
            {isClient && (
              <WalletButton className="px-4 py-2" />
            )}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden text-gray-400 hover:text-white p-2 transition-colors"
              aria-label="Open menu"
            >
              {isClient ? (mobileOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />) : <span />}
            </button>
          </div>
        </div>
      </div>
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}