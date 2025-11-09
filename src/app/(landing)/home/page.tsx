import type { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import ValuePropSection from "@/components/landing/ValuePropSection";
import BrandVisualSection from "@/components/landing/BrandVisualSection";
import SecurityVault from "@/components/landing/SecurityVault";
import AppMockup from "@/components/landing/AppMockup";
import TokenSpotlight from "@/components/landing/TokenSpotlight";
import VisaCTA from "@/components/landing/VisaCTA";

export const metadata: Metadata = {
  title: "BankiiSwap | Swap $BNKY & Solana Tokens with Best Rates",
  description:
    "The official DEX for the Bankii ecosystem. Audited, secure, and connected to Bankii Finance.",
  openGraph: {
    title: "BankiiSwap | Swap $BNKY & Solana Tokens with Best Rates",
    description:
      "The official DEX for the Bankii ecosystem. Audited, secure, and connected to Bankii Finance.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BankiiSwap | Swap $BNKY & Solana Tokens with Best Rates",
    description:
      "The official DEX for the Bankii ecosystem. Audited, secure, and connected to Bankii Finance.",
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
