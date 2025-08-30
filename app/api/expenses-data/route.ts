import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { monthKey } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || monthKey(new Date());

    // Get expenses for the selected month
    const expenses = await db.getExpenses({
      dateFrom: `${month}-01`,
      dateTo: `${month}-31`
    });

    // Group expenses by category
    const categoryTotals = new Map<string, { total: number, count: number, vendors: Set<string> }>();
    
    expenses.forEach(expense => {
      const total = expense.amount + expense.tax;
      const category = expense.category;
      
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
    const perApartmentExpense = totalExpenses / totalUnits;

    // Convert Map and Set to serializable format
    const serializedCategoryTotals = Array.from(categoryTotals.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      vendors: Array.from(data.vendors)
    }));

    const serializedSortedCategories = sortedCategories.map(([category, data]) => [
      category,
      {
        total: data.total,
        count: data.count,
        vendors: Array.from(data.vendors)
      }
    ]);

    return NextResponse.json({
      expenses,
      totalExpenses,
      categoryTotals: serializedCategoryTotals,
      sortedCategories: serializedSortedCategories,
      perApartmentExpense,
      totalUnits
    });
  } catch (error) {
    console.error('Expense data error:', error);
    return NextResponse.json({ error: 'Failed to load expense data' }, { status: 500 });
  }
}
