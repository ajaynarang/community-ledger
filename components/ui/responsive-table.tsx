'use client';

import { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ResponsiveTableProps {
  headers: {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
    hideOnMobile?: boolean;
  }[];
  data: Record<string, any>[];
  emptyMessage?: string;
  className?: string;
  mobileCardLayout?: boolean;
}

export function ResponsiveTable({ 
  headers, 
  data, 
  emptyMessage = "No data available", 
  className = "",
  mobileCardLayout = true 
}: ResponsiveTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead 
                    key={header.key} 
                    className={`${header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'} ${header.className || ''}`}
                  >
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  {headers.map((header) => (
                    <TableCell 
                      key={header.key}
                      className={`${header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'} ${header.className || ''}`}
                    >
                      {row[header.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      {mobileCardLayout && (
        <div className="md:hidden space-y-3">
          {data.map((row, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {headers
                    .filter(header => !header.hideOnMobile)
                    .map((header) => {
                      const value = row[header.key];
                      const isAction = header.key === 'actions' || header.label.toLowerCase().includes('action');
                      
                      return (
                        <div key={header.key} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            {header.label}
                          </span>
                          <div className={`${header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'} ${isAction ? 'flex-shrink-0' : ''}`}>
                            {value}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mobile Table View (Simplified) */}
      {!mobileCardLayout && (
        <div className="md:hidden">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers
                    .filter(header => !header.hideOnMobile)
                    .map((header) => (
                      <TableHead 
                        key={header.key} 
                        className={`${header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'} ${header.className || ''}`}
                      >
                        {header.label}
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    {headers
                      .filter(header => !header.hideOnMobile)
                      .map((header) => (
                        <TableCell 
                          key={header.key}
                          className={`${header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'} ${header.className || ''}`}
                        >
                          {row[header.key]}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for complex table cells that need special formatting
export function TableCellContent({ 
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

// Enhanced mobile-friendly table wrapper
export function MobileFriendlyTable({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={`${className}`}>
      {/* Desktop view */}
      <div className="hidden md:block">
        <div className="rounded-md border overflow-x-auto">
          {children}
        </div>
      </div>
      
      {/* Mobile view with horizontal scroll */}
      <div className="md:hidden">
        <div className="rounded-md border overflow-x-auto">
          <div className="min-w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
