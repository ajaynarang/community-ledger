import { Suspense } from 'react';
import { SimpleDashboard } from '@/components/SimpleDashboard';
import { db } from '@/lib/db';
import { monthKey } from '@/lib/utils';

interface DashboardDataWrapperProps {
  selectedMonth: string;
}

export async function DashboardDataWrapper({ selectedMonth }: DashboardDataWrapperProps) {
  // Force server-side rendering by using dynamic imports
  const kpis = await db.getKPIMetrics(selectedMonth);
  const duesAging = await db.getDuesAging();
  const chartData = await db.getBilledVsCollectedChart();
  const sinkingFundBalance = await db.getSinkingFundBalance();

  const monthlyData = {
    month: selectedMonth,
    totalUnits: kpis.totalFlats,
    totalBilled: kpis.billedThisMonth,
    totalCollected: kpis.collectedThisMonth,
    totalOutstanding: kpis.outstanding,
    collectionEfficiency: kpis.collectionEfficiency,
    sinkingFundBalance: sinkingFundBalance,
    duesAging: duesAging,
    chartData: chartData
  };

  return (
    <Suspense fallback={<div>Loading dashboard data...</div>}>
      <SimpleDashboard monthlyData={monthlyData} />
    </Suspense>
  );
}
