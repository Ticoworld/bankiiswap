"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaBolt, FaArrowDown, FaShieldAlt, FaPercentage, FaChartLine, FaStar, FaUsers } from "react-icons/fa";

type Chapter = {
  id: "routing" | "bkp" | "ecosystem";
  title: string;
  description: string;
  image: string;
};

const CHAPTERS: Chapter[] = [
  {
    id: "routing",
    title: "Best Rates. Every Swap. Every Time.",
    description:
      "BankiiSwap uses Jupiter’s advanced smart routing to scan every liquidity pool on Solana, from Raydium to Orca, guaranteeing you the best price and minimal slippage automatically. Real-time route scanning. Lowest possible fees. Lightning-fast settlement. Your swap, optimized for performance.",
    image: "/assets/landing/visual-routing.png",
  },
  {
    id: "bkp",
    title: "$BKP: Powering the Bankii Ecosystem",
    description:
      "The $BKP token fuels every feature across the Bankii ecosystem, from swaps to cards and staking. Fee Discounts – Up to 50% off swap fees. Revenue Share – Earn from platform performance. Priority Access – Be first to new products and card launches. Governance – Help shape Bankii's financial future.",
    image: "/assets/landing/visual-bkp-coin.png",
  },
  {
    id: "ecosystem",
    title: "DeFi Meets Real Finance",
    description:
      "BankiiSwap is directly integrated with your Bankii.finance wallet and debit card. Instantly swap tokens, fund your account, and spend globally, all in one ecosystem. Swap → Load → Spend → Earn. The future of money is borderless. Bankii makes it real.",
    image: "/assets/landing/visual-ecosystem.png",
  },
];

export default function ValuePropSection() {
  const [activeFeature, setActiveFeature] = useState<Chapter["id"]>("routing");
  const chapterRefs = useRef<Record<Chapter["id"], HTMLDivElement | null>>({
    routing: null,
    bkp: null,
    ecosystem: null,
  });

  // Preload images to avoid flicker when swapping
  useEffect(() => {
    if (typeof window === 'undefined') return;
    CHAPTERS.forEach((c) => {
      const img = new window.Image();
      img.src = c.image;
    });
  }, []);

  const measureAndSetActive = useCallback(() => {
    if (typeof window === "undefined") return;
    const viewportCenter = window.innerHeight / 2;
    let closest: { id: Chapter["id"]; dist: number } | null = null;

    for (const c of CHAPTERS) {
      const el = chapterRefs.current[c.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - viewportCenter);
      if (!closest || dist < closest.dist) {
        closest = { id: c.id, dist };
      }
    }

    if (closest && closest.id !== activeFeature) {
      setActiveFeature(closest.id);
    }
  }, [activeFeature]);

  // RAF-throttled scroll/resize listener
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          measureAndSetActive();
          ticking = false;
        });
        ticking = true;
      }
    };
    const onResize = onScroll;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // initial measurement
    measureAndSetActive();
    return () => {
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onResize as any);
    };
  }, [measureAndSetActive]);

  return (
  <section className="py-24 bg-white dark:bg-black" data-aos="fade-up">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left: Chapters */}
          <div data-aos="fade-up" data-aos-delay="200">
            {CHAPTERS.map((c) => (
              <div
                key={c.id}
                ref={(el) => {
                  chapterRefs.current[c.id] = el;
                }}
                className="py-12 md:py-24 md:min-h-screen flex flex-col md:justify-center"
              >
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">{c.title}</h3>
                
                {/* Special layout for "routing" chapter */}
                {c.id === "routing" ? (
                  <>
                    {/* Main description paragraph */}
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed mb-8">
                      BankiiSwap uses Jupiter&apos;s advanced smart routing to scan every liquidity pool on Solana, from Raydium to Orca, guaranteeing you the best price and minimal slippage automatically.
                    </p>
                    
                    {/* Icon list */}
                    <div className="flex flex-col gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <FaBolt className="text-bankii-blue w-5 h-5 flex-shrink-0" />
                        <span className="text-lg text-gray-700 dark:text-gray-300">Real-time route scanning</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaArrowDown className="text-bankii-blue w-5 h-5 flex-shrink-0" />
                        <span className="text-lg text-gray-700 dark:text-gray-300">Lowest possible fees</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaShieldAlt className="text-bankii-blue w-5 h-5 flex-shrink-0" />
                        <span className="text-lg text-gray-700 dark:text-gray-300">Lightning-fast settlement</span>
                      </div>
                    </div>
                    
                    {/* Concluding line */}
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      Your swap, optimized for performance.
                    </p>
                  </>
                ) : c.id === "bkp" ? (
                  <>
                    {/* Sub-headline */}
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
                      The $BKP token fuels every feature across the Bankii ecosystem, from swaps to cards and staking.
                    </p>
                    
                    {/* Icon list */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <FaPercentage className="h-5 w-5 text-bankii-blue flex-shrink-0" />
                        <span className="text-lg text-gray-700 dark:text-gray-300">Fee Discounts – Up to 50% off swap fees</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaChartLine className="h-5 w-5 text-bankii-blue flex-shrink-0" />
                        <span className="text-lg text-gray-700 dark:text-gray-300">Revenue Share – Earn from platform performance</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaStar className="h-5 w-5 text-bankii-blue flex-shrink-0" />
                        <span className="text-lg text-gray-700 dark:text-gray-300">Priority Access – Be first to new products and card launches</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaUsers className="h-5 w-5 text-bankii-blue flex-shrink-0" />
                        <span className="text-lg text-gray-700 dark:text-gray-300">Governance – Help shape Bankii&apos;s financial future</span>
                      </div>
                    </div>
                  </>
                ) : c.id === "ecosystem" ? (
                  <>
                    {/* Main paragraph */}
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
                      BankiiSwap is directly integrated with your Bankii.finance wallet and debit card. Instantly swap tokens, fund your account, and spend globally, all in one ecosystem.
                    </p>
                    
                    {/* "Pop" text */}
                    <p className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-bankii-blue to-purple-500 mb-4">
                      Swap → Load → Spend → Earn.
                    </p>
                    
                    {/* Closing paragraph */}
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                      The future of money is borderless. Bankii makes it real.
                    </p>
                  </>
                ) : (
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">{c.description}</p>
                )}
                
                {/* Mobile inline visual (sticky column hidden on <md) */}
                <div className="mt-8 md:hidden flex items-center justify-center">
                  <Image
                    src={c.image}
                    alt={c.title}
                    width={320}
                    height={320}
                    className="w-64 h-64 object-contain"
                    priority={false}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right: Sticky visuals (cross-fade, always mounted) */}
          <div className="hidden md:flex md:items-center md:justify-center h-screen top-0 sticky" data-aos="fade-up" data-aos-delay="400">
            <div className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[36rem] lg:h-[36rem] overflow-hidden">
              <AnimatePresence>
                {CHAPTERS.map((c) => (
                  activeFeature === c.id && (
                    <motion.div
                      key={c.id}
                      className="absolute inset-0 flex items-center justify-center p-6 md:p-8 lg:p-10"
                      aria-hidden={true}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        hidden: { opacity: 0, scale: 0.85, y: 20 },
                        visible: { opacity: 1, scale: 1, y: 0 },
                      }}
                      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <Image
                        src={c.image}
                        alt={c.title}
                        width={700}
                        height={700}
                        className="w-full h-full object-contain"
                        priority={false}
                      />
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
