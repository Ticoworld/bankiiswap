// src/lib/wallet/adapter.tsx - Minor clean-up recommended
"use client";

import { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider as BaseWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

require("@solana/wallet-adapter-react-ui/styles.css");

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Use the standard wallet adapters.
  // We no longer manually instantiate adapters here to avoid issues with missing extensions (like Solflare) crashing the app.
  // The wallet adapter library now supports the Wallet Standard, which automatically detects installed wallets.
  const wallets = useMemo(
    () => [
      // You can still manually add adapters if needed, but for Phantom and Solflare,
      // the standard detection is usually robust enough and avoids "not found" errors.
      // If you specifically want to support legacy versions, you can add them back,
      // but let's try standard detection first to fix the crashes.
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <BaseWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </BaseWalletProvider>
    </ConnectionProvider>
  );
}
