'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-heading font-heading-bold mb-6"
        >
          BankiiSwap
        </motion.h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Swap $BNKY & Solana tokens with best rates via Jupiter aggregator
        </p>
        <Link 
          href="/swap"
          className="inline-block bg-gradient-to-r from-accent-start to-accent-end text-white font-semibold px-8 py-4 rounded-premium shadow-bankii hover:shadow-bankii-lg transition"
        >
          Launch App
        </Link>
      </section>

      {/* Value Props - 3 Cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900 rounded-card p-6 border border-gray-800">
            <h3 className="text-xl font-heading-bold mb-3">Jupiter Routing</h3>
            <p className="text-gray-400">Best prices via smart route optimization across all Solana DEXes</p>
          </div>
          <div className="bg-gray-900 rounded-card p-6 border border-gray-800">
            <h3 className="text-xl font-heading-bold mb-3">BNKY Utility</h3>
            <p className="text-gray-400">Reduced fees, staking rewards, and Bankii card integration</p>
          </div>
          <div className="bg-gray-900 rounded-card p-6 border border-gray-800">
            <h3 className="text-xl font-heading-bold mb-3">Bankii Ecosystem</h3>
            <p className="text-gray-400">
              Seamlessly connect with <a href="https://bankii.finance" className="text-accent-start hover:underline">Bankii Finance</a> wallet & crypto cards
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section (optional - fetch live data) */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-heading-bold mb-8">Live Stats</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-4xl font-bold text-accent-start mb-2">$--</div>
            <div className="text-gray-400">24h Volume</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent-start mb-2">--</div>
            <div className="text-gray-400">Total Swaps</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent-start mb-2">$--</div>
            <div className="text-gray-400">BNKY Price</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/legal/terms" className="hover:text-white">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
            <a href="https://bankii.finance" target="_blank" rel="noopener noreferrer" className="hover:text-white">Visit Bankii.finance</a>
          </div>
          <p>© 2025 BankiiSwap. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
