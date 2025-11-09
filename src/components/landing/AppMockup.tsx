"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/**
 * A premium, dynamic "breakout" feature section.
 * This implements the "-I" layout:
 * - The text sits in a card on the left ("-").
 * - The image is a floating element on the right ("I").
 * - The image "breaks out" of the card's vertical bounds.
 */
export default function AppMockup() {
  return (
    <section
      className="relative py-32 sm:py-40 md:py-56 lg:py-72"
      aria-labelledby="app-mockup-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Relative "stage" for the card and the breakout image */}
        <div className="relative">
          {/* Background Glow (sits behind everything) */}
          <div
            className="absolute left-1/2 top-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, #0070f3 0%, #0070f3 20%, transparent 50%)",
              }}
            />
          </div>

          {/* === Mobile Layout: Image First === */}
          {/* Image appears first on mobile screens */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="block md:hidden mb-8 w-full max-w-sm mx-auto"
          >
            <Image
              src="/assets/landing/app-mockup-angled-right.png"
              alt="A premium mockup of the BankiiSwap app."
              width={650}
              height={1315}
              className="w-full h-auto object-contain"
              priority
            />
          </motion.div>

          {/* === The Card ("-") === */}
          {/* Sits on the left, holds the text. */}
          <div className="relative z-10 w-full rounded-3xl bg-[#0c0c0c] border border-gray-800 py-7 pl-10 ">
            <div className="flex flex-col items-start text-left">
              <h2
                id="app-mockup-heading"
                className="text-4xl md:text-5xl font-extrabold text-white leading-tight break-words max-w-md whitespace-pre-line"
              >
                Swap Smart, On the Go
              </h2>
              <p className="mt-6 text-lg text-gray-400 max-w-md break-words whitespace-pre-line">
                The BankiiSwap app is engineered for speed and clarity. Scan best
                routes, save favorites, and swap in seconds with a clean,
                mobile-first UI.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/swap" className="btn-primary">
                  Open Swap
                </Link>
                <Link href="#security-vault" className="btn-secondary">
                  Learn more
                </Link>
              </div>
            </div>
          </div>

          {/* === The Image ("I") - Desktop Only === */}
          {/* Floats on top (z-20), on the right, and breaks out */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="hidden md:block absolute z-20 w-[65%] right-0 top-0 -mt-32"
          >
            <Image
              src="/assets/landing/app-mockup-angled-right.png"
              alt="A premium mockup of the BankiiSwap app."
              width={650}
              height={1315}
              className="w-full h-auto object-contain"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
