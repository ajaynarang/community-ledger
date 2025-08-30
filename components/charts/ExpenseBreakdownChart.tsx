'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { db } from '@/lib/db';
import { inr, monthKey } from '@/lib/utils';
import { useEffect, useState } from 'react';

const EXPENSE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))', 
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00ff00',
  '#0088fe',
  '#00c49f',
  '#ffbb28',
  '#ff8042',
  '#8dd1e1'
];

export function ExpenseBreakdownChart() {
  const [data, setData] = useState<Array<{name: string, value: number}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const currentMonth = monthKey(new Date());
        const expenses = await db.getExpenses({
          dateFrom: `${currentMonth}-01`,
          dateTo: `${currentMonth}-31`
        });
        
        const categoryTotals = new Map<string, number>();
        
        expenses.forEach(expense => {
          const total = expense.amount + expense.tax;
          categoryTotals.set(
            expense.category,
            (categoryTotals.get(expense.category) || 0) + total
          );
        });

        const chartData = Array.from(categoryTotals.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10); // Top 10 categories

        setData(chartData);
      } catch (error) {
        console.error('Error loading expense breakdown data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const formatTooltip = (value: number, name: string) => {
    return [inr(value), name];
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No expenses for current month
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => (percent || 0) > 5 ? `${name}: ${((percent || 0) * 100).toFixed(0)}%` : ''}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip formatter={formatTooltip} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
