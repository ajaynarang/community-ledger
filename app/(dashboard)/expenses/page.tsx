'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Calendar, IndianRupee, TrendingDown, Building2, Users, Eye, Download } from 'lucide-react';
import { inr, formatDate, monthKey, getMonthName } from '@/lib/utils';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import Link from 'next/link';

interface ExpenseData {
  expenses: any[];
  totalExpenses: number;
  categoryTotals: Array<{category: string, total: number, count: number, vendors: string[]}>;
  sortedCategories: [string, { total: number, count: number, vendors: string[] }][];
  perApartmentExpense: number;
  totalUnits: number;
}

function ExpensesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
      
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

export default function ExpensesPage() {
  const currentMonth = monthKey(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isLoading, setIsLoading] = useState(true);
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);

  const handleMonthChange = useCallback((month: string) => {
    setIsLoading(true);
    setSelectedMonth(month);
  }, []);

  // Load expense data
  useEffect(() => {
    const loadExpenseData = async () => {
      try {
        const response = await fetch(`/api/expenses-data?month=${selectedMonth}`);
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setExpenseData(data);
      } catch (error) {
        console.error('Failed to load expense data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenseData();
  }, [selectedMonth]);

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

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <ExpensesSkeleton />
      </div>
    );
  }

  if (!expenseData) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load expense data</p>
        </div>
      </div>
    );
  }

  const { expenses, totalExpenses, categoryTotals, sortedCategories, perApartmentExpense, totalUnits } = expenseData;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          {/* Back Button and Export - Separate row for mobile */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          
          {/* Title - Separate row for mobile */}
          <div>
            <h1 className="text-3xl font-bold">Where Did Our Money Go?</h1>
            <p className="text-muted-foreground">{getMonthName(selectedMonth)} - Expenses Breakdown</p>
          </div>
        </div>

        {/* Month Switcher */}
        <div className="flex justify-center">
          <MonthSwitcher
            currentMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">{inr(totalExpenses)}</p>
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
              <p className="text-sm text-muted-foreground">Per Apartment</p>
              <p className="text-2xl font-bold text-blue-600">{inr(perApartmentExpense)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{sortedCategories.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Breakdown by expense category for {getMonthName(selectedMonth)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedCategories.map(([category, data]) => {
                const percentage = totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0;
                const perApartment = data.total / totalUnits;
                
                return (
                  <div key={category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{categoryIcons[category] || '💰'}</span>
                        <div>
                          <h3 className="font-semibold">{category}</h3>
                                                   <p className="text-sm text-muted-foreground">
                           {data.count} expenses • {data.vendors.length} vendors
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
                        <span>Per Apartment:</span>
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
            <CardDescription>All expenses for {getMonthName(selectedMonth)}</CardDescription>
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
                  {expenses.slice(0, 50).map((expense: any) => (
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
                    <span>Per Apartment:</span>
                    <span className="font-bold">{inr(perApartmentExpense)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Apartments:</span>
                    <span className="font-bold">{totalUnits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses:</span>
                    <span className="font-bold text-red-600">{inr(totalExpenses)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
