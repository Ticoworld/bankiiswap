// src/hooks/useVisitorStats.ts
'use client';

import { useEffect, useState } from 'react';

export function useVisitorStats(timeframe: '24h' | '7d' | '30d' | '365d' = '24h') {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    // Use the lightweight stats endpoint; timeframe is informational only for now
    fetch('/api/stats')
      .then((res) => res.json() as Promise<any>)
      .then((data: any) => {
        if (!active) return;
        setStats(data);
        setError(null);
      })
      .catch((_err: unknown) => {
        if (!active) return;
        setError('Failed to fetch visitor stats');
        setStats(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => { active = false; };
  }, [timeframe]);

  return { stats, loading, error };
}
