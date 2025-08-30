'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';

interface MobileSummaryProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
  className?: string;
}

export function MobileSummary({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = "text-primary",
  className = "" 
}: MobileSummaryProps) {
  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          <div className={`text-right ${color}`}>
            <p className="text-lg font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MobileSummaryGridProps {
  children: ReactNode;
  className?: string;
}

export function MobileSummaryGrid({ children, className = "" }: MobileSummaryGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {children}
    </div>
  );
}

// Mobile-friendly table row component
export function MobileTableRow({ 
  children, 
  className = "",
  onClick 
}: { 
  children: ReactNode; 
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Mobile-friendly table cell component
export function MobileTableCell({ 
  children, 
  className = "",
  align = "left"
}: { 
  children: ReactNode; 
  className?: string;
  align?: 'left' | 'center' | 'right';
}) {
  return (
    <div className={`${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      {children}
    </div>
  );
}
