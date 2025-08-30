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
  PiggyBank,
  Users
} from 'lucide-react';
import { db } from '@/lib/db';
import { inr, formatNumber, formatDate, getMonthName } from '@/lib/utils';
import Link from 'next/link';

interface SinkingFundMonthPageProps {
  params: {
    monthId: string;
  };
}

async function SinkingFundMonthDetails({ monthId }: { monthId: string }) {
  // Mock data for sinking fund month details - replace with actual data from db
  const monthData = {
    month: monthId,
    totalCollected: 250000,
    totalContributors: 120,
    averageContribution: 2083,
    growthRate: 5.2,
    previousMonth: 245000,
    contributors: [
      { id: 1, name: 'Flat A-101', amount: 2500, date: '2024-06-15', status: 'paid' },
      { id: 2, name: 'Flat A-102', amount: 2000, date: '2024-06-16', status: 'paid' },
      { id: 3, name: 'Flat B-201', amount: 2200, date: '2024-06-17', status: 'paid' },
      { id: 4, name: 'Flat B-202', amount: 1800, date: '2024-06-18', status: 'pending' },
      { id: 5, name: 'Flat C-301', amount: 2400, date: '2024-06-19', status: 'paid' },
    ],
    paymentMethods: {
      'Online Transfer': 45,
      'Cash': 30,
      'Cheque': 25
    }
  };
  
  const variance = ((monthData.totalCollected - monthData.previousMonth) / monthData.previousMonth) * 100;
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PiggyBank className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Collection</p>
                <p className="text-2xl font-bold text-blue-600">{inr(monthData.totalCollected)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Contributors</p>
                <p className="text-2xl font-bold">{formatNumber(monthData.totalContributors)}</p>
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
                <p className="text-2xl font-bold">{inr(monthData.averageContribution)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="text-2xl font-bold text-green-600">{monthData.growthRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Breakdown of collection by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(monthData.paymentMethods).map(([method, percentage]) => (
              <div key={method} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{method}</p>
                  <p className="text-sm text-muted-foreground">{percentage}% of total</p>
                </div>
                <Badge variant="outline">{inr((monthData.totalCollected * percentage) / 100)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contributors Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contributors - {getMonthName(monthId)}</CardTitle>
              <CardDescription>Individual flat contributions this month</CardDescription>
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flat</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthData.contributors.map((contributor) => (
                  <TableRow key={contributor.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-sm">{contributor.name}</p>
                        <div className="flex flex-col space-y-1 mt-1 md:hidden">
                          <p className="text-xs text-muted-foreground">Date: {formatDate(contributor.date)}</p>
                          <p className="text-xs text-muted-foreground">
                            Status: {contributor.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      <div>
                        <p className="text-sm">{inr(contributor.amount)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(contributor.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <Badge variant={contributor.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                        {contributor.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center hidden lg:table-cell">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {monthData.contributors.length > 20 && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing first 20 contributors. Total: {monthData.contributors.length} contributors
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SinkingFundMonthSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-1" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SinkingFundMonthPage({ params }: SinkingFundMonthPageProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button - Separate row for mobile */}
        <div className="flex justify-start">
          <Link href="/sinking-fund">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        
        {/* Title - Separate row for mobile */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sinking Fund - {getMonthName(params.monthId)}</h2>
          <p className="text-muted-foreground">
            Detailed breakdown of sinking fund collection for {getMonthName(params.monthId)}
          </p>
        </div>
      </div>

      {/* Sinking Fund Month Details */}
      <Suspense fallback={<SinkingFundMonthSkeleton />}>
        <SinkingFundMonthDetails monthId={params.monthId} />
      </Suspense>
    </div>
  );
}
