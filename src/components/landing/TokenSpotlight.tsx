"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, TrendingUp, Unlock } from 'lucide-react';
import { BKP_TOKEN_ADDRESS } from '@/config/tokens';

interface UtilityProps {
  // Icons from lucide-react are React components that render an SVG.
  // Use a generic component type for SVG-based icon components.
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  align: 'left' | 'right';
}

// Reusable callout item shown around the token spotlight
const UtilityCallout: React.FC<UtilityProps> = ({ icon: Icon, title, description, align }) => {
  // On desktop, align text left/right. On mobile, align left.
  const textAlign = align === 'right' ? 'text-left lg:text-right' : 'text-left';
  const itemAlign = align === 'right' ? 'items-start lg:items-end' : 'items-start';

  return (
    <div
      className={`flex flex-col ${itemAlign} ${textAlign} 
        bg-white dark:bg-black/40 shadow-md dark:shadow-none border border-gray-200 dark:border-gray-800 rounded-2xl p-6 
        transition-all duration-300 
        hover:border-bankii-blue/50 hover:shadow-lg hover:shadow-bankii-blue/10`}
    >
      <Icon className="w-8 h-8 text-bankii-blue mb-4" />
      <h4 className="text-xl font-bold font-heading mb-2 text-gray-900 dark:text-white">{title}</h4>
      <p className="text-gray-600 dark:text-gray-400 max-w-xs">{description}</p>
    </div>
  );
};

const TokenSpotlight: React.FC = () => {
  const buyHref = `/swap?from=USDC&to=${encodeURIComponent(BKP_TOKEN_ADDRESS)}`;

  // Track scroll within this section for parallax effects
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax transforms
  const coinY = useTransform(scrollYProgress, [0, 1], [-150, 150]);
  const calloutLeftY = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const calloutRightY = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <section ref={sectionRef} className="bg-white dark:bg-black py-28 md:py-32 lg:py-40 relative overflow-hidden" data-aos="fade-up">
      {/* Subtle blue gradient at bottom for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bankii-blue/10 via-bankii-blue/5 to-transparent z-0" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center relative z-10"
      >
        {/* Spotlight grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center mb-24 w-full">
          {/* Left column */}
          <motion.div style={{ y: calloutLeftY }} className="flex flex-col gap-12">
            <UtilityCallout
              icon={Sparkles}
              title="Fee Discounts"
              description="Hold $BKP to save up to 50% on swap fees."
              align="right"
            />
          </motion.div>

          {/* Center coin */}
          <motion.div
            style={{ y: coinY }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="row-start-1 lg:row-start-auto"
          >
            <Image
              src="/assets/landing/visual-bkp-3d-coin.png"
              alt="$BKP Token"
              width={400}
              height={400}
              className="w-64 h-64 lg:w-full lg:h-auto max-w-sm mx-auto"
              priority
            />
          </motion.div>

          {/* Right column */}
          <motion.div style={{ y: calloutRightY }} className="flex flex-col gap-12">
            <UtilityCallout
              icon={TrendingUp}
              title="Staking Rewards"
              description="Stake $BKP to earn platform revenue and rewards."
              align="left"
            />
            <UtilityCallout
              icon={Unlock}
              title="Ecosystem Access"
              description="Unlock exclusive Bankii features, airdrops, and early beta access."
              align="left"
            />
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
};

export default TokenSpotlight;
