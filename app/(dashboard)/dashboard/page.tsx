'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { SimpleDashboard } from '@/components/SimpleDashboard';
import { monthKey } from '@/lib/utils';

interface DashboardData {
  monthlyData: any;
  last6MonthsData: any[];
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const currentMonth = monthKey(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const handleMonthChange = useCallback((month: string) => {
    setIsLoading(true);
    setSelectedMonth(month);
  }, []);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await fetch(`/api/dashboard-data?month=${selectedMonth}`);
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedMonth]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Executive overview of your society's financial health
          </p>
        </div>
      </div>

      {/* Month Switcher */}
      <div className="flex justify-center">
        <MonthSwitcher
          currentMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />
      </div>

      {/* Dashboard Data */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : dashboardData ? (
        <SimpleDashboard 
          monthlyData={dashboardData.monthlyData} 
          last6MonthsData={dashboardData.last6MonthsData} 
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      )}
    </div>
  );
}
