'use client';

import React from 'react';
import Marquee from 'react-fast-marquee';
import Image from 'next/image';

// Define our list of ecosystem partners
const logos: { src: string; alt: string }[] = [
  { src: '/assets/partners/solana.svg', alt: 'Solana' },
  { src: '/assets/partners/phantom.svg', alt: 'Phantom' },
  { src: '/assets/partners/jupiter.svg', alt: 'Jupiter' },
  { src: '/assets/partners/raydium.svg', alt: 'Raydium' },
  { src: '/assets/partners/coingecko.svg', alt: 'CoinGecko' },
];

const TrustBar: React.FC = () => {
  return (
    // This now "floats" on the bottom of the hero
    <section
      className="absolute bottom-0 left-0 right-0 z-40 py-12 "
    >
      <div className="container mx-auto px-4">
        {/* Title Badge */}
       

        {/* The Marquee */}
        <Marquee gradient={false} speed={40} pauseOnHover={true}>
          {/* We render the list multiple times for a seamless loop */}
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <div key={index} className="mx-16 flex items-center">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={32}
                className="object-contain h-8 w-auto grayscale opacity-70 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
              />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default TrustBar;
