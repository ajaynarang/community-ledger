import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown,
  IndianRupee, 
  Users, 
  Calendar,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { db } from '@/lib/db';
import { inr, formatNumber, formatDate, getMonthName, monthKey } from '@/lib/utils';
import Link from 'next/link';

async function IncomeSourcesTable() {
  const currentMonth = monthKey(new Date());
  const incomeSources = await db.getIncomeSourceSummaries(currentMonth);
  
  // Calculate totals
  const totalAmount = incomeSources.reduce((sum, source) => sum + source.amount, 0);
  const totalTxns = incomeSources.reduce((sum, source) => sum + source.txns, 0);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Income Sources - {getMonthName(currentMonth)}</CardTitle>
            <CardDescription>
              Revenue breakdown by source category
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{inr(totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{formatNumber(totalTxns)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Transaction</p>
                  <p className="text-2xl font-bold">
                    {totalTxns > 0 ? inr(totalAmount / totalTxns) : inr(0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Sources Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">Avg Ticket</TableHead>
                <TableHead>Payment Modes</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeSources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No income sources found for this period
                  </TableCell>
                </TableRow>
              ) : (
                incomeSources.map((source) => {
                  const topPaymentMode = Object.entries(source.paymentModeSplit)
                    .sort(([,a], [,b]) => b - a)[0];
                  
                  return (
                    <TableRow key={source.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div>
                          <p>{source.category}</p>
                          {source.subCategory && (
                            <p className="text-xs text-muted-foreground">{source.subCategory}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {inr(source.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(source.txns)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {inr(source.avgTicket)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Badge variant="outline" className="text-xs">
                            {topPaymentMode?.[0] || 'N/A'}: {topPaymentMode?.[1] || 0}
                          </Badge>
                          {Object.keys(source.paymentModeSplit).length > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              +{Object.keys(source.paymentModeSplit).length - 1} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {source.variance !== 0 && (
                            <>
                              {source.variance > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`text-sm ${source.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(source.variance).toFixed(1)}%
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href={`/income/${source.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function IncomeTableSkeleton() {
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
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function IncomePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Income Sources</h2>
          <p className="text-muted-foreground">
            Track revenue streams and payment collection patterns
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select defaultValue="current-month">
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="current-year">Current Financial Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select defaultValue="all-towers">
                <SelectTrigger>
                  <SelectValue placeholder="Select tower" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-towers">All Towers</SelectItem>
                  <SelectItem value="1">Tower 1</SelectItem>
                  <SelectItem value="2">Tower 2</SelectItem>
                  <SelectItem value="3">Tower 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select defaultValue="all-modes">
                <SelectTrigger>
                  <SelectValue placeholder="Payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-modes">All Payment Modes</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="auto-debit">Auto Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select defaultValue="all-categories">
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="sinking-fund">Sinking Fund</SelectItem>
                  <SelectItem value="amenity">Amenity</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="penalties">Penalties</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Sources Table */}
      <Suspense fallback={<IncomeTableSkeleton />}>
        <IncomeSourcesTable />
      </Suspense>
    </div>
  );
}
