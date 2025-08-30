import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  TrendingUp, 
  Users, 
  IndianRupee,
  Calendar,
  CreditCard,
  Building2
} from 'lucide-react';
import { db } from '@/lib/db';
import { inr, formatNumber, formatDate, getMonthName } from '@/lib/utils';
import Link from 'next/link';
// Charts temporarily disabled for build compatibility
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { PieChart, Pie, Cell, Legend } from 'recharts';

interface IncomeSourceDetailProps {
  params: {
    sourceId: string;
  };
}

async function IncomeSourceDetail({ sourceId }: { sourceId: string }) {
  // Parse source ID to get category and period
  const [category, period] = sourceId.split('-');
  
  if (!category || !period) {
    notFound();
  }

  // Get income source summary
  const incomeSources = await db.getIncomeSourceSummaries(period);
  const source = incomeSources.find(s => s.category.toLowerCase() === category.toLowerCase());
  
  if (!source) {
    notFound();
  }

  // Get related payments for this source
  const payments = await db.getPayments({
    dateFrom: `${period}-01`,
    dateTo: `${period}-31`
  });

  // Filter payments by source type (this is simplified - in real app would need better mapping)
  const sourcePayments = payments.filter(payment => {
    // This is a simplified mapping - in real app, you'd have proper invoice-payment relationships
    return true; // For now, show all payments
  }).slice(0, 50); // Limit to recent 50

  // Calculate tower-wise breakdown
  const towerBreakdown = new Map<string, number>();
  sourcePayments.forEach(payment => {
    const tower = payment.unitId.split('-')[0];
    towerBreakdown.set(tower, (towerBreakdown.get(tower) || 0) + payment.amount);
  });

  const towerData = Array.from(towerBreakdown.entries()).map(([tower, amount]) => ({
    tower: `Tower ${tower}`,
    amount
  })).sort((a, b) => b.amount - a.amount);

  // Payment mode breakdown for pie chart
  const modeData = Object.entries(source.paymentModeSplit).map(([mode, count]) => ({
    name: mode,
    value: count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button - Separate row for mobile */}
        <div className="flex justify-start">
          <Link href="/income">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        
        {/* Title - Separate row for mobile */}
        <div>
          <h1 className="text-2xl font-bold">{source.category} Income</h1>
          <p className="text-muted-foreground">
            Detailed breakdown for {getMonthName(period)}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{inr(source.amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{formatNumber(source.txns)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Ticket Size</p>
                <p className="text-2xl font-bold">{inr(source.avgTicket)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

   {/* Top Contributing Units */}
   <Card>
        <CardHeader>
          <CardTitle>Top Contributing Units</CardTitle>
          <CardDescription>
            Units with highest contribution for this source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {towerData.slice(0, 5).map((tower, index) => (
              <div key={tower.tower} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{tower.tower}</p>
                    <p className="text-sm text-muted-foreground">
                      {((tower.amount / source.amount) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{inr(tower.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest payments for this income source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Unit</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Payment Mode</TableHead>
                  <TableHead className="hidden lg:table-cell">Transaction Ref</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sourcePayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  sourcePayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{formatDate(payment.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-sm">{payment.unitId}</TableCell>
                      <TableCell className="text-right font-bold">
                        <div>
                          <p className="text-sm">{inr(payment.amount)}</p>
                          <div className="flex flex-col space-y-1 mt-1 sm:hidden">
                            <p className="text-xs text-muted-foreground">Unit: {payment.unitId}</p>
                            <p className="text-xs text-muted-foreground">Mode: {payment.mode}</p>
                            <p className="text-xs text-muted-foreground">Status: Completed</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">{payment.mode}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell font-mono text-xs">
                        {payment.transactionRef || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="default" className="text-xs">Completed</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {sourcePayments.length > 20 && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing first 20 transactions. Total: {sourcePayments.length} transactions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

   
    </div>
  );
}

function IncomeSourceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-9 w-32" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-72 w-full" />
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
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function IncomeSourceDetailPage({ params }: IncomeSourceDetailProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<IncomeSourceDetailSkeleton />}>
        <IncomeSourceDetail sourceId={params.sourceId} />
      </Suspense>
    </div>
  );
}
