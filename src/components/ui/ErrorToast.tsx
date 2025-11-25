'use client';

import { FaExternalLinkAlt } from 'react-icons/fa';

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
      <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{title}</div>
            <div className="text-xs mt-0.5 text-gray-700 dark:text-gray-300">
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
