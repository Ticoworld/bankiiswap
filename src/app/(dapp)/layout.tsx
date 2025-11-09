import { WalletProvider } from '@/lib/wallet/adapter';
import { DappHeader } from '@/components/layout/DappHeader';
import { AnalyticsProvider } from '@/components/common/AnalyticsProvider';

export default function DAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <AnalyticsProvider />
      <div className="app-background min-h-screen flex flex-col">
        <DappHeader />
        <main className="flex-grow">{children}</main>
      </div>
    </WalletProvider>
  );
}