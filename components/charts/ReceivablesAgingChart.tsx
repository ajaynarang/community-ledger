'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { db } from '@/lib/db';
import { inr } from '@/lib/utils';
import { useEffect, useState } from 'react';

const AGING_COLORS = {
  'Current': 'hsl(var(--primary))',
  '0-30 days': 'hsl(var(--secondary))', 
  '31-60 days': 'hsl(var(--warning))',
  '61-90 days': 'hsl(var(--destructive))',
  '90+ days': 'hsl(var(--destructive))'
};

export function ReceivablesAgingChart() {
  const [data, setData] = useState<Array<{name: string, value: number}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const duesAging = await db.getDuesAging();
        
        const agingData = {
          'Current': 0,
          '0-30 days': 0,
          '31-60 days': 0,
          '61-90 days': 0,
          '90+ days': 0
        };

        duesAging.forEach(dues => {
          agingData['Current'] += dues.currentDue;
          agingData['0-30 days'] += dues.aging0to30;
          agingData['31-60 days'] += dues.aging31to60;
          agingData['61-90 days'] += dues.aging61to90;
          agingData['90+ days'] += dues.aging90plus;
        });

        const chartData = Object.entries(agingData)
          .filter(([_, value]) => value > 0)
          .map(([name, value]) => ({ name, value }));

        setData(chartData);
      } catch (error) {
        console.error('Error loading receivables aging data:', error);
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
        No outstanding receivables
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
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={AGING_COLORS[entry.name as keyof typeof AGING_COLORS] || 'hsl(var(--muted))'} 
            />
          ))}
        </Pie>
        <Tooltip formatter={formatTooltip} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
