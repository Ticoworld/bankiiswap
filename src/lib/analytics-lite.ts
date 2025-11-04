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
