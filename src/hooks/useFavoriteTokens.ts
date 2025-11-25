// src/hooks/useFavoriteTokens.ts
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

const STORAGE_KEY = "bankii-favorite-tokens";

export function useFavoriteTokens() {
  const [favoriteMints, setFavoriteMints] = useState<string[]>([]);

  // 1. Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavoriteMints(JSON.parse(stored));
      }
    } catch (error) {
      console.error("[useFavoriteTokens] Failed to load favorites:", error);
    }
  }, []);

  // 2. Create a Set for fast O(1) lookups
  const favoritesSet = useMemo(() => new Set(favoriteMints), [favoriteMints]);

  // 3. Helper to check if a token is a favorite
  const isFavorite = useCallback(
    (mint: string): boolean => {
      return favoritesSet.has(mint);
    },
    [favoritesSet]
  );

  // 4. Helper to toggle a favorite
  const toggleFavorite = useCallback(
    (mint: string) => {
      let newFavorites: string[];
      
      if (favoritesSet.has(mint)) {
        // Remove
        newFavorites = favoriteMints.filter((m) => m !== mint);
      } else {
        // Add
        newFavorites = [...favoriteMints, mint];
      }

      setFavoriteMints(newFavorites);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      } catch (error) {
        console.error("[useFavoriteTokens] Failed to save favorites:", error);
      }
    },
    [favoriteMints, favoritesSet]
  );

  return {
    favoriteMints,
    toggleFavorite,
    isFavorite,
  };
}
