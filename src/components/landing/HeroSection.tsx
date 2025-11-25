"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import TrustBar from "./TrustBar";

export default function HeroSection() {
  return (
    <section className="min-h-screen relative overflow-hidden bg-white dark:bg-black" data-aos="fade-up">
      {/* Decorative subtle magma shapes (replaces whatamesh) */}
      <div aria-hidden className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -left-32 -bottom-20 w-96 h-96 rounded-full bg-gradient-to-tr from-[#0049FF] to-[#00A6FF] opacity-40 blur-3xl transform -translate-x-8 hidden dark:block" />
        <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[120%] h-72 rounded-full bg-gradient-to-r from-transparent via-[#0049FF]/40 to-transparent opacity-60 blur-2xl hidden dark:block" />
        <div className="absolute -right-20 top-8 w-72 h-72 rounded-full bg-gradient-to-bl from-[#00A6FF] to-[#0049FF] opacity-30 blur-3xl hidden dark:block" />
      </div>

      {/* Layer 2: Vignette to shape the light (overlay the magma) */}
      <div
        className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_60%,rgba(0,0,0,0.95)_100%)] hidden dark:block"
      />

      {/* Light mode mobile overlay for better text visibility */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-b from-white/80 via-white/60 to-white/90 md:bg-gradient-to-b md:from-white/40 md:via-white/20 md:to-white/50 dark:hidden"
      />

      {/* Layer 3: Content with proper left alignment */}
      <div className="relative z-20 flex flex-col justify-center min-h-screen">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
          <div className="max-w-4xl flex flex-col items-start text-left relative">
            {/* Mobile text backdrop for better visibility in light mode */}
            <div className="absolute -inset-4 bg-white/70 backdrop-blur-sm rounded-3xl -z-10 md:hidden dark:hidden" />
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-gray-900 dark:text-white leading-tight sm:leading-tight lg:leading-tight">
              {/* Mobile: Show without dash, Desktop: Show with dash and keep "The DeFi Heart" on first line */}
              <span className="hidden lg:inline">
                <span className="inline-block whitespace-nowrap">BankiiSwap – The&nbsp;</span>
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-bankii-blue dark:to-purple-500">DeFi Heart</span>
                {' '}of the Bankii Ecosystem
              </span>
              <span className="lg:hidden">
                <span className="block">BankiiSwap</span>
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-bankii-blue dark:to-purple-500">The DeFi Heart</span>
                {' '}of the Bankii Ecosystem
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-xl md:text-2xl text-gray-600 dark:text-gray-400">
              Swap, earn, and access exclusive $BKP benefits, all powered by Solana&apos;s fastest liquidity network.
            </p>

            {/* Icon List */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-bankii-blue w-5 h-5" />
                <span className="text-lg font-medium">Best rates</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-bankii-blue w-5 h-5" />
                <span className="text-lg font-medium">Lowest slippage</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-bankii-blue w-5 h-5" />
                <span className="text-lg font-medium">Instant execution</span>
              </div>
            </div>

            <div className="mt-10 mb-8 md:mb-0">
              <a href="/swap" className="btn-primary">Launch App</a>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: Zero-Gravity objects — behind content (e.g., Jupiter) */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        <motion.div
          className="absolute hidden xl1400:block"
          style={{ top: '5rem', left: '25%' }}
          initial={{ y: 0, x: 0, scale: 0.75 }}
        >
          <Image
            src="/assets/hero/jupiter-3d.png"
            alt="Jupiter deep background"
            width={176}
            height={176}
            className="opacity-50 blur-sm rounded-3xl"
            draggable={false}
          />
        </motion.div>
      </div>

      {/* Layer 4: Zero-Gravity objects — in front of content but behind interactive elements */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
        {/* Bankii (hero object) - show only on very large screens (>=1400px) */}
        <motion.div
          className="absolute hidden xl1400:block"
          style={{ top: '25%', left: '4rem' }}
          initial={{ y: 0, scale: 1 }}
        >
          <Image src="/assets/hero/bankii-3d.png" alt="Bankii midground" width={192} height={192} className="rounded-3xl" draggable={false} />
        </motion.div>

        {/* Solana (mid-ground) - show only on very large screens (>=1400px) */}
        <motion.div
          className="absolute hidden xl1400:block"
          style={{ bottom: '25%', right: '4rem' }}
          initial={{ scale: 1.25 }}
        >
          <Image src="/assets/hero/solana-3d.png" alt="Solana midground" width={224} height={224} className="rounded-3xl" draggable={false} />
        </motion.div>

        {/* USDC (foreground blurred) - always visible, reduced opacity on mobile */}
        <motion.div
          className="absolute opacity-40 md:opacity-70"
          style={{ left: '-2.5rem', bottom: '1rem', filter: 'blur(16px)' }}
          initial={{ scale: 1.5 }}
        >
          <Image src="/assets/hero/usdc-3d.png" alt="USDC foreground" width={320} height={320} className="rounded-3xl" draggable={false} />
        </motion.div>
      
        {/* Foreground Bankii (top-right blurred) - always visible */}
        <motion.div
          className="absolute"
          style={{ right: '-2.5rem', top: '2.5rem', filter: 'blur(10px)', opacity: 0.75 }}
          initial={{ scale: 1.25 }}
        >
          <Image src="/assets/hero/bankii-3d.png" alt="Bankii foreground" width={288} height={288} className="rounded-3xl" draggable={false} />
        </motion.div>
      </div>

      {/* Layer 5: Trust Bar - floats at the bottom */}
      <TrustBar />
    </section>
  );
}
