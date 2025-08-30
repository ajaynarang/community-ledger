import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown,
  IndianRupee, 
  Building2, 
  Calendar,
  Download,
  Eye,
  ArrowLeft,
  PiggyBank
} from 'lucide-react';
import { db } from '@/lib/db';
import { inr, formatNumber, formatDate, getMonthName, monthKey } from '@/lib/utils';
import Link from 'next/link';

async function SinkingFundTable() {
  const currentMonth = monthKey(new Date());
  
  // Mock data for sinking fund - replace with actual data from db
  const sinkingFundData = {
    totalBalance: 5000000,
    monthlyCollection: 250000,
    monthlyGrowth: 5.2,
    totalContributors: 120,
    averageContribution: 2083,
    lastUpdated: new Date(),
    monthlyBreakdown: [
      { month: '2024-01', collected: 240000, growth: 4.8 },
      { month: '2024-02', collected: 245000, growth: 5.1 },
      { month: '2024-03', collected: 250000, growth: 5.2 },
      { month: '2024-04', collected: 248000, growth: 5.0 },
      { month: '2024-05', collected: 252000, growth: 5.3 },
      { month: '2024-06', collected: 250000, growth: 5.2 },
    ]
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sinking Fund Overview</CardTitle>
            <CardDescription>
              Emergency fund balance and collection details
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <PiggyBank className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold text-blue-600">{inr(sinkingFundData.totalBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Collection</p>
                  <p className="text-2xl font-bold text-green-600">{inr(sinkingFundData.monthlyCollection)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Contributors</p>
                  <p className="text-2xl font-bold">{formatNumber(sinkingFundData.totalContributors)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Contribution</p>
                  <p className="text-2xl font-bold">{inr(sinkingFundData.averageContribution)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Collection</TableHead>
                <TableHead className="text-right hidden md:table-cell">Growth Rate</TableHead>
                <TableHead className="text-right hidden lg:table-cell">Cumulative Balance</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sinkingFundData.monthlyBreakdown.map((month, index) => {
                const cumulativeBalance = sinkingFundData.monthlyBreakdown
                  .slice(0, index + 1)
                  .reduce((sum, m) => sum + m.collected, 0);
                
                return (
                  <TableRow key={month.month} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-sm">{getMonthName(month.month)}</p>
                        <p className="text-xs text-muted-foreground">{month.month}</p>
                        <div className="flex flex-col space-y-1 mt-1 md:hidden">
                          <p className="text-xs text-muted-foreground">
                            Growth: {month.growth}% ↗️
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total: {inr(cumulativeBalance)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      <div>
                        <p className="text-sm">{inr(month.collected)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <div className="flex items-center justify-end space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          {month.growth}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell font-mono text-sm">
                      {inr(cumulativeBalance)}
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <Link href={`/sinking-fund/${month.month}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function SinkingFundTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SinkingFundPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button - Separate row for mobile */}
        <div className="flex justify-start">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        
        {/* Title - Separate row for mobile */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sinking Fund</h2>
          <p className="text-muted-foreground">
            Emergency fund balance and collection details
          </p>
        </div>
      </div>

      {/* Sinking Fund Table */}
      <Suspense fallback={<SinkingFundTableSkeleton />}>
        <SinkingFundTable />
      </Suspense>
    </div>
  );
}
