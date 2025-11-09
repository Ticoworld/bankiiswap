"use client";

import React from "react";
import Image from "next/image";

// Premium final call-to-action with full-bleed background image
export default function FinalCTA() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/assets/landing/cta-background.png"
        alt="Call to action background"
        fill
        priority
        quality={100}
        className="object-cover z-10"
      />

      {/* Top blend: fade from black into the image to blend previous section */}
      <div className="absolute inset-x-0 top-0 h-24 md:h-32 bg-gradient-to-b from-black to-transparent z-15 pointer-events-none" />

      {/* Global subtle dark overlay to keep premium contrast on text */}
      <div className="absolute inset-0 bg-black/30 z-15 pointer-events-none" />

      {/* Content overlay */}
      <div
        className="relative z-20 flex flex-col items-center justify-center text-center py-20 px-4"
        data-aos="fade-in"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
          Swap Smart. Bank Better.
        </h2>
        <p className="text-lg md:text-xl text-bankii-grey mb-8">
          Get started with the Bankii ecosystem today.
        </p>
        <a href="/swap" className="btn-primary">Launch App</a>
      </div>
    </section>
  );
}
