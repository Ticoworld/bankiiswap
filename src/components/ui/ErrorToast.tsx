'use client';

import { FaExternalLinkAlt, FaExclamationTriangle } from 'react-icons/fa';

interface ErrorToastProps {
  txId?: string;
  message?: string;
  title?: string;
}

export default function ErrorToast({ txId, message, title = 'Swap Failed' }: ErrorToastProps) {
  const explorerUrl = txId ? `https://solscan.io/tx/${txId}?cluster=mainnet-beta` : null;
  const defaultMessage = 'Your swap could not be confirmed. Please check the transaction on-chain.';

  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
          <FaExclamationTriangle className="w-4 h-4 text-red-400" aria-hidden="true" />
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-gray-300 mt-0.5">
          {message || defaultMessage}
        </div>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-red-400 hover:text-red-300 mt-2 transition-colors"
          >
            View on Solscan
            <FaExternalLinkAlt className="ml-1 h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
