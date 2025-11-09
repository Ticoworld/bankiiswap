import { DappHeader } from '@/components/layout/DappHeader';
import { DappFooter } from '@/components/layout/DappFooter';
import { AnalyticsProvider } from '@/components/common/AnalyticsProvider';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AnalyticsProvider />
  <DappHeader />
  <main className="flex-grow">{children}</main>
      <DappFooter />
    </div>
  );
}