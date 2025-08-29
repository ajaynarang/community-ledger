'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface IncomeSource {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface IncomeChartProps {
  data: IncomeSource[];
}

export default function IncomeChart({ data }: IncomeChartProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">{formatAmount(data.amount)}</p>
          <p className="text-sm text-gray-500">{data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-mobile">
      <h3 className="text-mobile-lg text-gray-800 mb-4">Income Sources</h3>
      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-sm text-gray-700">
                  {value} ({entry.payload.percentage}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
