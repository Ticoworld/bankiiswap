// Lightweight analytics helpers (Plausible)
// Ensures no PII is sent. All events are anonymized.

type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, props?: AnalyticsProps) {
  try {
    if (typeof window !== 'undefined' && (window as any).plausible) {
      if (props && Object.keys(props).length > 0) {
        (window as any).plausible(event, { props });
      } else {
        (window as any).plausible(event);
      }
    }
  } catch {}
}

export const Events = {
  PageView: 'page_view',
  LaunchSwap: 'click_launch_swap',
  SwapSuccess: 'swap_submit_success',
  SwapError: 'swap_submit_error',
  VisitBankii: 'cta_visit_bankii_finance',
  WalletConnection: 'wallet_connection',
  TimeSpent: 'time_spent',
} as const;

export function trackVisitBankii() {
  track(Events.VisitBankii);
}

export function trackLaunchSwap(connected: boolean) {
  track(Events.LaunchSwap, { connected });
}

export function trackSwapSuccess(fromSymbol: string, toSymbol: string) {
  track(Events.SwapSuccess, { from: fromSymbol, to: toSymbol });
}

export function trackSwapError(message?: string) {
  track(Events.SwapError, { reason: message ? String(message).slice(0, 180) : 'unknown' });
}

// --- Generic helpers used by useAnalytics ---

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const key = 'bankii_session_id';
    let sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(key, sid);
    }
    return sid;
  } catch {
    return 'unknown';
  }
}

export function trackPageView(pathname?: string, _walletAddress?: string | null) {
  // Do NOT send wallet addresses; we only record the presence of a wallet connection via a boolean.
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : undefined);
  track(Events.PageView, path ? { path } : undefined);
}

export function trackWalletConnection(_publicKey?: string | null, adapterName?: string, isFirst?: boolean) {
  // Avoid sending PII like public keys. Only adapter name and first-connection flag are tracked.
  track(Events.WalletConnection, { adapter: adapterName || 'unknown', first: !!isFirst });
}

export function trackTimeSpent(startTimeMs: number) {
  // Returns a cleanup function to be called on unmount/navigation
  return function cleanup() {
    try {
      const elapsed = Math.max(0, Date.now() - (startTimeMs || Date.now()));
      const seconds = Math.round(elapsed / 1000);
      const path = typeof window !== 'undefined' ? window.location.pathname : undefined;
      if (seconds > 0) {
        track(Events.TimeSpent, path ? { seconds, path } : { seconds });
      }
    } catch {}
  };
}
