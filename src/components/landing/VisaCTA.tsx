"use client";

import React from "react";
import { motion } from "framer-motion";

export default function VisaCTA() {
  return (
    <section className="relative py-24" data-aos="fade-up">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-gray-800 bg-[#0a0a0a] px-8 py-14 md:px-16 md:py-20"
        >
          <div
            aria-hidden
            className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#0049FF]/25 to-[#00A6FF]/10 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-gradient-to-tr from-[#00A6FF]/20 to-[#0049FF]/10 blur-3xl"
          />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
            <div className="md:col-span-2">
              <h3 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Spend Crypto Anywhere with the Bankii VISA Card
              </h3>
              <p className="mt-4 text-lg text-gray-400 max-w-2xl">
                Seamlessly swap on BankiiSwap and tap to pay with your linked Bankii.finance VISA Card.
                One ecosystem. Zero friction.
              </p>
            </div>
            <div className="md:text-right">
              <a href="https://bankii.finance" target="_blank" rel="noreferrer" className="btn-primary">
                Get the VISA Card
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
