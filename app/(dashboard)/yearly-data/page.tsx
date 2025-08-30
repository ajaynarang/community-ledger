import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { db } from '@/lib/db';
import { inr, formatNumber, getMonthName } from '@/lib/utils';
import Link from 'next/link';

async function YearlyDataTable() {
  const currentDate = new Date();
  
  // Get data for last 3 months instead of 12 months
  const yearlyData = [];
  
  for (let i = 2; i >= 0; i--) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Get invoices due in this month
    const allInvoices = await db.getInvoices();
    const monthInvoices = allInvoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      const dueMonth = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
      return dueMonth === monthKey;
    });
    
    // Get payments made in this month
    const monthPayments = await db.getPayments({
      dateFrom: `${monthKey}-01`,
      dateTo: `${monthKey}-31`
    });
    
    // Get expenses for this month
    const monthExpenses = await db.getExpenses({
      dateFrom: `${monthKey}-01`,
      dateTo: `${monthKey}-31`
    });
    
    const billed = monthInvoices.reduce((sum, inv) => sum + inv.amount + inv.tax, 0);
    const collected = monthPayments.reduce((sum, pay) => sum + pay.amount, 0);
    const expenses = monthExpenses.reduce((sum, exp) => sum + exp.amount + exp.tax, 0);
    const collectionRate = billed > 0 ? (collected / billed) * 100 : 0;
    const netSurplus = collected - expenses;
    
    // Count paying units
    const payingUnits = new Set(monthPayments.map(p => p.unitId)).size;
    
    yearlyData.push({
      month: monthKey,
      monthName: getMonthName(monthKey),
      billed,
      collected,
      expenses,
      collectionRate,
      netSurplus,
      payingUnits
    });
  }
  
  // Calculate totals
  const yearlyTotals = {
    totalBilled: yearlyData.reduce((sum, data) => sum + data.billed, 0),
    totalCollected: yearlyData.reduce((sum, data) => sum + data.collected, 0),
    totalExpenses: yearlyData.reduce((sum, data) => sum + data.expenses, 0),
    netSurplus: yearlyData.reduce((sum, data) => sum + data.netSurplus, 0)
  };
  
  const yearlyCollectionRate = yearlyTotals.totalBilled > 0 ? 
    (yearlyTotals.totalCollected / yearlyTotals.totalBilled) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">📊 Financial Summary</h1>
            <p className="text-muted-foreground">Yearly performance overview</p>
          </div>
        </div>
        
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Total Billed (Year)</p>
            <p className="text-2xl font-bold">{inr(yearlyTotals.totalBilled)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Total Collected (Year)</p>
            <p className="text-2xl font-bold text-green-600">{inr(yearlyTotals.totalCollected)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Total Expenses (Year)</p>
            <p className="text-2xl font-bold text-red-600">{inr(yearlyTotals.totalExpenses)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Net Surplus (Year)</p>
            <p className={`text-2xl font-bold ${yearlyTotals.netSurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {inr(yearlyTotals.netSurplus)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Collection Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Performance</CardTitle>
          <CardDescription>Overall collection efficiency for the year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold">{yearlyCollectionRate.toFixed(1)}%</div>
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-xs text-muted-foreground">
                  {yearlyTotals.totalCollected.toLocaleString()} / {yearlyTotals.totalBilled.toLocaleString()}
                </p>
              </div>
            </div>
            
            <Badge variant={yearlyCollectionRate >= 90 ? 'default' : yearlyCollectionRate >= 80 ? 'secondary' : 'destructive'}>
              {yearlyCollectionRate >= 90 ? 'Excellent' : yearlyCollectionRate >= 80 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>Detailed monthly financial performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Billed</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Net Surplus</TableHead>
                  <TableHead className="text-right">Collection Rate</TableHead>
                  <TableHead className="text-right">Paying Units</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyData.map((data) => (
                  <TableRow key={data.month} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {data.monthName}
                    </TableCell>
                    <TableCell className="text-right">{inr(data.billed)}</TableCell>
                    <TableCell className="text-right text-green-600">{inr(data.collected)}</TableCell>
                    <TableCell className="text-right text-red-600">{inr(data.expenses)}</TableCell>
                    <TableCell className={`text-right font-bold ${data.netSurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {inr(data.netSurplus)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={data.collectionRate >= 90 ? 'default' : data.collectionRate >= 80 ? 'secondary' : 'destructive'}>
                        {data.collectionRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{data.payingUnits}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={data.netSurplus >= 0 ? 'default' : 'destructive'}>
                        {data.netSurplus >= 0 ? 'Surplus' : 'Deficit'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Best Performing Months:</h4>
              {yearlyData
                .sort((a, b) => b.collectionRate - a.collectionRate)
                .slice(0, 3)
                .map((data, index) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <span className="text-sm">{data.monthName}</span>
                    <Badge variant="outline" className="text-xs">
                      {data.collectionRate.toFixed(1)}% collection
                    </Badge>
                  </div>
                ))}
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Months with Deficit:</h4>
              {yearlyData
                .filter(data => data.netSurplus < 0)
                .sort((a, b) => a.netSurplus - b.netSurplus)
                .slice(0, 3)
                .map((data) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <span className="text-sm">{data.monthName}</span>
                    <Badge variant="destructive" className="text-xs">
                      {inr(Math.abs(data.netSurplus))} deficit
                    </Badge>
                  </div>
                ))}
              {yearlyData.filter(data => data.netSurplus < 0).length === 0 && (
                <p className="text-sm text-muted-foreground">No deficit months! 🎉</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function YearlyDataSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-32" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function YearlyDataPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<YearlyDataSkeleton />}>
        <YearlyDataTable />
      </Suspense>
    </div>
  );
}
