import Image from "next/image";
import React from "react";
import { ShieldCheck, Bug, Code } from "lucide-react";

interface SecurityFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SecurityFeature: React.FC<SecurityFeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="flex gap-4 items-start">
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        {React.cloneElement(icon as React.ReactElement, {
          className: "w-6 h-6 text-bankii-blue",
        })}
      </div>
      {/* Text */}
      <div>
        <h4 className="text-xl font-bold font-heading mb-1">{title}</h4>
        <p className="text-bankii-grey">{description}</p>
      </div>
    </div>
  );
};

export default function SecurityVault() {
  return (
    <section className="bg-black py-24 relative overflow-hidden" data-aos="fade-up">
      {/* Premium Glow Layer */}
      <div 
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,73,255,0.1),transparent_70%)]" 
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left: Visual Anchor */}
          <div data-aos="fade-up">
            <Image
              src="/assets/landing/visual-security-vault.png"
              alt="BankiiSwap Security Vault"
              width={500}
              height={500}
              className="w-full h-auto"
              priority={false}
            />
          </div>

          {/* Right: Text Proof */}
          <div data-aos="fade-up" data-aos-delay="200">
            {/* Heading */}
            <h2 className="text-4xl lg:text-5xl font-bold font-heading mb-4">
              Your security is our priority.
            </h2>
            {/* Sub-heading */}
            <p className="text-lg text-bankii-grey mb-12">
              We are built on a foundation of transparency and world-class security protocols to ensure your funds are always safe.
            </p>

            {/* Features */}
            <div className="flex flex-col gap-8">
              <SecurityFeature
                icon={<ShieldCheck />}
                title="Smart Contract Audits"
                description="All core contracts have been rigorously audited by top-tier security firms to protect against vulnerabilities."
              />

              <SecurityFeature
                icon={<Bug />}
                title="Continuous Bug Bounty"
                description="We run a permanent bug bounty program with Immunefi, rewarding white-hat hackers for keeping our ecosystem secure."
              />

              <SecurityFeature
                icon={<Code />}
                title="Verified & Open Source"
                description="Our program is fully on-chain and open-source, allowing anyone to verify our code and build with confidence."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
