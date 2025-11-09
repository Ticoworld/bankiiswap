'use client';

import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmSwapModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromAmount: string;
  fromSymbol?: string;
  toAmount: string;
  toSymbol?: string;
  rateText?: string; // e.g., "1 SOL = 155.88 USDC"
  slippage: number; // percent
  priceImpact: number | null; // percent or null
  networkFeeText: string; // e.g., "0.000018 SOL"
  warning?: boolean; // High price impact warning
}

export default function ConfirmSwapModal({
  open,
  onClose,
  onConfirm,
  fromAmount,
  fromSymbol,
  toAmount,
  toSymbol,
  rateText,
  slippage,
  priceImpact,
  networkFeeText,
  warning = false,
}: ConfirmSwapModalProps) {
  if (!open) return null;
  
  // High price impact warning state
  const isHighImpact = warning && priceImpact !== null && priceImpact > 1.5;
  
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl w-[min(92%,100vw-2rem)] max-w-md p-6 shadow-2xl"
      >
        {/* Conditional Header: Normal or Warning */}
        {isHighImpact ? (
          <>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <FaExclamationTriangle className="text-yellow-500 text-sm" />
              </div>
              <h2 className="text-xl font-bold text-yellow-500">High Price Impact Warning</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              This swap has a <span className="text-yellow-500 font-semibold">{priceImpact}%</span> price impact, which may result in a poor trade. Proceed with caution.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-1">Confirm Swap</h2>
            <p className="text-gray-400 text-sm mb-4">Review the details before continuing</p>
          </>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">You Pay</span>
            <span className="font-medium">{fromAmount || '0.0'} {fromSymbol || ''}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">You Receive</span>
            <span className="font-medium">{toAmount || '0.0'} {toSymbol || ''}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Exchange Rate</span>
            <span className="font-medium">{rateText || '-'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Slippage</span>
            <span className="font-medium">{slippage}%</span>
          </div>
          {priceImpact !== null && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Price Impact</span>
              <span className={`font-medium ${priceImpact > 2 ? 'text-red-400' : 'text-green-400'}`}>{priceImpact}%</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Network Fee (est.)</span>
            <span className="font-medium text-bankii-blue">{networkFeeText}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`py-3 px-4 rounded-xl font-semibold transition-opacity ${
              isHighImpact
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white border-2 border-yellow-500'
                : 'bg-gradient-to-r from-accent-start to-accent-end text-white hover:opacity-90'
            }`}
          >
            {isHighImpact ? 'Swap Anyway' : 'Confirm Swap'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
