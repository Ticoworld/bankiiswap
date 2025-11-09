// src/hooks/useSwapHistory.ts
'use client';

import { useState, useEffect } from 'react';

export interface SwapHistoryEntry {
  txId: string;
  fromTokenSymbol: string;
  fromAmount: number;
  toTokenSymbol: string;
  toAmount: number;
  timestamp: number; // Unix timestamp from Date.now()
}

const STORAGE_KEY = 'bankii-swap-history';
const MAX_HISTORY_SIZE = 20;

export function useSwapHistory() {
  const [history, setHistory] = useState<SwapHistoryEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SwapHistoryEntry[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error('[useSwapHistory] Failed to load history from localStorage:', error);
      setHistory([]);
    }
  }, []);

  // Add a new swap entry to history
  const addSwapToHistory = (entry: Omit<SwapHistoryEntry, 'timestamp'>) => {
    try {
      const newEntry: SwapHistoryEntry = {
        ...entry,
        timestamp: Date.now(),
      };

      // Add to beginning and limit to MAX_HISTORY_SIZE
      const updatedHistory = [newEntry, ...history].slice(0, MAX_HISTORY_SIZE);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

      // Update state
      setHistory(updatedHistory);

      console.log('[useSwapHistory] Added swap to history:', newEntry);
    } catch (error) {
      console.error('[useSwapHistory] Failed to save swap to history:', error);
    }
  };

  return {
    history,
    addSwapToHistory,
  };
}
