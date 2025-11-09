'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { FaWallet, FaChevronDown } from 'react-icons/fa';

type PremiumWalletButtonProps = {
  onOpenDrawer: () => void;
  className?: string;
};

export default function PremiumWalletButton({ onOpenDrawer, className = '' }: PremiumWalletButtonProps) {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  // Helper to truncate wallet address
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleClick = () => {
    if (connected) {
      // When connected: open the dashboard drawer
      onOpenDrawer();
    } else {
      // When not connected: open wallet modal
      setVisible(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-bankii-blue text-white font-medium hover:bg-bankii-blue/90 transition-all duration-200 ${className}`}
    >
      <FaWallet className="h-4 w-4" />
      <span className="text-sm">
        {connected && publicKey ? truncateAddress(publicKey.toString()) : 'Connect Wallet'}
      </span>
      {connected && <FaChevronDown className="h-3 w-3 opacity-70" />}
    </button>
  );
}
