'use client';

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { db } from '@/lib/db';
import { inr, monthKey, addMonths } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface CashflowData {
  period: string;
  inflow: number;
  outflow: number;
  netFlow: number;
}

export function CashflowChart() {
  const [data, setData] = useState<CashflowData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const cashflowData: CashflowData[] = [];
        const currentDate = new Date();
        
        for (let i = 11; i >= 0; i--) {
          const targetDate = addMonths(currentDate, -i);
          const period = monthKey(targetDate);
          
          // Get payments (inflow) for the month
          const payments = await db.getPayments({
            dateFrom: `${period}-01`,
            dateTo: `${period}-31`
          });
          
          // Get expenses (outflow) for the month
          const expenses = await db.getExpenses({
            dateFrom: `${period}-01`,
            dateTo: `${period}-31`
          });
          
          const inflow = payments?.reduce((sum, payment) => sum + (payment?.amount || 0), 0) || 0;
          const outflow = expenses?.reduce((sum, expense) => sum + (expense?.amount || 0) + (expense?.tax || 0), 0) || 0;
          const netFlow = inflow - outflow;
          
          // Only add valid data points
          if (period) {
            cashflowData.push({
              period,
              inflow,
              outflow,
              netFlow
            });
          }
        }
        
        setData(cashflowData);
      } catch (error) {
        console.error('Error loading cashflow data:', error);
        setData([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const formatTooltip = (value: number, name: string) => {
    const labels = {
      inflow: 'Inflow (Collections)',
      outflow: 'Outflow (Expenses)',
      netFlow: 'Net Cashflow'
    };
    return [inr(value), labels[name as keyof typeof labels] || name];
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

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading...</div>;
  }

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No cashflow data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="period" 
          tickFormatter={formatXAxis}
          className="text-xs fill-muted-foreground"
        />
        <YAxis 
          tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
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
        
        <Area
          type="monotone"
          dataKey="inflow"
          stackId="1"
          stroke="hsl(var(--primary))"
          fill="url(#inflowGradient)"
          name="inflow"
        />
        <Area
          type="monotone"
          dataKey="outflow"
          stackId="2"
          stroke="hsl(var(--destructive))"
          fill="url(#outflowGradient)"
          name="outflow"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
