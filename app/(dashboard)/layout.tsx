import { Navigation } from '@/components/Navigation';
import { MockDataBanner } from '@/components/MockDataBanner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mock Data Banner - At the very top */}
      <MockDataBanner />
      
      <Navigation />
      
      {/* Main Content */}
      <div className="md:pl-64">
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
