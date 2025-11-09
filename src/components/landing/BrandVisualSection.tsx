import React from "react";

/**
 * A full-width, 16:9 looping video section to showcase the
 * product's feel and add a premium "brand visual" element.
 */
const BrandVisualSection = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Container with rounded corners for the video */}
        <div className="overflow-hidden rounded-xl shadow-2xl">
          <video
            src="/assets/landing/swapvideo.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="aspect-video w-full object-cover"
            aria-label="BankiiSwap app demonstration video"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};

export default BrandVisualSection;
