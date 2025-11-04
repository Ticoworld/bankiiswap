// src/config/nav.ts
// Centralized navigation config for scalability

export type NavItem = {
  label: string;
  href: string;
  icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  description?: string;
  badge?: string;
};

// Removed rewards nav (leaderboards, badges, referrals)

export const analyticsNav: NavItem[] = [
  { label: 'Swaps', href: '/swaps', description: 'Your swap history' },
  { label: 'Portfolio', href: '/profile', description: 'Your wallet overview' },
];

export const moreNav: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Help', href: '/help' },
];
