import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/db';
import { monthKey, addMonths } from '@/lib/utils';
import { SimpleDashboard } from '@/components/SimpleDashboard';

async function DashboardData() {
  const currentDate = new Date();
  const currentMonth = monthKey(currentDate);
  
  // Get current month data
  const kpis = await db.getKPIMetrics();
  const duesAging = await db.getDuesAging();
  const currentExpenses = await db.getExpenses({
    dateFrom: `${currentMonth}-01`,
    dateTo: `${currentMonth}-31`
  });
  
  // Calculate maintenance specific data
  const maintenanceInvoices = await db.getInvoices({
    type: 'Maintenance',
    dateFrom: `${currentMonth}-01`,
    dateTo: `${currentMonth}-31`
  });
  
  const maintenancePayments = await db.getPayments({
    dateFrom: `${currentMonth}-01`,
    dateTo: `${currentMonth}-31`
  });
  
  // Calculate maintenance collection
  const maintenancePaid = maintenancePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const uniquePayingUnits = new Set(maintenancePayments.map(p => p.unitId)).size;
  
  // Calculate sinking fund collection
  const sinkingFundInvoices = await db.getInvoices({
    type: 'SinkingFund',
    dateFrom: `${currentMonth}-01`,
    dateTo: `${currentMonth}-31`
  });
  const sinkingFundCollected = sinkingFundInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  
  // Get top expense category
  const categoryTotals = new Map<string, number>();
  currentExpenses.forEach(expense => {
    const total = expense.amount + expense.tax;
    categoryTotals.set(expense.category, (categoryTotals.get(expense.category) || 0) + total);
  });
  const topExpenseEntry = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1])[0];
  
  const monthlyData = {
    month: currentMonth,
    totalBilled: kpis.billedThisMonth,
    totalCollected: kpis.collectedThisMonth,
    collectionRate: kpis.collectionEfficiency,
    totalExpenses: kpis.monthlyBurnRate,
    netSurplus: kpis.collectedThisMonth - kpis.monthlyBurnRate,
    unitsWithDues: duesAging.filter(unit => unit.totalOverdue > 0 || unit.currentDue > 0).length,
    totalUnits: kpis.totalFlats,
    maintenancePaid,
    maintenanceUnits: uniquePayingUnits,
    sinkingFundCollected,
    topExpenseCategory: topExpenseEntry?.[0] || 'N/A',
    topExpenseAmount: topExpenseEntry?.[1] || 0
  };
  
  // Get last 6 months data for trend
  const last6MonthsData = [];
  for (let i = 5; i >= 0; i--) {
    const targetDate = addMonths(currentDate, -i);
    const period = monthKey(targetDate);
    
    const monthPayments = await db.getPayments({
      dateFrom: `${period}-01`,
      dateTo: `${period}-31`
    });
    
    const monthExpenses = await db.getExpenses({
      dateFrom: `${period}-01`,
      dateTo: `${period}-31`
    });
    
    const collected = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const expenses = monthExpenses.reduce((sum, expense) => sum + expense.amount + expense.tax, 0);
    
    last6MonthsData.push({
      month: period,
      collected,
      expenses,
      surplus: collected - expenses
    });
  }
  
  return <SimpleDashboard monthlyData={monthlyData} last6MonthsData={last6MonthsData} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-6 w-32 mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </div>
  );
}
