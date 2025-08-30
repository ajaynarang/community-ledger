import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Calendar, IndianRupee, TrendingDown, Building2, Users, Eye, Download } from 'lucide-react';
import { db } from '@/lib/db';
import { inr, formatDate, monthKey, getMonthName, addMonths } from '@/lib/utils';
import Link from 'next/link';

async function ExpensesDetails() {
  const currentDate = new Date();
  
  // Get expenses for last 3 months
  const threeMonthsAgo = addMonths(currentDate, -2);
  const expenses = await db.getExpenses({
    dateFrom: threeMonthsAgo.toISOString(),
    dateTo: currentDate.toISOString()
  });

  // Group expenses by month and category
  const expensesByMonth = new Map<string, any[]>();
  const categoryTotals = new Map<string, { total: number, count: number, vendors: Set<string> }>();
  
  expenses.forEach(expense => {
    const total = expense.amount + expense.tax;
    const month = monthKey(new Date(expense.date));
    const category = expense.category;
    
    // Group by month
    if (!expensesByMonth.has(month)) {
      expensesByMonth.set(month, []);
    }
    expensesByMonth.get(month)!.push(expense);
    
    // Group by category
    if (!categoryTotals.has(category)) {
      categoryTotals.set(category, { total: 0, count: 0, vendors: new Set() });
    }
    
    const categoryData = categoryTotals.get(category)!;
    categoryData.total += total;
    categoryData.count += 1;
    categoryData.vendors.add(expense.vendor);
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount + expense.tax, 0);
  const sortedCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1].total - a[1].total);

  // Calculate per apartment expense
  const totalUnits = 1450; // From user assumption
  const perApartmentExpense = totalExpenses / (totalUnits * 3); // Average per apartment per month

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

  // Get monthly totals
  const monthlyTotals = Array.from(expensesByMonth.entries()).map(([month, monthExpenses]) => ({
    month,
    monthName: getMonthName(month),
    total: monthExpenses.reduce((sum, exp) => sum + exp.amount + exp.tax, 0),
    count: monthExpenses.length
  })).sort((a, b) => b.month.localeCompare(a.month));

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
            <h1 className="text-3xl font-bold">💸 Where Did Our Money Go?</h1>
            <p className="text-muted-foreground">Last 3 Months - Expenses Breakdown</p>
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
            <p className="text-sm text-muted-foreground">Total Spent (3 Months)</p>
            <p className="text-2xl font-bold text-red-600">{inr(totalExpenses)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Average Monthly</p>
            <p className="text-2xl font-bold">{inr(totalExpenses / 3)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold">{expenses.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Per Apartment/Month</p>
            <p className="text-2xl font-bold text-blue-600">{inr(perApartmentExpense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense Breakdown</CardTitle>
          <CardDescription>Total expenses for each of the last 3 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {monthlyTotals.map((monthData) => (
              <div key={monthData.month} className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">{monthData.monthName}</p>
                <p className="text-2xl font-bold text-red-600">{inr(monthData.total)}</p>
                <p className="text-sm text-muted-foreground">{monthData.count} expenses</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
          <CardDescription>Breakdown by expense category for the last 3 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedCategories.map(([category, data]) => {
              const percentage = (data.total / totalExpenses) * 100;
              const perApartment = data.total / (totalUnits * 3);
              
              return (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{categoryIcons[category] || '💰'}</span>
                      <div>
                        <h3 className="font-semibold">{category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {data.count} expenses • {data.vendors.size} vendors
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{inr(data.total)}</p>
                      <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Per Apartment (3 months):</span>
                      <span className="font-medium">{inr(perApartment)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Expense Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Expense List</CardTitle>
          <CardDescription>All expenses for the last 3 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.slice(0, 50).map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(expense.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{categoryIcons[expense.category] || '💰'}</span>
                        <span>{expense.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>{expense.vendor}</TableCell>
                    <TableCell className="text-right">{inr(expense.amount)}</TableCell>
                    <TableCell className="text-right">{inr(expense.tax)}</TableCell>
                    <TableCell className="text-right font-bold">{inr(expense.amount + expense.tax)}</TableCell>
                    <TableCell>
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
          {expenses.length > 50 && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing first 50 expenses. Total: {expenses.length} expenses
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Top 3 Expense Categories:</h4>
              {sortedCategories.slice(0, 3).map(([category, data], index) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span>{categoryIcons[category] || '💰'}</span>
                    <span className="text-sm">{category}</span>
                  </div>
                  <span className="text-sm font-bold">{inr(data.total)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Cost Analysis:</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Per Apartment/Month:</span>
                  <span className="font-bold">{inr(perApartmentExpense)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Apartments:</span>
                  <span className="font-bold">{totalUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Monthly:</span>
                  <span className="font-bold text-red-600">{inr(totalExpenses / 3)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<div className="text-center py-8">Loading expenses...</div>}>
        <ExpensesDetails />
      </Suspense>
    </div>
  );
}
