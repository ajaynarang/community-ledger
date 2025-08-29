'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Expense {
  category: string;
  amount: number;
  color: string;
}

interface ExpensesChartProps {
  data: Expense[];
}

export default function ExpensesChart({ data }: ExpensesChartProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">{formatAmount(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Shorten category names for mobile
  const formatCategory = (category: string) => {
    if (category.length > 15) {
      return category.substring(0, 15) + '...';
    }
    return category;
  };

  return (
    <div className="card-mobile">
      <h3 className="text-mobile-lg text-gray-800 mb-4">Expenses Breakdown</h3>
      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCategory}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatAmount(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
