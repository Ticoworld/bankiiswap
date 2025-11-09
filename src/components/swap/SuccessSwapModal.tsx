'use client';

import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaCheck } from 'react-icons/fa';

interface SuccessSwapModalProps {
  open: boolean;
  onClose: () => void;
  onViewDetails?: () => void;
  txHash: string;
  fromAmount: string;
  fromSymbol?: string;
  toAmount: string;
  toSymbol?: string;
}

export default function SuccessSwapModal({
  open,
  onClose,
  onViewDetails,
  txHash,
  fromAmount,
  fromSymbol,
  toAmount,
  toSymbol,
}: SuccessSwapModalProps) {
  if (!open) return null;
  const explorerUrl = `https://solscan.io/tx/${txHash}?cluster=mainnet-beta`;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl w-[min(92%,100vw-2rem)] max-w-md p-6 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
            <FaCheck className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold">Swap Completed!</h2>
          <p className="text-gray-400 text-sm">Your transaction was confirmed on-chain</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">You Paid</span>
            <span className="font-medium">{fromAmount} {fromSymbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">You Received</span>
            <span className="font-medium">{toAmount} {toSymbol}</span>
          </div>
        </div>

        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-bankii-blue hover:text-bankii-blue/80 mb-4"
        >
          View on Solscan <FaExternalLinkAlt className="ml-2 text-xs" />
        </a>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={onViewDetails}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-accent-start to-accent-end text-white font-semibold hover:opacity-90 transition-opacity"
          >
            View Details
          </button>
        </div>
      </motion.div>
    </div>
  );
}
