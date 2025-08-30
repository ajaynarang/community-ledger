import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Wallet,
  AlertTriangle,
  Download,
  Bell,
  Plus
} from 'lucide-react';
import { db } from '@/lib/db';
import { inr, formatPercent, formatNumber } from '@/lib/utils';
import { EnhancedDashboardCharts } from '@/components/charts/EnhancedDashboardCharts';

async function DashboardKPIs() {
  const kpis = await db.getKPIMetrics();
  
  const kpiCards = [
    {
      title: 'Total Flats',
      value: formatNumber(kpis.totalFlats),
      icon: Building2,
      description: `${kpis.occupiedFlats} occupied`,
      trend: null
    },
    {
      title: 'Owner vs Tenant',
      value: `${kpis.ownerOccupied}/${kpis.tenantOccupied}`,
      icon: Users,
      description: 'Owner/Tenant split',
      trend: null
    },
    {
      title: 'Billed This Month',
      value: inr(kpis.billedThisMonth),
      icon: IndianRupee,
      description: 'Current month billing',
      trend: null
    },
    {
      title: 'Collected This Month',
      value: inr(kpis.collectedThisMonth),
      icon: TrendingUp,
      description: 'Payments received',
      trend: null
    },
    {
      title: 'Outstanding',
      value: inr(kpis.outstanding),
      icon: AlertTriangle,
      description: 'Total pending dues',
      trend: null,
      variant: kpis.outstanding > 1000000 ? 'destructive' : 'secondary'
    },
    {
      title: 'Collection Efficiency',
      value: formatPercent(kpis.collectionEfficiency),
      icon: TrendingUp,
      description: 'This month performance',
      trend: kpis.collectionEfficiency >= 90 ? 'up' : 'down'
    },
    {
      title: 'Avg Days to Collect',
      value: `${Math.round(kpis.avgDaysToCollect)} days`,
      icon: Clock,
      description: 'Average collection time',
      trend: null
    },
    {
      title: 'Sinking Fund Balance',
      value: inr(kpis.sinkingFundBalance),
      icon: Wallet,
      description: 'Reserve fund available',
      trend: null
    },
    {
      title: 'Monthly Burn Rate',
      value: inr(kpis.monthlyBurnRate),
      icon: TrendingDown,
      description: 'Average monthly expenses',
      trend: null
    },
    {
      title: 'Runway',
      value: `${Math.round(kpis.runwayMonths)} months`,
      icon: AlertTriangle,
      description: 'At current burn rate',
      trend: null,
      variant: kpis.runwayMonths < 12 ? 'destructive' : 'default'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpiCards.map((kpi, index) => (
        <Card key={index} className="relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.trend && (
                <Badge variant={kpi.trend === 'up' ? 'default' : 'secondary'}>
                  {kpi.trend === 'up' ? '↗️' : '↘️'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.description}
            </p>
            {kpi.variant && (
              <Badge 
                variant={kpi.variant as any} 
                className="absolute top-2 right-2 text-xs"
              >
                {kpi.variant === 'destructive' ? '⚠️' : '✓'}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
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
  );
}

// Charts are now handled by the EnhancedDashboardCharts component

export default function DashboardPage() {
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
        
        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            Send Reminder
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardKPIs />
      </Suspense>

      {/* Enhanced Charts */}
      <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
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
      </div>}>
        <EnhancedDashboardCharts />
      </Suspense>
    </div>
  );
}
