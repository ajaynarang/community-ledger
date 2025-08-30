import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Wallet,
  Users
} from 'lucide-react';
import { db } from '@/lib/db';
import { inr, monthKey } from '@/lib/utils';
import { SimpleBarChart } from './SimpleBarChart';

async function BilledVsCollectedSummary() {
  const data = await db.getBilledVsCollectedChart(12);
  
  const totalBilled = data.reduce((sum, item) => sum + Number(item.billed || 0), 0);
  const totalCollected = data.reduce((sum, item) => sum + Number(item.collected || 0), 0);
  const avgEfficiency = data.length > 0 
    ? data.reduce((sum, item) => sum + Number(item.efficiency || 0), 0) / data.length 
    : 0;

  // Get last 6 months for trend display
  const recentData = data.slice(-6).map(item => ({
    label: item.period.split('-')[1] + '/' + item.period.split('-')[0].slice(-2),
    value: Number(item.collected || 0),
    color: (Number(item.efficiency || 0)) >= 90 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Performance (12 Months)</CardTitle>
        <CardDescription>
          Billing and collection trends with efficiency tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Billed</p>
              <p className="text-lg font-bold">{inr(totalBilled)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Collected</p>
              <p className="text-lg font-bold text-green-600">{inr(totalCollected)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Avg Efficiency</p>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-lg font-bold">{avgEfficiency.toFixed(1)}%</p>
                {avgEfficiency >= 90 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
          </div>

          {/* Collection Efficiency Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Collection Rate</span>
              <span>{totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '0.0'}%</span>
            </div>
            <Progress value={totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0} className="h-2" />
          </div>

          {/* Recent Months Trend */}
          <div>
            <h4 className="text-sm font-medium mb-3">Last 6 Months Collection Trend</h4>
            <SimpleBarChart data={recentData} height={120} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function ReceivablesAgingSummary() {
  const agingData = await db.getDuesAging();
  
  const totalUnits = agingData.length;
  const unitsWithDues = agingData.filter(unit => unit.totalOverdue > 0 || unit.currentDue > 0).length;
  
  const agingSummary = {
    current: agingData.reduce((sum, unit) => sum + unit.currentDue, 0),
    aging0to30: agingData.reduce((sum, unit) => sum + unit.aging0to30, 0),
    aging31to60: agingData.reduce((sum, unit) => sum + unit.aging31to60, 0),
    aging61to90: agingData.reduce((sum, unit) => sum + unit.aging61to90, 0),
    aging90plus: agingData.reduce((sum, unit) => sum + unit.aging90plus, 0)
  };

  const totalOverdue = Object.values(agingSummary).reduce((sum, val) => sum + val, 0);
  
  const chartData = [
    { label: 'Current', value: agingSummary.current, color: 'hsl(var(--primary))' },
    { label: '0-30 days', value: agingSummary.aging0to30, color: '#fbbf24' },
    { label: '31-60 days', value: agingSummary.aging31to60, color: '#f97316' },
    { label: '61-90 days', value: agingSummary.aging61to90, color: '#ef4444' },
    { label: '90+ days', value: agingSummary.aging90plus, color: '#dc2626' }
  ].filter(item => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receivables Aging Analysis</CardTitle>
        <CardDescription>
          Outstanding dues breakdown by aging periods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Units with Dues</p>
              <p className="text-2xl font-bold">{unitsWithDues}/{totalUnits}</p>
              <Badge variant={unitsWithDues < totalUnits * 0.1 ? 'default' : 'destructive'}>
                {totalUnits > 0 ? ((unitsWithDues / totalUnits) * 100).toFixed(1) : '0.0'}%
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-bold">{inr(totalOverdue)}</p>
            </div>
          </div>

          {/* Aging Breakdown */}
          {chartData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Aging Breakdown</h4>
              <SimpleBarChart data={chartData} height={150} />
            </div>
          )}

          {/* Risk Indicators */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">High Risk (90+ days)</p>
                <p className="text-xs text-muted-foreground">{inr(agingSummary.aging90plus)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Legal Action Required</p>
                <p className="text-xs text-muted-foreground">
                  {agingData.filter(unit => unit.escalationStage === 'Legal').length} units
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function ExpenseBreakdownSummary() {
  const currentMonth = monthKey(new Date());
  const expenses = await db.getExpenses({
    dateFrom: `${currentMonth}-01`,
    dateTo: `${currentMonth}-31`
  });
  
  const categoryTotals = new Map<string, number>();
  expenses.forEach(expense => {
    const total = expense.amount + expense.tax;
    categoryTotals.set(expense.category, (categoryTotals.get(expense.category) || 0) + total);
  });

  const totalExpenses = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0);
  
  const chartData = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      label: category,
      value: amount,
      color: undefined
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const topExpense = chartData[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown (Current Month)</CardTitle>
        <CardDescription>
          Monthly expenses by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">{inr(totalExpenses)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Top Category</p>
              <p className="text-lg font-bold">{topExpense?.label || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">
                {topExpense ? inr(topExpense.value) : ''}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          {chartData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Category Breakdown</h4>
              <SimpleBarChart data={chartData} height={200} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function CashflowSummary() {
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const currentMonth = monthKey(currentDate);
  const lastMonthKey = monthKey(lastMonth);
  
  const currentPayments = await db.getPayments({
    dateFrom: `${currentMonth}-01`,
    dateTo: `${currentMonth}-31`
  });
  
  const currentExpenses = await db.getExpenses({
    dateFrom: `${currentMonth}-01`,
    dateTo: `${currentMonth}-31`
  });

  const lastMonthPayments = await db.getPayments({
    dateFrom: `${lastMonthKey}-01`,
    dateTo: `${lastMonthKey}-31`
  });

  const currentInflow = currentPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const currentOutflow = currentExpenses.reduce((sum, expense) => sum + expense.amount + expense.tax, 0);
  const currentNetFlow = currentInflow - currentOutflow;
  
  const lastMonthInflow = lastMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const inflowChange = lastMonthInflow > 0 ? ((currentInflow - lastMonthInflow) / lastMonthInflow) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cashflow Summary</CardTitle>
        <CardDescription>
          Current month inflow vs outflow analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Month Flow */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Inflow</p>
              <p className="text-lg font-bold text-green-600">{inr(currentInflow)}</p>
              <div className="flex items-center justify-center space-x-1 mt-1">
                {inflowChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs ${inflowChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(inflowChange).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Outflow</p>
              <p className="text-lg font-bold text-red-600">{inr(currentOutflow)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Net Flow</p>
              <p className={`text-lg font-bold ${currentNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {inr(currentNetFlow)}
              </p>
            </div>
          </div>

          {/* Flow Visualization */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Inflow</span>
                <span>{inr(currentInflow)}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Outflow</span>
                <span>{inr(currentOutflow)}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: currentInflow > 0 ? `${(currentOutflow / currentInflow) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>

          {/* Health Indicator */}
          <div className="flex items-center justify-center space-x-2 pt-4 border-t">
            <Wallet className={`h-5 w-5 ${currentNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className="text-sm font-medium">
              Cashflow Health: {currentNetFlow >= 0 ? 'Positive' : 'Negative'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export async function EnhancedDashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <BilledVsCollectedSummary />
      <ReceivablesAgingSummary />
      <ExpenseBreakdownSummary />
      <CashflowSummary />
    </div>
  );
}