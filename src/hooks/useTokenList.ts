/**
 * Token List Hook - Provider Pattern
 * 
 * This hook is now a simple consumer of the TokenListContext.
 * All state management and API fetching happens once in TokenListProvider.
 * This prevents the "thundering herd" problem where multiple components
 * would trigger simultaneous API calls.
 */

import { useContext } from 'react';
import { TokenListContext } from '@/contexts/TokenListProvider';

export function useTokenList() {
  const context = useContext(TokenListContext);
  if (!context) {
    throw new Error('useTokenList must be used within a TokenListProvider');
  }
  return context;
}