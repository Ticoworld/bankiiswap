import Image from 'next/image';

export function DappFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-gray-800">
      {/* Block 1: Links Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand + Tagline */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image 
                src="/assets/logos/bankii-logo.jpg" 
                alt="BankiiSwap Logo" 
                width={32} 
                height={32} 
                className="rounded-lg" 
              />
              <span className="text-xl font-heading font-bold text-gray-900 dark:text-white">BankiiSwap</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Powered by{' '}
              <a 
                href="https://jup.ag" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-bankii-blue hover:underline font-medium"
              >
                Jupiter
              </a>
            </p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="/legal/terms" className="text-gray-600 dark:text-gray-400 hover:text-bankii-blue text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/legal/privacy" className="text-gray-600 dark:text-gray-400 hover:text-bankii-blue text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/legal/disclaimer" className="text-gray-600 dark:text-gray-400 hover:text-bankii-blue text-sm transition-colors">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Community</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://t.me/bankiiswap" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-bankii-blue text-sm transition-colors"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a 
                  href="https://x.com/bankiiswap" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-bankii-blue text-sm transition-colors"
                >
                  X (Twitter)
                </a>
              </li>
            </ul>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Ecosystem</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://bankii.finance" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-bankii-blue text-sm transition-colors"
                >
                  Bankii Finance
                </a>
              </li>
              <li>
                <a href="/swap" className="text-gray-600 dark:text-gray-400 hover:text-bankii-blue text-sm transition-colors">
                  Swap
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed text-center max-w-4xl mx-auto">
            Trading cryptocurrencies involves significant risk. Values can be volatile and you may lose all capital. 
            Nothing on BankiiSwap constitutes financial advice. Always do your own research.
          </p>
        </div>
      </div>

      {/* Block 2: THE BOLD BRAND STATEMENT - No extra background! */}
      <div className="relative py-24 px-6 overflow-hidden">
        <h2 
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[140px] 2xl:text-[180px] font-heading font-black text-center leading-none tracking-tight select-none uppercase"
          style={{
            color: 'transparent',
            WebkitTextStroke: '2px var(--color-bankii-blue)',
            letterSpacing: '-0.02em',
          }}
        >
          BANKIISWAP
        </h2>
      </div>

      {/* Block 3: Copyright - Minimal */}
      <div className="py-6 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-gray-500 dark:text-gray-600">
            © {currentYear} BankiiSwap. All rights reserved. • Built by <span className="text-gray-600 dark:text-gray-500">Ticoworld</span>
          </p>
        </div>
      </div>
    </footer>
  );
}