import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  TrendingDown, 
  Calendar, 
  IndianRupee,
  Building2,
  Download,
  Eye
} from 'lucide-react';
import { inr, formatNumber, formatDate, getMonthName, monthKey } from '@/lib/utils';
import Link from 'next/link';

interface ExpenseCategoryDetailProps {
  params: {
    categoryId: string;
  };
}

async function ExpenseCategoryDetail({ categoryId }: { categoryId: string }) {
  // Parse category ID to get category and period
  const [category, period] = categoryId.split('-');
  
  if (!category || !period) {
    notFound();
  }

  // Mock data for expense category details - replace with actual data from db
  const categoryData = {
    category: decodeURIComponent(category),
    period: period,
    totalAmount: 125000,
    totalExpenses: 15,
    totalVendors: 8,
    averageExpense: 8333,
    previousMonth: 118000,
    expenses: [
      { id: 1, date: '2024-06-15', vendor: 'ABC Security Services', amount: 15000, tax: 2700, status: 'Paid' },
      { id: 2, date: '2024-06-16', vendor: 'XYZ Maintenance', amount: 12000, tax: 2160, status: 'Paid' },
      { id: 3, date: '2024-06-17', vendor: 'Power Solutions Ltd', amount: 18000, tax: 3240, status: 'Paid' },
      { id: 4, date: '2024-06-18', vendor: 'Water Works Co', amount: 8500, tax: 1530, status: 'Pending' },
      { id: 5, date: '2024-06-19', vendor: 'Diesel Supply Co', amount: 22000, tax: 3960, status: 'Paid' },
    ],
    vendors: [
      { name: 'ABC Security Services', total: 45000, count: 3 },
      { name: 'XYZ Maintenance', total: 36000, count: 3 },
      { name: 'Power Solutions Ltd', total: 18000, count: 1 },
      { name: 'Water Works Co', total: 8500, count: 1 },
      { name: 'Diesel Supply Co', total: 22000, count: 1 },
    ]
  };

  const variance = ((categoryData.totalAmount - categoryData.previousMonth) / categoryData.previousMonth) * 100;
  
  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    'Security': '🛡️',
    'Housekeeping': '🧹',
    'Electricity': '⚡',
    'Water': '💧',
    'Diesel': '⛽',
    'Repairs': '🔧',
    'AMC': '📋',
    'Insurance': '🛡️',
    'Salaries': '👥',
    'Admin': '📄',
    'Waste': '🗑️',
    'Internet': '🌐',
    'Legal': '⚖️',
    'Landscaping': '🌱'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button - Separate row for mobile */}
        <div className="flex justify-start">
          <Link href="/expenses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        
        {/* Title - Separate row for mobile */}
        <div>
          <h1 className="text-2xl font-bold">{categoryData.category} Expenses</h1>
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
              <IndianRupee className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-red-600">{inr(categoryData.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{formatNumber(categoryData.totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Vendors</p>
                <p className="text-2xl font-bold">{formatNumber(categoryData.totalVendors)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Expense</p>
                <p className="text-2xl font-bold">{inr(categoryData.averageExpense)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Vendors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Vendors</CardTitle>
          <CardDescription>
            Vendors with highest expenses for this category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.vendors.slice(0, 5).map((vendor, index) => (
              <div key={vendor.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {vendor.count} expenses • {((vendor.total / categoryData.totalAmount) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{inr(vendor.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Expense List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detailed Expense List - {categoryData.category}</CardTitle>
              <CardDescription>
                All {categoryData.category} expenses for {getMonthName(period)}
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Vendor</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Amount</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryData.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(expense.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{expense.vendor}</TableCell>
                    <TableCell className="text-right hidden md:table-cell text-sm">{inr(expense.amount)}</TableCell>
                    <TableCell className="text-right hidden lg:table-cell text-sm">{inr(expense.tax)}</TableCell>
                    <TableCell className="text-right font-bold text-sm">
                      <div>
                        <p>{inr(expense.amount + expense.tax)}</p>
                        <div className="flex flex-col space-y-1 mt-1 md:hidden">
                          <p className="text-xs text-muted-foreground">Amount: {inr(expense.amount)}</p>
                          <p className="text-xs text-muted-foreground">Tax: {inr(expense.tax)}</p>
                          <p className="text-xs text-muted-foreground">Vendor: {expense.vendor}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge 
                        variant={expense.status === 'Paid' ? 'default' : expense.status === 'Unpaid' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {expense.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExpenseCategoryDetailSkeleton() {
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

export default function ExpenseCategoryDetailPage({ params }: ExpenseCategoryDetailProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<ExpenseCategoryDetailSkeleton />}>
        <ExpenseCategoryDetail categoryId={params.categoryId} />
      </Suspense>
    </div>
  );
}
