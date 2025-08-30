'use client';

import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import type { ChartDataPoint } from '@/lib/types';
import { inr } from '@/lib/utils';

interface BilledVsCollectedChartProps {
  data: ChartDataPoint[];
}

export function BilledVsCollectedChart({ data }: BilledVsCollectedChartProps) {
  // Ensure data is valid and has the expected structure
  const chartData = data?.filter(item => item && typeof item === 'object' && item.period) || [];
  
  const formatTooltip = (value: number, name: string) => {
    if (name === 'efficiency') {
      return [`${value.toFixed(1)}%`, 'Collection Efficiency'];
    }
    return [inr(value), name === 'billed' ? 'Billed' : 'Collected'];
  };

  const formatXAxis = (tickItem: string) => {
    if (!tickItem || typeof tickItem !== 'string') return '';
    const [year, month] = tickItem.split('-');
    if (!year || !month) return tickItem;
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit'
    });
  };

  if (!chartData.length) {
    return (
      <div className="h-72 flex items-center justify-center text-muted-foreground">
        No data available for the selected period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="period" 
          tickFormatter={formatXAxis}
          className="text-xs fill-muted-foreground"
        />
        <YAxis 
          yAxisId="amount"
          tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
          className="text-xs fill-muted-foreground"
        />
        <YAxis 
          yAxisId="percentage"
          orientation="right"
          tickFormatter={(value) => `${value}%`}
          className="text-xs fill-muted-foreground"
        />
        <Tooltip 
          formatter={formatTooltip}
          labelFormatter={(label) => `Period: ${formatXAxis(label)}`}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
        />
        <Legend />
        
        <Bar 
          yAxisId="amount"
          dataKey="billed" 
          fill="hsl(var(--primary))" 
          name="Billed"
          opacity={0.8}
        />
        <Bar 
          yAxisId="amount"
          dataKey="collected" 
          fill="hsl(var(--secondary))" 
          name="Collected"
          opacity={0.8}
        />
        <Line 
          yAxisId="percentage"
          type="monotone" 
          dataKey="efficiency" 
          stroke="hsl(var(--destructive))" 
          strokeWidth={2}
          name="Collection Efficiency %"
          dot={{ fill: 'hsl(var(--destructive))' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
