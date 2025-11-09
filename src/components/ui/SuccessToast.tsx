'use client';

import { FaExternalLinkAlt } from 'react-icons/fa';

interface SuccessToastProps {
  txHash: string;
  fromAmount: string;
  fromSymbol?: string;
  toAmount: string;
  toSymbol?: string;
}

export default function SuccessToast({ txHash, fromAmount, fromSymbol, toAmount, toSymbol }: SuccessToastProps) {
  const explorerUrl = `https://solscan.io/tx/${txHash}?cluster=mainnet-beta`;

  return (
    <div className="flex items-start gap-3">
      {/* Removed internal check icon container to avoid duplicate icons (toast system already provides one). */}
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">Swap Confirmed</div>
        <div
          className="text-xs text-gray-300 mt-0.5 whitespace-normal break-words leading-relaxed max-w-[280px]"
          title={`You swapped ${fromAmount} ${fromSymbol} for ${toAmount} ${toSymbol}`}
        >
          You swapped {fromAmount} {fromSymbol} for {toAmount} {toSymbol}
        </div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-bankii-blue hover:text-bankii-blue/80 mt-2"
        >
          View transaction
          <FaExternalLinkAlt className="ml-1 h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
