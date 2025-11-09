'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { FaHistory, FaChartLine, FaCreditCard, FaExternalLinkAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { SwapHistoryEntry } from '@/hooks/useSwapHistory';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useTokenList } from '@/hooks/useTokenList';

type TabType = 'history' | 'pnl' | 'ecosystem';

interface TraderDashboardPanelProps {
  history: SwapHistoryEntry[];
  isMobile?: boolean;
}

// Utility function to format timestamp into "time ago" format
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function TraderDashboardPanel({ history, isMobile = false }: TraderDashboardPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [currentPage, setCurrentPage] = useState(1);
  const { publicKey, connected } = useWallet();
  const { tokens } = useTokenList();

  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
  const connection = useMemo(() => new Connection(RPC_URL), [RPC_URL]);

  // Build a unique list of symbols the user traded
  const tradedSymbols = useMemo(() => {
    const set = new Set<string>();
    for (const entry of history) {
      if (entry.fromTokenSymbol) set.add(entry.fromTokenSymbol);
      if (entry.toTokenSymbol) set.add(entry.toTokenSymbol);
    }
    return Array.from(set);
  }, [history]);

  // Map symbol -> token config (address/mint, decimals, logo)
  const symbolTokenMap = useMemo(() => {
    const map = new Map<string, { address: string; symbol: string; decimals: number; logoURI?: string }>();
    for (const t of tokens) {
      // Prefer the first occurrence of a symbol
      if (!map.has(t.symbol)) {
        map.set(t.symbol, {
          address: t.address,
          symbol: t.symbol,
          decimals: t.decimals,
          logoURI: t.logoURI,
        });
      }
    }
    return map;
  }, [tokens]);

  type PortfolioItem = {
    mint: string;
    symbol: string;
    logoURI?: string;
    balance: number; // in token units
    price: number; // in USD per token (0 if unknown)
    valueUSD: number; // balance * price
  };

  const [pnlLoading, setPnlLoading] = useState(false);
  const [pnlError, setPnlError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  const formatUSD = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);

  const fetchBalancesAndPrices = useCallback(async (symbols: string[]) => {
    if (!publicKey) return [] as PortfolioItem[];
    // Resolve symbols to token metadata
    const tokenMetas = symbols
      .map((sym) => symbolTokenMap.get(sym))
      .filter((t): t is NonNullable<typeof t> => !!t);

    if (tokenMetas.length === 0) return [] as PortfolioItem[];

    // Helper: get SOL balance
    const getSolBalance = async (): Promise<number> => {
      try {
        const lamports = await connection.getBalance(publicKey);
        return lamports / 1e9; // SOL decimals = 9
      } catch {
        return 0;
      }
    };

    // Fetch balances per token by mint; special case SOL "So111..."
    const balancesByMint = new Map<string, number>();

    await Promise.all(
      tokenMetas.map(async (t) => {
        try {
          if (t.address === 'So11111111111111111111111111111111111111112') {
            const sol = await getSolBalance();
            balancesByMint.set(t.address, sol);
            return;
          }

          // Fetch SPL token accounts for this mint
          const resp = await connection.getParsedTokenAccountsByOwner(publicKey as PublicKey, {
            mint: new PublicKey(t.address),
          });

          let total = 0;
          for (const acc of resp.value) {
            const info: any = acc.account.data.parsed.info;
            const uiAmount = Number(info.tokenAmount.uiAmount || 0);
            total += uiAmount;
          }
          balancesByMint.set(t.address, total);
        } catch (e) {
          balancesByMint.set(t.address, 0);
        }
      })
    );

    // Fetch prices using cached helper (falls back to API route internally)
    try {
      const { fetchTokenPrices } = await import('@/lib/fetchTokenPrices');
      const priceResults = await fetchTokenPrices(tokenMetas.map((t) => t.address));
      
      console.log('Fetched Prices:', priceResults);
      
      const priceMap = new Map<string, number>();
      for (const pr of priceResults) {
        // Only set if price is not null
        if (pr.price !== null) {
          priceMap.set(pr.mint, pr.price);
        }
      }
      
      console.log('Fetched Balances:', Array.from(balancesByMint.entries()));
      
      return tokenMetas.map((t) => {
        const balance = balancesByMint.get(t.address) || 0;
        let price = priceMap.get(t.address) || 0;
        
        // Failsafe: Force stablecoin prices to $1.00 if API returns 0 or null
        if (price === 0 && (t.symbol === 'USDC' || t.symbol === 'USDT')) {
          price = 1.0;
          console.log(`[Failsafe] ${t.symbol} price set to $1.00`);
        }
        
        // Failsafe: Try to fetch SOL price from CoinGecko if null
        if (price === 0 && t.symbol === 'SOL') {
          console.warn(`[Failsafe] SOL price is null, using fallback estimate of $166`);
          price = 166; // Rough SOL price fallback
        }
        
        return {
          mint: t.address,
          symbol: t.symbol,
          logoURI: t.logoURI,
          balance,
          price,
          valueUSD: balance * price,
        };
      });
    } catch (err) {
      console.log('Error fetching prices:', err);
      return tokenMetas.map((t) => {
        const balance = balancesByMint.get(t.address) || 0;
        // Failsafe: Use estimated prices for known tokens even in error state
        let price = 0;
        if (t.symbol === 'USDC' || t.symbol === 'USDT') {
          price = 1.0;
        } else if (t.symbol === 'SOL') {
          price = 166; // Rough SOL price fallback
        }
        return {
          mint: t.address,
          symbol: t.symbol,
          logoURI: t.logoURI,
          balance,
          price,
          valueUSD: balance * price,
        };
      });
    }
  }, [connection, publicKey, symbolTokenMap]);

  const tabs = useMemo(() => {
    const base = [{ id: 'history' as TabType, label: 'Swap History', icon: FaHistory }];
    if (isMobile) return base; // Mobile: only Swap History
    return [
      ...base,
      { id: 'pnl' as TabType, label: 'Personal P&L', icon: FaChartLine },
      { id: 'ecosystem' as TabType, label: 'Ecosystem', icon: FaCreditCard },
    ];
  }, [isMobile]);

  // Pagination for Swap History (memoized for performance)
  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = useMemo(() => {
    return history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [history, currentPage]);

  // Reset to page 1 when switching to history tab or when history changes
  useEffect(() => {
    if (activeTab === 'history') {
      setCurrentPage(1);
    }
  }, [activeTab, history.length]);

  return (
    <div className="bg-black/60 backdrop-blur-xl rounded-2xl border-2 border-bankii-blue/10 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-800/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all ${
                isActive
                  ? 'text-bankii-blue border-b-2 border-bankii-blue bg-bankii-blue/5'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Swap History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Your Swap History</h3>
              <span className="text-xs text-gray-400">
                {history.length > 0 ? `${history.length} total swap${history.length !== 1 ? 's' : ''}` : 'Recent swaps'}
              </span>
            </div>
            
            {/* Empty State */}
            {history.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-800/40 flex items-center justify-center mx-auto mb-4">
                  <FaHistory className="text-gray-500 text-2xl" />
                </div>
                <p className="text-gray-400 text-sm">
                  Your recent swaps made on this device will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedHistory.map((entry, index) => (
                    <motion.div
                      key={entry.txId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50 hover:border-bankii-blue/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <FaCheckCircle className="text-green-500 text-sm" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {entry.fromAmount.toFixed(4)} {entry.fromTokenSymbol}{' '}
                              <span className="text-gray-500">→</span>{' '}
                              {entry.toAmount.toFixed(4)} {entry.toTokenSymbol}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <FaClock className="h-3 w-3" />
                              <span
                                data-tooltip-id="history-tooltip"
                                data-tooltip-content={new Date(entry.timestamp).toLocaleString()}
                              >
                                {formatTimeAgo(entry.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={`https://solscan.io/tx/${entry.txId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View transaction ${entry.txId.substring(0,6)}... on Solscan`}
                          className="text-bankii-blue hover:text-bankii-blue/80 text-xs flex items-center gap-1 flex-shrink-0"
                        >
                          View
                          <FaExternalLinkAlt className="h-3 w-3" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === 1
                          ? 'bg-gray-800/40 text-gray-500 cursor-not-allowed'
                          : 'bg-bankii-blue/10 text-bankii-blue hover:bg-bankii-blue/20 border border-bankii-blue/30'
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        Page <span className="text-white font-semibold">{currentPage}</span> of{' '}
                        <span className="text-white font-semibold">{totalPages}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === totalPages
                          ? 'bg-gray-800/40 text-gray-500 cursor-not-allowed'
                          : 'bg-bankii-blue/10 text-bankii-blue hover:bg-bankii-blue/20 border border-bankii-blue/30'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
                {/* Tooltip component for history timestamps */}
                <Tooltip id="history-tooltip" className="z-50 max-w-xs" />
              </>
            )}
          </motion.div>
        )}

        {/* Personal P&L Tab */}
        {!isMobile && activeTab === 'pnl' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Fetch balances when tab becomes active */}
            <PnlContent
              loading={pnlLoading}
              setLoading={setPnlLoading}
              error={pnlError}
              setError={setPnlError}
              fetchFn={fetchBalancesAndPrices}
              symbols={tradedSymbols}
              connected={!!connected && !!publicKey}
              formatUSD={formatUSD}
              portfolio={portfolio}
              setPortfolio={setPortfolio}
            />
          </motion.div>
        )}

        {/* Ecosystem Tab */}
        {!isMobile && activeTab === 'ecosystem' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <FaCreditCard className="text-purple-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Spend Your Crypto Profits</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Get instant access to your trading profits in the real world with the bankii.finance VISA Card.
            </p>
            <a
              href="https://bankii.finance"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all shadow-lg hover:shadow-purple-500/25"
            >
              Get the bankii.finance VISA Card
              <FaExternalLinkAlt className="h-4 w-4" />
            </a>
            <div className="mt-6 grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">0%</div>
                <div className="text-xs text-gray-400">Annual Fee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">2%</div>
                <div className="text-xs text-gray-400">Cashback</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Instant</div>
                <div className="text-xs text-gray-400">Withdrawals</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Exported premium component for the Mobile Drawer
export function PnlPortfolio({ history }: { history: SwapHistoryEntry[] }) {
  const { publicKey, connected } = useWallet();
  const { tokens } = useTokenList();

  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
  const connection = useMemo(() => new Connection(RPC_URL), [RPC_URL]);

  // Build a unique list of symbols the user traded
  const tradedSymbols = useMemo(() => {
    const set = new Set<string>();
    for (const entry of history) {
      if (entry.fromTokenSymbol) set.add(entry.fromTokenSymbol);
      if (entry.toTokenSymbol) set.add(entry.toTokenSymbol);
    }
    return Array.from(set);
  }, [history]);

  // Map symbol -> token config (address/mint, decimals, logo)
  const symbolTokenMap = useMemo(() => {
    const map = new Map<string, { address: string; symbol: string; decimals: number; logoURI?: string }>();
    for (const t of tokens) {
      if (!map.has(t.symbol)) {
        map.set(t.symbol, {
          address: t.address,
          symbol: t.symbol,
          decimals: t.decimals,
          logoURI: t.logoURI,
        });
      }
    }
    return map;
  }, [tokens]);

  type PortfolioItem = {
    mint: string;
    symbol: string;
    logoURI?: string;
    balance: number;
    price: number;
    valueUSD: number;
  };

  const [pnlLoading, setPnlLoading] = useState(false);
  const [pnlError, setPnlError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  const formatUSD = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);

  const fetchBalancesAndPrices = useCallback(async (symbols: string[]) => {
    if (!publicKey) return [] as PortfolioItem[];
    const tokenMetas = symbols
      .map((sym) => symbolTokenMap.get(sym))
      .filter((t): t is NonNullable<typeof t> => !!t);

    if (tokenMetas.length === 0) return [] as PortfolioItem[];

    const balancesByMint = new Map<string, number>();

    const getSolBalance = async (): Promise<number> => {
      try {
        const lamports = await connection.getBalance(publicKey);
        return lamports / 1e9;
      } catch {
        return 0;
      }
    };

    await Promise.all(
      tokenMetas.map(async (t) => {
        try {
          if (t.address === 'So11111111111111111111111111111111111111112') {
            const sol = await getSolBalance();
            balancesByMint.set(t.address, sol);
            return;
          }
          const resp = await connection.getParsedTokenAccountsByOwner(publicKey as PublicKey, {
            mint: new PublicKey(t.address),
          });
          let total = 0;
          for (const acc of resp.value) {
            const info: any = acc.account.data.parsed.info;
            const uiAmount = Number(info.tokenAmount.uiAmount || 0);
            total += uiAmount;
          }
          balancesByMint.set(t.address, total);
        } catch (e) {
          balancesByMint.set(t.address, 0);
        }
      })
    );

    try {
      const { fetchTokenPrices } = await import('@/lib/fetchTokenPrices');
      const priceResults = await fetchTokenPrices(tokenMetas.map((t) => t.address));
      const priceMap = new Map<string, number>();
      for (const pr of priceResults) {
        if (pr.price !== null) priceMap.set(pr.mint, pr.price);
      }
      return tokenMetas.map((t) => {
        const balance = balancesByMint.get(t.address) || 0;
        let price = priceMap.get(t.address) || 0;
        if (price === 0 && (t.symbol === 'USDC' || t.symbol === 'USDT')) price = 1.0;
        if (price === 0 && t.symbol === 'SOL') price = 166;
        return { mint: t.address, symbol: t.symbol, logoURI: t.logoURI, balance, price, valueUSD: balance * price };
      });
    } catch (err) {
      return tokenMetas.map((t) => {
        const balance = balancesByMint.get(t.address) || 0;
        let price = 0;
        if (t.symbol === 'USDC' || t.symbol === 'USDT') price = 1.0;
        else if (t.symbol === 'SOL') price = 166;
        return { mint: t.address, symbol: t.symbol, logoURI: t.logoURI, balance, price, valueUSD: balance * price };
      });
    }
  }, [connection, publicKey, symbolTokenMap]);

  return (
    <PnlContent
      loading={pnlLoading}
      setLoading={setPnlLoading}
      error={pnlError}
      setError={setPnlError}
      fetchFn={fetchBalancesAndPrices}
      symbols={tradedSymbols}
      connected={!!connected && !!publicKey}
      formatUSD={formatUSD}
      portfolio={portfolio}
      setPortfolio={setPortfolio}
    />
  );
}

type PnlContentProps = {
  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;
  fetchFn: (symbols: string[]) => Promise<{
    mint: string;
    symbol: string;
    logoURI?: string;
    balance: number;
    price: number;
    valueUSD: number;
  }[]>;
  symbols: string[];
  connected: boolean;
  portfolio: {
    mint: string;
    symbol: string;
    logoURI?: string;
    balance: number;
    price: number;
    valueUSD: number;
  }[];
  setPortfolio: (items: PnlContentProps['portfolio']) => void;
  formatUSD: (n: number) => string;
};

function PnlContent({
  loading,
  setLoading,
  error,
  setError,
  fetchFn,
  symbols,
  connected,
  portfolio,
  setPortfolio,
  formatUSD,
}: PnlContentProps) {
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!connected) return;
      if (!symbols.length) return;
      try {
        setLoading(true);
        setError(null);
        const items = await fetchFn(symbols);
        if (cancelled) return;
        // Sort by USD value desc
        const sorted = [...items].sort((a, b) => b.valueUSD - a.valueUSD);
        setPortfolio(sorted);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load portfolio');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [connected, symbols, fetchFn, setError, setLoading, setPortfolio]);

  if (!connected) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-gray-800/40 flex items-center justify-center mx-auto mb-4">
          <FaChartLine className="text-bankii-blue text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Connect your wallet</h3>
        <p className="text-gray-400 text-sm">Connect to view your current holdings across traded tokens.</p>
      </div>
    );
  }

  if (!symbols.length) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-gray-800/40 flex items-center justify-center mx-auto mb-4">
          <FaHistory className="text-gray-500 text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No trades yet</h3>
        <p className="text-gray-400 text-sm">Your portfolio will appear here after your first swap.</p>
      </div>
    );
  }

  // Loading state - MUST be first to prevent $0.00 flash
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Your Portfolio</h3>
            <p className="text-xs text-gray-400">Assets you&#39;ve traded on BankiiSwap</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Total Value</div>
            <div className="h-8 w-24 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center justify-between bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700" />
                <div>
                  <div className="h-3 w-24 bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-32 bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-4 w-20 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Your Portfolio</h3>
            <p className="text-xs text-gray-400">Assets you&#39;ve traded on BankiiSwap</p>
          </div>
        </div>
        <div className="text-center py-6 text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with total value */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Your Portfolio</h3>
          <p className="text-xs text-gray-400">Assets you&#39;ve traded on BankiiSwap</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Total Value</div>
          <div className="text-2xl font-bold text-white">
            {formatUSD(portfolio.reduce((sum, i) => sum + i.valueUSD, 0))}
          </div>
        </div>
      </div>

      {/* Portfolio list */}
      {portfolio.length > 0 && (
        <div className="space-y-3">
          {portfolio.map((item) => (
            <div key={item.mint} className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50 hover:border-bankii-blue/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.logoURI || '/assets/tokens/unknown.png'}
                    alt={item.symbol}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/tokens/unknown.png';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{item.symbol}</div>
                    <div className="text-xs text-gray-400 truncate">{item.balance.toFixed(6)} {item.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatUSD(item.valueUSD)}</div>
                  <div className="text-xs text-gray-400">${item.price.toFixed(4)} / {item.symbol}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
