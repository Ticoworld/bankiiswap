import { WalletProvider } from '@/lib/wallet/adapter';
import { DappHeader } from '@/components/layout/DappHeader';
import { DappFooter } from '@/components/layout/DappFooter';
import { AnalyticsProvider } from '@/components/common/AnalyticsProvider';
import { TokenListProvider } from '@/contexts/TokenListProvider';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <TokenListProvider>
        <div className="min-h-screen flex flex-col">
          <AnalyticsProvider />
          <DappHeader />
          <main className="flex-grow">{children}</main>
          <DappFooter />
        </div>
      </TokenListProvider>
    </WalletProvider>
  );
}