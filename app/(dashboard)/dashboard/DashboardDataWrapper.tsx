import { db } from '@/lib/db';

import { monthKey, addMonths } from '@/lib/utils';
import { SimpleDashboard } from '@/components/SimpleDashboard';

interface DashboardDataWrapperProps {
  selectedMonth: string;
}

export async function DashboardDataWrapper({ selectedMonth }: DashboardDataWrapperProps) {
  const currentDate = new Date();
  const targetMonth = selectedMonth || monthKey(currentDate);
  
  // Get target month data
  const kpis = await db.getKPIMetrics(targetMonth);
  const duesAging = await db.getDuesAging();
  const currentExpenses = await db.getExpenses({
    dateFrom: `${targetMonth}-01`,
    dateTo: `${targetMonth}-31`
  });
  
  // Calculate maintenance specific data
  const maintenanceInvoices = await db.getInvoices({
    type: 'Maintenance',
    dateFrom: `${targetMonth}-01`,
    dateTo: `${targetMonth}-31`
  });
  
  const maintenancePayments = await db.getPayments({
    dateFrom: `${targetMonth}-01`,
    dateTo: `${targetMonth}-31`
  });
  
  // Calculate maintenance collection
  const maintenancePaid = maintenancePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const uniquePayingUnits = new Set(maintenancePayments.map(p => p.unitId)).size;
  
  // Calculate sinking fund collection
  const sinkingFundInvoices = await db.getInvoices({
    type: 'SinkingFund',
    dateFrom: `${targetMonth}-01`,
    dateTo: `${targetMonth}-31`
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
    month: targetMonth,
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
