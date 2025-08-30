import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, IndianRupee, TrendingDown, Building2 } from 'lucide-react';
import { db } from '@/lib/db';
import { inr, formatDate, monthKey, getMonthName } from '@/lib/utils';
import Link from 'next/link';

async function ExpensesDetails() {
  const currentMonth = monthKey(new Date());
  const expenses = await db.getExpenses({
    dateFrom: `${currentMonth}-01`,
    dateTo: `${currentMonth}-31`
  });

  // Group expenses by category
  const categoryTotals = new Map<string, { total: number, count: number, vendors: Set<string> }>();
  expenses.forEach(expense => {
    const total = expense.amount + expense.tax;
    const key = expense.category;
    
    if (!categoryTotals.has(key)) {
      categoryTotals.set(key, { total: 0, count: 0, vendors: new Set() });
    }
    
    const category = categoryTotals.get(key)!;
    category.total += total;
    category.count += 1;
    category.vendors.add(expense.vendor);
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount + expense.tax, 0);
  const sortedCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1].total - a[1].total);

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
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">💸 Where Did Our Money Go?</h1>
          <p className="text-muted-foreground">{getMonthName(currentMonth)} - Expenses Breakdown</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Spent This Month</p>
              <p className="text-3xl font-bold text-red-600">{inr(totalExpenses)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Number of Expenses</p>
              <p className="text-3xl font-bold">{expenses.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-3xl font-bold">{categoryTotals.size}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Expense Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedCategories.map(([category, data]) => {
            const percentage = (data.total / totalExpenses) * 100;
            
            return (
              <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
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
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Latest expenses for transparency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.slice(0, 10).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-xl">{categoryIcons[expense.category] || '💰'}</span>
                  <div>
                    <p className="font-medium">{expense.vendor}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(expense.date)}</span>
                      <Badge variant="outline" className="text-xs">
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold">{inr(expense.amount + expense.tax)}</p>
                  <Badge 
                    variant={expense.status === 'Paid' ? 'default' : expense.status === 'Unpaid' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {expense.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Did You Know?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Top 3 Expenses This Month:</h4>
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
              <h4 className="font-medium">Per Apartment Cost:</h4>
              <div className="text-2xl font-bold text-blue-600">
                {inr(totalExpenses / 1450)}
              </div>
              <p className="text-sm text-muted-foreground">
                Average expense per apartment this month
              </p>
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
