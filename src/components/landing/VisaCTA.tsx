"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaExchangeAlt, FaCreditCard, FaGlobe } from "react-icons/fa";

export default function VisaCTA() {
  return (
    <section className="relative py-24 overflow-hidden" data-aos="fade-up">
      {/* Subtle blue gradient at top for depth */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-bankii-blue/10 via-bankii-blue/5 to-transparent z-0" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] px-8 py-14 md:px-16 md:py-20"
        >
          <div
            aria-hidden
            className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#0049FF]/25 to-[#00A6FF]/10 blur-3xl hidden dark:block"
          />
          <div
            aria-hidden
            className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-gradient-to-tr from-[#00A6FF]/20 to-[#0049FF]/10 blur-3xl hidden dark:block"
          />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
            <div className="md:col-span-2">
              <h3 className="text-3xl md:text-4xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-bankii-blue to-purple-500">
                Swap → Spend → Simplify Your Finances
              </h3>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                Instantly swap on BankiiSwap and spend worldwide using your Bankii.finance VISA Card.
              </p>
              
              {/* Icon List */}
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <FaExchangeAlt className="text-bankii-blue w-5 h-5 flex-shrink-0" />
                  <span className="text-lg text-gray-700 dark:text-gray-300">Swap tokens to stablecoin</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCreditCard className="text-bankii-blue w-5 h-5 flex-shrink-0" />
                  <span className="text-lg text-gray-700 dark:text-gray-300">Load instantly to your Bankii Card</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-bankii-blue w-5 h-5 flex-shrink-0" />
                  <span className="text-lg text-gray-700 dark:text-gray-300">Spend globally online or in-store</span>
                </div>
              </div>
            </div>
            <div className="md:text-right">
              <a href="https://bankii.finance" target="_blank" rel="noreferrer" className="btn-primary">
                Get Your Bankii VISA Card
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
