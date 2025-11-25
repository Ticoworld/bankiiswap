// src/components/swap/SwapForm.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import TokenSelector from './TokenSelector';
import Settings from './Settings';
import SwapButton from './SwapButton';
import { Token, BKP_TOKEN, DEFAULT_INPUT_TOKEN, DEFAULT_OUTPUT_TOKEN } from '@/config/tokens';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTokenList } from '@/hooks/useTokenList';
import { useSwap } from '@/hooks/useSwap';
import { getQuote, isValidQuote } from '@/lib/jupiter';
import { toSmallestUnit, fromSmallestUnit } from '@/lib/utils';
import { Connection, PublicKey } from '@solana/web3.js';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaExchangeAlt, FaFire, FaInfoCircle, FaShare, FaChartBar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { QuoteLoader, BalanceSkeleton, SwapPreviewSkeleton, TokenSelectorSkeleton, AmountSkeletonLoader } from '@/components/ui/SkeletonLoader';
import NetworkStatus from '@/components/ui/NetworkStatus';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { toast } from 'react-hot-toast';
import { trackSwapError, trackSwapSuccess } from '@/lib/analytics-lite';
import ConfirmSwapModal from '@/components/swap/ConfirmSwapModal';
import PendingSwapModal from '@/components/swap/PendingSwapModal';
// Success modal will be replaced by a premium toast notification
// import SuccessSwapModal from '@/components/swap/SuccessSwapModal';
import SuccessToast from '@/components/ui/SuccessToast';
import ErrorToast from '@/components/ui/ErrorToast';
import TraderDashboardPanel from '@/components/swap/TraderDashboardPanel';
import { useSwapHistory } from '@/hooks/useSwapHistory';

export default function SwapForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { publicKey, connected } = useWallet();
  const { tokens, loading: tokensLoading } = useTokenList();
  const { performSwap, swapError } = useSwap(); // ✅ include swapError
  const { history, addSwapToHistory } = useSwapHistory();

  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
  // Extended confirmation timeout to reduce false negatives on background confirmations
  const connection = useMemo(
    () =>
      new Connection(RPC_URL, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 90000, // 90 seconds
      }),
    [RPC_URL]
  );
  const referralAccount = process.env.NEXT_PUBLIC_REFERRAL_ACCOUNT;

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromTokenLoading, setFromTokenLoading] = useState(false);
  const [toTokenLoading, setToTokenLoading] = useState(false);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [quote, setQuote] = useState<any>(null);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [platformFee, setPlatformFee] = useState(0);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [toBalance, setToBalance] = useState<number | null>(null);
  const [toBalanceLoading, setToBalanceLoading] = useState(false);
  const [showSwapPreview, setShowSwapPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingTxHash, setPendingTxHash] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Success modal is removed in favor of toasts
  // const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Detect mobile viewport width (tailwind md breakpoint at 768px)
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Generate shareable URL for current swap configuration
  const generateShareURL = useCallback(() => {
    if (!fromToken || !toToken) return '';
    
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams();
    
    // Use both mint addresses and symbols for maximum compatibility
    params.set('inputMint', fromToken.address);
    params.set('outputMint', toToken.address);
    params.set('from', fromToken.symbol);
    params.set('to', toToken.symbol);
    
    if (fromAmount && parseFloat(fromAmount) > 0) {
      params.set('amount', fromAmount);
    }
    
    return `${baseURL}/swap?${params.toString()}`;
  }, [fromToken, toToken, fromAmount]);

  // Handle share button click
  const handleShare = async () => {
    const shareURL = generateShareURL();
    if (!shareURL) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Swap ${fromToken?.symbol} for ${toToken?.symbol} on BankiiSwap`,
          text: `Check out this swap on BankiiSwap!`,
          url: shareURL
        });
      } else {
        await navigator.clipboard.writeText(shareURL);
        toast.success('Swap link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareURL);
        toast.success('Swap link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
        toast.error('Failed to share link');
      }
    }
  };

  useEffect(() => {
    // Check if URL parameters exist to avoid default token flash
    const hasUrlParams = searchParams.get('inputMint') || searchParams.get('outputMint') || 
                         searchParams.get('from') || searchParams.get('to');
    
    if (tokens.length > 0 && !fromToken && !hasUrlParams) {
      // Set default input token (BKP)
      setFromToken(DEFAULT_INPUT_TOKEN);
    }
    if (tokens.length > 0 && !toToken && DEFAULT_OUTPUT_TOKEN && !hasUrlParams) {
      // Set default output token (USDC)
      setToToken(DEFAULT_OUTPUT_TOKEN);
    }
  }, [tokens, fromToken, toToken, searchParams]);

  // Smart token lookup function for unknown addresses
  const findOrFetchToken = useCallback(async (address: string, isFromToken: boolean = true): Promise<Token | null> => {
    // First, try to find in existing tokens
    const existing = tokens.find(t => t.address === address);
    if (existing) return existing;

    // If not found and looks like a valid Solana address, try DexScreener
    if (address.length >= 32 && /^[A-Za-z0-9]{32,}$/.test(address)) {
      try {
        // Set loading state
        if (isFromToken) {
          setFromTokenLoading(true);
        } else {
          setToTokenLoading(true);
        }

        const response = await fetch(`/api/tokens/search?q=${address}`);
        if (response.ok) {
          const token = await response.json();
          
          // Add to global token list for future use (avoid repeated API calls)
          const updatedTokens = [...tokens, token];
          
          return token;
        }
      } catch (error) {
        // Token lookup failed
      } finally {
        // Clear loading state
        if (isFromToken) {
          setFromTokenLoading(false);
        } else {
          setToTokenLoading(false);
        }
      }
    }
    
    return null;
  }, [tokens]);

  // Handle URL parameters for pre-filled swaps with smart lookup
  useEffect(() => {
    if (tokens.length === 0) return;

    const handleUrlParams = async () => {
      const inputMint = searchParams.get('inputMint');
      const outputMint = searchParams.get('outputMint'); 
      const fromSymbol = searchParams.get('from');
      const toSymbol = searchParams.get('to');
      const amount = searchParams.get('amount');

      // Handle inputMint parameter with smart lookup (highest priority)
      if (inputMint && !fromToken) {
        const token = await findOrFetchToken(inputMint, true);
        if (token) {
          setFromToken(token);
        } else {
          // Fallback to symbol if mint address fails
          if (fromSymbol) {
            const symbolToken = tokens.find(t => t.symbol.toLowerCase() === fromSymbol.toLowerCase());
            if (symbolToken) {
              setFromToken(symbolToken);
            }
          }
        }
      } else if (fromSymbol && !fromToken && !inputMint) {
        // Handle from parameter (symbol-based) only if no inputMint
        const token = tokens.find(t => t.symbol.toLowerCase() === fromSymbol.toLowerCase());
        if (token) {
          setFromToken(token);
        }
      }

      // Handle outputMint parameter with smart lookup (highest priority)
      if (outputMint && !toToken) {
        const token = await findOrFetchToken(outputMint, false);
        if (token) {
          setToToken(token);
        } else {
          // Fallback to symbol if mint address fails
          if (toSymbol) {
            const symbolToken = tokens.find(t => t.symbol.toLowerCase() === toSymbol.toLowerCase());
            if (symbolToken) {
              setToToken(symbolToken);
            }
          }
        }
      } else if (toSymbol && !toToken && !outputMint) {
        // Handle to parameter (symbol-based) only if no outputMint
        const token = tokens.find(t => t.symbol.toLowerCase() === toSymbol.toLowerCase());
        if (token) {
          setToToken(token);
        }
      }

      // Handle amount parameter
      if (amount && !fromAmount) {
        setFromAmount(amount);
      }
    };

    handleUrlParams();
  }, [tokens, searchParams, fromToken, toToken, fromAmount, findOrFetchToken]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey || !fromToken) {
        setBalance(null);
        return;
      }

      try {
        setBalanceLoading(true);
        let currentBalance: number;

        if (fromToken.symbol === 'SOL') {
          const lamports = await connection.getBalance(publicKey);
          currentBalance = fromSmallestUnit(BigInt(lamports), 9);
        } else {
          const tokenAccounts = await connection.getTokenAccountsByOwner(
            publicKey,
            { mint: new PublicKey(fromToken.address) }
          );

          if (tokenAccounts.value.length > 0) {
            const tokenAccountInfo = await connection.getParsedAccountInfo(
              tokenAccounts.value[0].pubkey
            );
            if (tokenAccountInfo.value && (tokenAccountInfo.value.data as any).parsed) {
              const parsedData = (tokenAccountInfo.value.data as any).parsed.info;
              currentBalance = parseFloat(parsedData.tokenAmount.uiAmountString);
            } else {
              currentBalance = 0;
            }
          } else {
            currentBalance = 0;
          }
        }
        setBalance(currentBalance);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch balance', error);
        }
        setBalance(0);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey, fromToken, connection]);

  // Fetch balance for "to" token
  useEffect(() => {
    const fetchToBalance = async () => {
      if (!publicKey || !toToken) {
        setToBalance(null);
        return;
      }

      try {
        setToBalanceLoading(true);
        let currentBalance: number;

        if (toToken.symbol === 'SOL') {
          const lamports = await connection.getBalance(publicKey);
          currentBalance = fromSmallestUnit(BigInt(lamports), 9);
        } else {
          const tokenAccounts = await connection.getTokenAccountsByOwner(
            publicKey,
            { mint: new PublicKey(toToken.address) }
          );

          if (tokenAccounts.value.length > 0) {
            const tokenAccountInfo = await connection.getParsedAccountInfo(
              tokenAccounts.value[0].pubkey
            );
            if (tokenAccountInfo.value && (tokenAccountInfo.value.data as any).parsed) {
              const parsedData = (tokenAccountInfo.value.data as any).parsed.info;
              currentBalance = parseFloat(parsedData.tokenAmount.uiAmountString);
            } else {
              currentBalance = 0;
            }
          } else {
            currentBalance = 0;
          }
        }
        setToBalance(currentBalance);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch to token balance', error);
        }
        setToBalance(0);
      } finally {
        setToBalanceLoading(false);
      }
    };

    fetchToBalance();
    const interval = setInterval(fetchToBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey, toToken, connection]);

  useEffect(() => {
    if (fromToken && toToken && fromToken.address === toToken.address) {
      const temp = fromToken;
      setFromToken(toToken);
      setToToken(temp);
    }
  }, [fromToken, toToken]);

  // Helper to parse common Jupiter errors into friendly messages
  const parseQuoteError = (errorMessage: string, fromToken: Token | null): string => {
    const msg = errorMessage.toLowerCase();
    
    if (msg.includes('not found in jupiter ecosystem')) {
      return `Token not found. The token ${fromToken?.symbol || 'you selected'} is not supported by our liquidity routes.`;
    }
    if (msg.includes('no valid route found') || msg.includes('no trading route')) {
      return 'No trading route available for this token pair. Tokens may lack sufficient liquidity or be restricted.';
    }
    if (msg.includes('network error') || msg.includes('econnrefused') || msg.includes('timeout')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Default fallback for unknown errors
    return 'Failed to fetch quote. Please try again.';
  };

  const fetchQuote = useCallback(async () => {
    // --- FIX: Clear error at the VERY beginning ---
    setError(null);

    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      setQuote(null);
      setPriceImpact(null);
      setPlatformFee(0);
      return;
    }

    const fromAmountNum = parseFloat(fromAmount);

    if (balance !== null && fromAmountNum > 0) {
      // Calculate required balance: swap amount + platform fee (0.3%)
      const platformFee = fromAmountNum * 0.003;
      const totalRequired = fromAmountNum + platformFee;
      
      if (totalRequired > balance) {
        // Check if this is very close due to rounding (within 0.000001)
        const difference = totalRequired - balance;
        if (difference > 0.000001) {
          setError(`Insufficient ${fromToken.symbol} balance. You have ${balance.toFixed(6)} ${fromToken.symbol} but need ${totalRequired.toFixed(6)} (including 0.3% fees)`);
          setToAmount('');
          setQuote(null);
          setPriceImpact(null);
          setPlatformFee(0);
          return;
        }
      }
    }

    try {
      // ✅ Set loading state FIRST to trigger skeleton loader immediately
      setQuoteLoading(true);
      setToAmount(''); // ✅ Clear previous amount to prevent stale data
      setQuote(null); // ✅ Clear previous quote
      
      const amount = toSmallestUnit(parseFloat(fromAmount), fromToken.decimals).toString();
      
      // ⚡ SPEED OPTIMIZATION: Cache key for quote requests
      const cacheKey = `${fromToken.address}-${toToken.address}-${amount}-${slippage}`;
      
      // ⚡ SPEED OPTIMIZATION: Parallel processing for quote and price data
      const quotePromise = getQuote(fromToken.address, toToken.address, amount, slippage, referralAccount || '');
      
      let quote;
      try {
        quote = await quotePromise;
      } catch (error: any) {
        if (!navigator.onLine) {
          setError('Network disconnected. Please check your connection and try again.');
        } else if (error.code === 'ECONNABORTED' || error.message?.includes('NetworkError')) {
          setError('Network error. Please try again.');
        } else {
          setError(error.message || 'Failed to fetch quote');
        }
        setQuoteLoading(false);
        return;
      }

      if (!isValidQuote(quote)) {
        setError('No valid route found for this swap');
        setQuoteLoading(false);
        return;
      }

      const output = fromSmallestUnit(BigInt(quote.outAmount), toToken.decimals);

      setToAmount(output.toFixed(6));
      setQuote(quote);

      if (quote.priceImpactPct) {
        setPriceImpact(parseFloat((parseFloat(quote.priceImpactPct) * 100).toFixed(2)));
      }

      // ⚡ SPEED OPTIMIZATION: Pre-calculate fees
      const platformFeeAmount = parseFloat(fromAmount) * 0.003;
      setPlatformFee(platformFeeAmount);
    } catch (err: any) {
      // Use our new helper to create a friendly message
      const friendlyError = parseQuoteError(err.message || '', fromToken);
      setError(friendlyError);
      
      // Reset the rest of the state
      setQuote(null);
      setToAmount('');
      setPriceImpact(null);
      setPlatformFee(0);
    } finally {
      setQuoteLoading(false);
    }
  }, [fromToken, toToken, fromAmount, slippage, referralAccount, balance]);

  useEffect(() => {
    const timeout = setTimeout(fetchQuote, 200); // ⚡ SPEED: Reduced from 300ms to 200ms for faster response
    return () => clearTimeout(timeout);
  }, [fetchQuote]);

  const handleSwap = async () => {
    if (!quote || !fromToken || !toToken || !publicKey) return;

    const fromAmountNum = parseFloat(fromAmount);
    if (balance === null || fromAmountNum > balance) {
      setError(`Insufficient ${fromToken.symbol} balance`);
      return;
    }

    const totalRequired = fromAmountNum + (fromAmountNum * 0.003);
    if (totalRequired > balance) {
      setError(`Not enough ${fromToken.symbol} for swap + fees`);
      return;
    }

    setIsConfirming(true);

    try {
      // ⚡ SPEED OPTIMIZATION: Start swap execution and logging in parallel
      const swapPromise = performSwap(quote, publicKey.toString(), referralAccount || '', connection);
      
      // ⚡ SPEED OPTIMIZATION: Pre-calculate USD values and start price fetch early
      const pricePromise = import('@/lib/fetchTokenPrices').then(({ fetchTokenPrices }) => 
        fetchTokenPrices([fromToken.address, toToken.address])
      );

      // Wait for swap to complete first
      const tx = await swapPromise;
  // Analytics: swap success (no PII)
  trackSwapSuccess(fromToken.symbol, toToken.symbol);

      // ⚡ SPEED OPTIMIZATION: Fire-and-forget analytics logging (don't block redirect)
      void (async () => {
        try {
          const prices = await pricePromise;
          const fromTokenPrice = prices.find(p => p.mint === fromToken.address)?.price || 0;
          const toTokenPrice = prices.find(p => p.mint === toToken.address)?.price || 0;

          const fromUsdValue = fromAmountNum * fromTokenPrice;
          const toUsdValue = parseFloat(toAmount) * toTokenPrice;
          const feesUsdValue = platformFee * fromTokenPrice;

          await fetch('/api/log-swap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: publicKey.toString(),
              fromToken: fromToken.symbol,
              toToken: toToken.symbol,
              fromAmount: fromAmountNum,
              toAmount: parseFloat(toAmount),
              fromUsdValue,
              toUsdValue,
              feesPaid: platformFee,
              feesUsdValue,
              signature: tx,
              blockTime: Math.floor(Date.now() / 1000),
              jupiterFee: 0,
              platformFee: platformFee,
              slippage: slippage / 100,
              routePlan: JSON.stringify(quote?.routePlan || {}),
              fee_token_symbol: fromToken.symbol,
              fee_token_mint: fromToken.address
            })
          });
        } catch (logError) {
          // Don't fail the swap if logging fails
          console.error('Failed to log swap:', logError);
        }
      })();

      // ⚡ SPEED OPTIMIZATION: Immediate redirect without waiting for analytics
      router.push(`/swap/tx/${tx}?fromToken=${fromToken.symbol}&toToken=${toToken?.symbol}&fromAmount=${fromAmount}&toAmount=${toAmount}`);
    } catch (err: any) {
      console.error('Swap execution error:', err);
      
      // Extract transaction ID if available (sometimes failed txs still have a signature)
      const txId = err?.signature || err?.txId || null;
      
      setError(err.message || 'Swap execution failed');
      
      // Show error toast with optional Solscan link
      toast.error(
        <ErrorToast
          txId={txId}
          message={err.message || 'Swap execution failed. Please try again.'}
        />,
        {
          duration: 8000,
        }
      );
      
      // Analytics: swap error (no PII)
      trackSwapError(err?.message);
    } finally {
      setIsConfirming(false);
    }
  };

  // New flow: Confirm -> Wallet -> Pending -> Success
  const beginConfirmedSwap = async () => {
    if (!quote || !fromToken || !toToken || !publicKey) return;

    setShowConfirmModal(false);
    setShowPendingModal(true);
    setPendingTxHash(null);

    // --- MODIFICATION: Moved price promise up ---
    // Start fetching prices now, so we have them by the time we log
    const pricePromise = import('@/lib/fetchTokenPrices').then(({ fetchTokenPrices }) =>
      fetchTokenPrices([fromToken.address, toToken.address])
    );
    const fromAmountNum = parseFloat(fromAmount);

    try {
      // --- STEP 1: Send the transaction ---
      const tx = await performSwap(quote, publicKey.toString(), referralAccount || '', connection);
      setPendingTxHash(tx);

      // --- STEP 2: OPTIMISTIC UI UPDATE (This is the "instant" part) ---
      setShowPendingModal(false); // Close the blocking modal IMMEDIATELY
      
      // Add swap to local history (ideally with a 'pending' status)
      addSwapToHistory({
        txId: tx,
        fromTokenSymbol: fromToken.symbol,
        fromAmount: fromAmountNum,
        toTokenSymbol: toToken.symbol,
        toAmount: parseFloat(toAmount),
        // status: 'pending', // Suggest adding a status to your history object
      });
      
      // Show an *instant* "Submitted" toast
      toast.success(
        <SuccessToast
          txHash={tx}
          fromAmount={fromAmount}
          fromSymbol={fromToken.symbol}
          toAmount={toAmount}
          toSymbol={toToken.symbol}
          message="Swap Submitted!"
        />,
        {
          duration: 6000,
        }
      );

      // Track the *submission* success
      trackSwapSuccess(fromToken.symbol, toToken.symbol);

      // --- STEP 3: FIRE-AND-FORGET LOGGING (No confirmation) ---
      // Log the swap optimistically without waiting for on-chain confirmation
      void (async () => {
        try {
          const prices = await pricePromise;
          const fromTokenPrice = prices.find(p => p.mint === fromToken.address)?.price || 0;
          const toTokenPrice = prices.find(p => p.mint === toToken.address)?.price || 0;
          const fromUsdValue = fromAmountNum * fromTokenPrice;
          const toUsdValue = parseFloat(toAmount) * toTokenPrice;
          const feesUsdValue = platformFee * fromTokenPrice;

          await fetch('/api/log-swap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: publicKey.toString(),
              fromToken: fromToken.symbol,
              toToken: toToken.symbol,
              fromAmount: fromAmountNum,
              toAmount: parseFloat(toAmount),
              fromUsdValue,
              toUsdValue,
              feesPaid: platformFee,
              feesUsdValue,
              signature: tx,
              blockTime: Math.floor(Date.now() / 1000),
              jupiterFee: 0,
              platformFee: platformFee,
              slippage: slippage / 100,
              routePlan: JSON.stringify(quote?.routePlan || {}),
              fee_token_symbol: fromToken.symbol,
              fee_token_mint: fromToken.address
            })
          });
        } catch (logError) {
          // Don't bother the user, just log this to console
          console.error('Background swap logging failed:', logError);
        }
      })();

      // --- End of main 'try' block ---
      // Notice all the blocking logic is gone!

    } catch (err: any) {
      // --- This block now only catches errors from performSwap (sending) ---
      console.error('Swap send error:', err);
      
      // Close pending modal
      setShowPendingModal(false);
      
      const txId = err?.signature || err?.txId || pendingTxHash || null;
      
      setError(err.message || 'Swap failed to send');
      
      // Show error toast
      toast.error(
        <ErrorToast
          txId={txId}
          message={err.message || 'Transaction failed to send. Please try again.'}
        />,
        {
          duration: 8000,
        }
      );
      
      // Analytics: swap error
      trackSwapError(err?.message);
    }
  };

  // Reset form after successful swap
  // Old success modal reset flow removed. We keep the form state to enable quick follow-up trades.

  const handleMaxClick = (percentage: number) => {
    if (balance === null || !connected) return;
    let maxAmount: number;
    
    if (percentage === 1) {
      // For MAX, calculate the actual maximum we can swap including the 0.3% fee
      // We need: swapAmount + (swapAmount * 0.003) <= balance
      // So: swapAmount * (1 + 0.003) <= balance
      // Therefore: swapAmount <= balance / 1.003
      maxAmount = balance / 1.003;
      
      // Add a tiny buffer to account for floating point precision
      maxAmount = maxAmount * 0.9999;
    } else {
      // For percentages, just take that percentage of balance
      // Users can manually adjust if they want exactly that percentage
      maxAmount = balance * percentage;
    }
    
    setFromAmount(maxAmount.toFixed(6));
    setError(null);
  };

  const handleSwapTokens = () => {
    if (!fromToken || !toToken) return;
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <>
    <div className="bg-white/90 dark:bg-black/60 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-2xl shadow-bankii-blue/5 w-full max-w-[calc(100vw-2rem)] sm:max-w-md border-2 border-gray-200 dark:border-bankii-blue/10 hover:border-bankii-blue/20 transition-all duration-300 mx-auto overflow-hidden">
      {/* Header with Network Status */}
      
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <h1 className="text-sm sm:text-base font-bold text-bankii-blue">
            Swap
          </h1>
          <NetworkStatus showLabel={false} className="hidden sm:flex" />
        </div>
        <div className="flex items-center space-x-2">
          <NetworkStatus showLabel={false} className="flex sm:hidden scale-90" />
          <Settings slippage={slippage} setSlippage={setSlippage} />
        </div>
      </div>

      {isConfirming ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bankii-blue mb-4"></div>
          <h3 className="text-lg font-medium mb-1 text-gray-900 dark:text-white">Confirming Swap</h3>
          <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400 text-sm">Approve the transaction in your wallet</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 sm:space-y-3"
        >
          {/* FROM */}
          <div className="bg-gray-50 dark:bg-black/40 backdrop-blur-md rounded-xl p-3 border-2 border-gray-200 dark:border-gray-800/50 hover:border-bankii-blue/30 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-600 dark:text-gray-600 dark:text-gray-400 text-sm font-medium">From</label>
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  className="text-xs bg-gray-100 dark:bg-black/60 border border-gray-300 dark:border-gray-800 hover:border-bankii-blue hover:bg-bankii-blue/10 text-gray-700 dark:text-gray-300 px-1.5 sm:px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-bankii-blue min-w-0 flex-shrink-0"
                  onClick={() => handleMaxClick(0.25)}
                  disabled={!balance || !connected}
                  aria-label="Use 25% of balance"
                >
                  25%
                </button>
                <button
                  className="text-xs bg-gray-100 dark:bg-black/60 border border-gray-300 dark:border-gray-800 hover:border-bankii-blue hover:bg-bankii-blue/10 text-gray-700 dark:text-gray-300 px-1.5 sm:px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-bankii-blue min-w-0 flex-shrink-0"
                  onClick={() => handleMaxClick(0.5)}
                  disabled={!balance || !connected}
                  aria-label="Use 50% of balance"
                >
                  50%
                </button>
                <button
                  className="text-xs bg-gray-100 dark:bg-black/60 border border-gray-300 dark:border-gray-800 hover:border-bankii-blue hover:bg-bankii-blue/10 text-gray-700 dark:text-gray-300 px-1.5 sm:px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-bankii-blue min-w-0 flex-shrink-0"
                  onClick={() => handleMaxClick(0.75)}
                  disabled={!balance || !connected}
                  aria-label="Use 75% of balance"
                >
                  75%
                </button>
                <button
                  className="text-xs bg-bankii-blue hover:bg-bankii-blue/90 text-white px-1.5 sm:px-2 py-1 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-bankii-blue border-2 border-bankii-blue min-w-0 flex-shrink-0"
                  onClick={() => handleMaxClick(1)}
                  disabled={!balance || !connected}
                  aria-label="Use maximum balance"
                >
                  MAX
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-1 overflow-hidden">
              <div className="flex-1 min-w-0">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-xl sm:text-2xl w-full outline-none placeholder:text-gray-500 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-0 min-w-0"
                  aria-label={`Enter amount to swap from ${fromToken?.symbol || 'selected token'}`}
                  disabled={!fromToken}
                  min="0"
                  step="any"
                  inputMode="decimal"
                />
              </div>
              <div className="flex-shrink-0 min-w-0">
                {fromTokenLoading ? (
                  <TokenSelectorSkeleton />
                ) : (
                  <TokenSelector
                    selectedToken={fromToken ?? undefined}
                    onSelect={setFromToken}
                    disabledTokens={toToken ? [toToken.address] : []}
                  />
                )}
              </div>
            </div>
            <div className="mt-2 text-sm">
              {balanceLoading ? (
                <BalanceSkeleton />
              ) : balance !== null ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 truncate">
                    Balance: {balance.toFixed(6)} {fromToken?.symbol || ''}
                  </span>
                  {balance > 0 && (
                    <button 
                      onClick={() => handleMaxClick(1)}
                      className="text-bankii-blue hover:text-bankii-blue/80 text-xs underline focus:outline-none focus:ring-2 focus:ring-bankii-blue rounded flex-shrink-0 ml-2"
                      aria-label={`Use maximum ${fromToken?.symbol} balance`}
                    >
                      Use Max
                    </button>
                  )}
                </div>
              ) : connected ? (
                <span className="text-gray-600 dark:text-gray-400">Balance: 0.0</span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">Balance: -</span>
              )}
            </div>
          </div>

          {/* SWAP ICON & SHARE */}
          <div className="flex justify-center items-center gap-4 -my-2 z-10 relative">
            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="bg-white dark:bg-black/60 border-2 border-gray-300 dark:border-gray-800 p-2 rounded-full text-bankii-blue hover:bg-bankii-blue/10 hover:border-bankii-blue transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-bankii-blue focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
              aria-label="Share swap link"
              disabled={!fromToken || !toToken}
            >
              <FaShare className="h-4 w-4" />
            </motion.button>

            {/* Flip Button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSwapTokens}
              className="bg-white dark:bg-black/60 border-2 border-bankii-blue p-2 rounded-full text-bankii-blue hover:bg-bankii-blue/10 hover:border-bankii-blue transition-all shadow-lg hover:shadow-bankii-blue/20 focus:outline-none focus:ring-2 focus:ring-bankii-blue focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
              aria-label="Swap token positions"
              disabled={!fromToken || !toToken}
            >
              <FaExchangeAlt className="h-5 w-5" />
            </motion.button>
          </div>

          {/* TO */}
          <div className="bg-gray-50 dark:bg-black/40 backdrop-blur-md rounded-xl p-3 border-2 border-gray-300 dark:border-gray-800/50 hover:border-bankii-blue/30 transition-colors">
            <div className="mb-2 text-gray-600 dark:text-gray-400 text-sm font-medium">To</div>
            <div className="flex items-center space-x-1 overflow-hidden">
              <div className="flex-1 min-w-0">
                  {quoteLoading ? (
                    <AmountSkeletonLoader />
                  ) : (
                    <input
                      type="text"
                      value={toAmount}
                      readOnly
                      className="bg-transparent text-xl sm:text-2xl w-full outline-none text-gray-700 dark:text-gray-300 cursor-not-allowed min-w-0"
                      placeholder="0.0"
                      aria-label={`Amount to receive in ${toToken?.symbol || 'selected token'}`}
                      tabIndex={-1}
                    />
                  )}
              </div>
              <div className="flex-shrink-0 min-w-0">
                {toTokenLoading ? (
                  <TokenSelectorSkeleton />
                ) : (
                  <TokenSelector
                    selectedToken={toToken ?? undefined}
                    onSelect={setToToken}
                    disabledTokens={fromToken ? [fromToken.address] : []}
                  />
                )}
              </div>
            </div>
            <div className="mt-2 text-sm">
              {toBalanceLoading ? (
                <BalanceSkeleton />
              ) : toBalance !== null ? (
                <span className="text-gray-600 dark:text-gray-400 truncate block">
                  Balance: {toBalance.toFixed(6)} {toToken?.symbol || ''}
                </span>
              ) : connected ? (
                <span className="text-gray-600 dark:text-gray-400">Balance: 0.0</span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">Balance: -</span>
              )}
            </div>
          </div>

          {/* INFO SECTION */}
          {quoteLoading && fromAmount && toAmount ? (
            <SwapPreviewSkeleton />
          ) : quote && fromToken && toToken ? (
            <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 text-sm space-y-2 overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Rate</span>
                <span className="font-medium text-right min-w-0 truncate">
                  {fromAmount && toAmount && !quoteLoading
                    ? `1 ${fromToken.symbol} = ${(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} ${toToken.symbol}`
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Slippage</span>
                <span className="font-medium">{slippage}%</span>
              </div>
              {priceImpact !== null && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1 min-w-0">
                    <span className="text-gray-600 dark:text-gray-400">Price Impact</span>
                    {priceImpact > 2 && (
                      <FaInfoCircle 
                        className="h-3 w-3 text-bankii-blue flex-shrink-0" 
                        title="High price impact warning"
                      />
                    )}
                  </div>
                  <span className={`font-medium ${priceImpact > 2 ? 'text-red-400' : 'text-green-400'}`}>
                    {priceImpact}%
                  </span>
                </div>
              )}
              <div className="border-t border-gray-800 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Network Fee</span>
                  <span className="text-bankii-blue text-xs font-medium text-right min-w-0 truncate">
                    {platformFee.toFixed(6)} {fromToken.symbol}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* BKP UTILITY NOTICE */}
          <div className="bg-bankii-blue/10 border-l-4 border-bankii-blue rounded-r-xl p-3 flex items-start backdrop-blur-sm overflow-hidden">
            <div className="p-1 mr-2 mt-0.5 flex-shrink-0">
              <FaFire className="h-4 w-4 text-bankii-blue" />
            </div>
            <p className="text-bankii-blue-light text-xs sm:text-sm min-w-0 break-words">
              Hold BKP tokens for reduced fees and exclusive utility benefits
            </p>
          </div>

          {/* ERROR & RETRY */}
          {error && (
            <ErrorDisplay
              error={error}
              onRetry={() => {
                setError(null);
                setQuoteLoading(true);
                fetchQuote();
              }}
              showRetry={true}
            />
          )}

          {/* SWAP BUTTON */}
          <SwapButton
            disabled={
              !quote ||
              !!error ||
              quoteLoading ||
              parseFloat(fromAmount) <= 0 ||
              (balance !== null && (parseFloat(fromAmount) + platformFee) > balance)
            }
            isLoading={quoteLoading}
            onClick={() => setShowConfirmModal(true)}
          />
        </motion.div>
      )}
  </div>

  {/* Trader Dashboard Toggle Button */}
  <div className="mt-4 w-full max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto">
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setIsHistoryVisible(!isHistoryVisible)}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all backdrop-blur-md bg-gray-100/80 hover:bg-gray-200 border border-gray-200 hover:border-bankii-blue/50 text-gray-700 dark:text-gray-300 dark:bg-gray-900/60 dark:hover:bg-gray-900/80 dark:border-gray-800"
    >
      <FaChartBar className={`h-4 w-4 transition-transform ${isHistoryVisible ? 'rotate-180' : ''}`} />
      <span className="text-sm font-medium">
        {isHistoryVisible ? 'Hide' : 'Show'} History & Analytics
      </span>
    </motion.button>
  </div>

  {/* Animated Trader Dashboard Panel */}
  <AnimatePresence>
    {isHistoryVisible && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="mt-4 w-full max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto overflow-hidden"
      >
        <TraderDashboardPanel history={history} isMobile={isMobile} />
      </motion.div>
    )}
  </AnimatePresence>

  {/* Modals */}
      <ConfirmSwapModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={beginConfirmedSwap}
        fromAmount={fromAmount}
        fromSymbol={fromToken?.symbol}
        toAmount={toAmount}
        toSymbol={toToken?.symbol}
        rateText={fromAmount && toAmount ? `1 ${fromToken?.symbol} = ${(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} ${toToken?.symbol}` : '-'}
        slippage={slippage}
        priceImpact={priceImpact}
        networkFeeText={`${platformFee.toFixed(6)} ${fromToken?.symbol || ''}`}
        warning={priceImpact !== null && priceImpact > 1.5}
      />
  <PendingSwapModal open={showPendingModal} txHash={pendingTxHash} />
    </>
  );
}