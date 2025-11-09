"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Chapter = {
  id: "routing" | "bnky" | "ecosystem";
  title: string;
  description: string;
  image: string;
};

const CHAPTERS: Chapter[] = [
  {
    id: "routing",
    title: "Best Rates, Always.",
    description:
      "Our smart order router is integrated directly with the Jupiter API. This means we scan all of Solana's liquidity sources—from major pools to the long-tail—to find you the most efficient swap routes. Stop losing value to high slippage. BankiiSwap guarantees the best price, every time.",
    image: "/assets/landing/visual-routing.png",
  },
  {
    id: "bnky",
    title: "The Heart of $BNKY.",
    description:
      "The $BNKY token is the key to unlocking the ecosystem. Holders receive exclusive benefits like fee discounts up to 50%, priority access to new features, and a share of platform revenue. BankiiSwap is the premier destination for $BNKY liquidity.",
    image: "/assets/landing/visual-bnky-coin.png",
  },
  {
    id: "ecosystem",
    title: "Connected to Your Bank.",
    description:
      "BankiiSwap is not a standalone app; it's the DeFi engine for your Bankii.finance account. Seamlessly move from swapping tokens to spending them with your crypto debit card. One ecosystem, zero friction. This is the power of CeDeFi.",
    image: "/assets/landing/visual-ecosystem.png",
  },
];

export default function ValuePropSection() {
  const [activeFeature, setActiveFeature] = useState<Chapter["id"]>("routing");
  const chapterRefs = useRef<Record<Chapter["id"], HTMLDivElement | null>>({
    routing: null,
    bnky: null,
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
  <section className="py-24 bg-black" data-aos="fade-up">
      <div className="max-w-7xl mx-auto px-4">
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
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">{c.title}</h3>
                <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed">{c.description}</p>
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
