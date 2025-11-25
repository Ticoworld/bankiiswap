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
        <h4 className="text-xl font-bold font-heading mb-1 text-gray-900 dark:text-white">{title}</h4>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default function SecurityVault() {
  return (
    <section className="bg-white dark:bg-black py-24 relative overflow-hidden" data-aos="fade-up">
      {/* Premium Glow Layer */}
      <div 
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,73,255,0.1),transparent_70%)]" 
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
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
            <h2 className="text-4xl lg:text-5xl font-bold font-heading mb-4 text-gray-900 dark:text-white">
              BankiiSwap Security Vault
            </h2>
            {/* Sub-heading */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
              Built on transparency, trust, and top-tier security.
            </p>

            {/* Features */}
            <div className="flex flex-col gap-8">
              <SecurityFeature
                icon={<ShieldCheck />}
                title="Audited Smart Contracts"
                description="Verified by leading security firms to protect against vulnerabilities."
              />

              <SecurityFeature
                icon={<Bug />}
                title="Permanent Bug Bounty"
                description="Ongoing partnership with Immunefi to reward white-hat security research."
              />

              <SecurityFeature
                icon={<Code />}
                title="Open Source Verified"
                description="Every line of code is public and auditable."
              />
            </div>

            {/* Concluding statement */}
            <p className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-bankii-blue to-purple-500 mt-12">
              Security isn&apos;t optional. It&apos;s the foundation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
