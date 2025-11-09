import Image from 'next/image';

export function DappFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-darker border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex flex-col space-y-16">
          
          {/* Block 1: Links & Powered By */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand + Tagline */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image 
                  src="/assets/logos/bankii-logo.jpg" 
                  alt="BankiiSwap Logo" 
                  width={40} 
                  height={40} 
                  className="rounded-lg" 
                />
                <span className="text-xl font-heading font-bold text-white">BankiiSwap</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Powered by{' '}
                <a 
                  href="https://jup.ag" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-bankii-blue-light hover:underline"
                >
                  Jupiter
                </a>
              </p>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white/90 font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/legal/terms" className="text-neutral-400 hover:text-bankii-blue-light text-sm transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/legal/privacy" className="text-neutral-400 hover:text-bankii-blue-light text-sm transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/legal/disclaimer" className="text-neutral-400 hover:text-bankii-blue-light text-sm transition-colors">
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="text-white/90 font-semibold mb-4">Community</h4>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://t.me/bankiiswap" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-bankii-blue-light text-sm transition-colors"
                  >
                    Telegram
                  </a>
                </li>
                <li>
                  <a 
                    href="https://x.com/bankiiswap" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-bankii-blue-light text-sm transition-colors"
                  >
                    X (Twitter)
                  </a>
                </li>
              </ul>
            </div>

            {/* Ecosystem */}
            <div>
              <h4 className="text-white/90 font-semibold mb-4">Ecosystem</h4>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://bankii.finance" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-bankii-blue-light text-sm transition-colors"
                  >
                    Bankii Finance
                  </a>
                </li>
                <li>
                  <a href="/swap" className="text-neutral-400 hover:text-bankii-blue-light text-sm transition-colors">
                    Swap
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Block 2: Disclaimer */}
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-neutral-400 leading-relaxed">
              Trading cryptocurrencies involves significant risk. Values can be volatile and you may lose all capital. 
              Nothing on BankiiSwap constitutes financial advice. Always do your own research.
            </p>
          </div>

          {/* Block 3: The Stroked Brandmark (The "Aha" Moment) */}
          <div className="text-center">
            <h2 
              className="text-6xl md:text-8xl font-heading font-extrabold select-none [-webkit-text-stroke:1px_#00A6FF] [text-stroke:1px_#00A6FF] text-transparent"
              aria-label="BankiiSwap"
            >
              BankiiSwap
            </h2>
          </div>

          {/* Block 4: Copyright & Credits */}
          <div className="text-center">
            <p className="text-xs text-neutral-500">
              © {currentYear} BankiiSwap. All rights reserved.
            </p>
            <p className="text-xs text-neutral-500 mt-2">
              Built by <span className="text-neutral-400">Ticoworld</span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}