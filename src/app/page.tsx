import { redirect } from 'next/navigation';

export const metadata = {
  robots: 'noindex, nofollow',
};

/**
 * Root page - immediately redirects to /swap
 * This implements our "app-first" strategy, ensuring zero friction for traders.
 */
export default function RootPage() {
  redirect('/swap');
}
