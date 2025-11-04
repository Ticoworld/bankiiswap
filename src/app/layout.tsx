import "./globals.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import GlobalLoader from "@/components/ui/Loader";
import RouteLoader from "@/components/ui/RouteLoader";
import Providers from "./providers";
import StructuredData from "@/components/common/StructuredData";
import MobileQuickNav from "@/components/navigation/MobileQuickNav";

// Font setup - Poppins for headings, Inter for body
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['400', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "BankiiSwap | Swap $BNKY & Solana Tokens",
  description: "Swap $BNKY and Solana tokens with best rates via Jupiter. Part of Bankii Finance.",
  keywords: [
    "BankiiSwap",
    "BNKY token",
    "Solana DEX",
    "Jupiter aggregator",
    "crypto banking",
    "Bankii Finance",
    "Solana trading",
    "DeFi swap",
    "decentralized exchange",
    "token swap",
    "Solana ecosystem"
  ],
  authors: [{ name: "Bankii Finance Team" }],
  creator: "Bankii Finance",
  publisher: "Bankii Finance",
  metadataBase: new URL('https://bankiiswap.com'),
  alternates: {
    canonical: 'https://bankiiswap.com',
  },
  openGraph: {
    title: "BankiiSwap | Swap $BNKY & Solana Tokens",
    description: "Swap $BNKY and Solana tokens with best rates via Jupiter. Part of Bankii Finance.",
    url: 'https://bankiiswap.com',
    siteName: 'BankiiSwap',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/assets/logos/bankii-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'BankiiSwap Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "BankiiSwap | Swap $BNKY & Solana Tokens",
    description: "Swap $BNKY and Solana tokens with best rates via Jupiter. Part of Bankii Finance.",
    images: ['/assets/logos/bankii-logo.jpg'],
    creator: '@BankiiFinance',
    site: '@BankiiFinance',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'tZ2akjagY2P18ftTb_cyRKWwmmmg1NnTBsVmcXfYL2M', 
  },
  
  category: 'DeFi',
  classification: 'Decentralized Finance',
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/favicon-16x16.png",
  },
}; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
              try{
                var d=document.documentElement;var m=localStorage.getItem('bankii_pref_theme')||'system';
                if(m==='dark'){d.classList.add('dark');}
                else if(m==='light'){d.classList.remove('dark');}
                else{var prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;d.classList.toggle('dark',!!prefersDark);} 
              }catch(e){}
            })();
          `}}
        />
        <StructuredData />
      </head>
      <body className={`${inter.className} bg-white text-neutral-900 dark:bg-black dark:text-white`}>
        <Providers>
          <GlobalLoader />
          <RouteLoader />
          {children}
          <MobileQuickNav />
        </Providers>
      </body>
    </html>
  );
}
