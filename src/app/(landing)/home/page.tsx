import type { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import ValuePropSection from "@/components/landing/ValuePropSection";
import BrandVisualSection from "@/components/landing/BrandVisualSection";
import SecurityVault from "@/components/landing/SecurityVault";
import AppMockup from "@/components/landing/AppMockup";
import TokenSpotlight from "@/components/landing/TokenSpotlight";
import VisaCTA from "@/components/landing/VisaCTA";

export const metadata: Metadata = {
  title: "BankiiSwap – The DeFi Heart of the Bankii Ecosystem",
  description:
    "Swap, earn, and access exclusive $BKP benefits, all powered by Solana’s fastest liquidity network.",
  openGraph: {
    title: "BankiiSwap – The DeFi Heart of the Bankii Ecosystem",
    description:
      "Swap, earn, and access exclusive $BKP benefits, all powered by Solana’s fastest liquidity network.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BankiiSwap – The DeFi Heart of the Bankii Ecosystem",
    description:
      "Swap, earn, and access exclusive $BKP benefits, all powered by Solana’s fastest liquidity network.",
  },
};

/**
 * BankiiSwap Marketing Landing Page
 *
 * This is our professional marketing page at /home.
 * It showcases the product, builds trust, and drives conversions.
 *
 * Note: DappHeader and DappFooter are provided by the (landing) layout
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ValuePropSection />
      <BrandVisualSection />
      <SecurityVault />
      <AppMockup />
      <TokenSpotlight />
      <VisaCTA />
    </>
  );
}
