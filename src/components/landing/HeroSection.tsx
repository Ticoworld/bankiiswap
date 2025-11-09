"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import TrustBar from "./TrustBar";

export default function HeroSection() {
  return (
    <section className="min-h-screen relative overflow-hidden bg-black" data-aos="fade-up">
      {/* Decorative subtle magma shapes (replaces whatamesh) */}
      <div aria-hidden className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -left-32 -bottom-20 w-96 h-96 rounded-full bg-gradient-to-tr from-[#0049FF] to-[#00A6FF] opacity-40 blur-3xl transform -translate-x-8" />
        <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[120%] h-72 rounded-full bg-gradient-to-r from-transparent via-[#0049FF]/40 to-transparent opacity-60 blur-2xl" />
        <div className="absolute -right-20 top-8 w-72 h-72 rounded-full bg-gradient-to-bl from-[#00A6FF] to-[#0049FF] opacity-30 blur-3xl" />
      </div>

      {/* Layer 2: Vignette to shape the light (overlay the magma) */}
      <div
        className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_60%,rgba(0,0,0,0.95)_100%)]"
      />

      {/* Layer 3: Centered content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-6xl md:text-7xl font-heading font-extrabold text-white leading-tight">
          Swap Smart. Bank Better.
        </h1>

        <p className="mt-6 max-w-2xl text-lg md:text-xl text-gray-400">
          The official DEX for the Bankii ecosystem. Best rates for $BNKY and all Solana tokens.
        </p>

        <div className="mt-10 mb-8 md:mb-0 flex justify-center w-full">
          <a href="/swap" className="btn-primary">Launch App</a>
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

      {/* Layer 4: Zero-Gravity objects — in front of content */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }}>
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

        {/* USDC (foreground blurred) - always visible */}
        <motion.div
          className="absolute"
          style={{ left: '-2.5rem', bottom: '1rem', filter: 'blur(16px)', opacity: 0.7 }}
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
