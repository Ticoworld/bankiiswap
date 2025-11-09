'use client';

import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';

interface PendingSwapModalProps {
  open: boolean;
  txHash?: string | null;
  onClose?: () => void; // optional, usually disabled while pending
}

export default function PendingSwapModal({ open, txHash, onClose }: PendingSwapModalProps) {
  if (!open) return null;
  const explorerUrl = txHash ? `https://solscan.io/tx/${txHash}?cluster=mainnet-beta` : undefined;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl w-[min(92%,100vw-2rem)] max-w-md p-6 shadow-2xl"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-bankii-blue" aria-hidden="true"></div>
          <h2 className="text-xl font-bold">Transaction Pending</h2>
        </div>
        <p className="text-gray-400 text-sm mb-4 animate-pulse">Your swap is being processed on-chain. This can take a few seconds.</p>

        {txHash ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-xs mb-4">
            <div className="text-gray-400 mb-1">Transaction</div>
            <div className="font-mono break-all text-gray-200">{txHash}</div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 mb-4">Awaiting signature or transaction id...</div>
        )}

        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-bankii-blue hover:text-bankii-blue/80"
          >
            View on Solscan <FaExternalLinkAlt className="ml-2 text-xs" />
          </a>
        )}

        {onClose && (
          <div className="mt-6 text-right">
            <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700">Close</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
