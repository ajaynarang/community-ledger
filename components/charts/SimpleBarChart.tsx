'use client';

import { inr } from '@/lib/utils';

interface SimpleBarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
}

export function SimpleBarChart({ data, title, height = 200 }: SimpleBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      
      <div className="space-y-3" style={{ height }}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const barColor = item.color || 'hsl(var(--primary))';
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-right text-muted-foreground truncate">
                {item.label}
              </div>
              
              <div className="flex-1 relative">
                <div className="h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
                
                <div className="absolute inset-y-0 left-2 flex items-center">
                  <span className="text-xs font-medium text-white/90">
                    {inr(item.value)}
                  </span>
                </div>
              </div>
              
              <div className="w-16 text-sm text-muted-foreground text-right">
                {percentage.toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
