'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown,
  Users,
  Building2,
  AlertTriangle,
  Eye,
  ChevronRight,
  Calendar,
  Home
} from 'lucide-react';
import { inr, formatNumber, getMonthName, monthKey } from '@/lib/utils';
import Link from 'next/link';

interface SimpleDashboardProps {
  monthlyData: {
    month: string;
    totalBilled: number;
    totalCollected: number;
    collectionRate: number;
    totalExpenses: number;
    netSurplus: number;
    unitsWithDues: number;
    totalUnits: number;
    maintenancePaid: number;
    maintenanceUnits: number;
    sinkingFundCollected: number;
    topExpenseCategory: string;
    topExpenseAmount: number;
    sinkingFundBalance: number;
  };
  last6MonthsData: Array<{
    month: string;
    collected: number;
    expenses: number;
    surplus: number;
  }>;
}

interface ClickableCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color?: string;
  trend?: 'up' | 'down' | null;
  onClick?: () => void;
  href?: string;
}

function ClickableCard({ title, value, subtitle, icon: Icon, color = 'text-primary', trend, onClick, href }: ClickableCardProps) {
  const cardContent = (
    <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              {trend && (
                <Badge variant={trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                  {trend === 'up' ? '↗️' : '↘️'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Icon className={`h-8 w-8 ${color}`} />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return (
    <div onClick={onClick}>
      {cardContent}
    </div>
  );
}

export function SimpleDashboard({ monthlyData, last6MonthsData }: SimpleDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState(monthlyData.month);
  
  return (
    <div className="space-y-6">
      {/* Month Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">ATS Financial Summary</h1>
        <p className="text-lg text-muted-foreground">{getMonthName(monthlyData.month)}</p>
        <Badge variant="outline" className="text-sm">
          <Building2 className="mr-1 h-3 w-3" />
          {monthlyData.totalUnits} Total Apartments
        </Badge>
      </div>

      {/* Key Metrics - Simple and Clear */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Flats with Owner/Renter Breakdown */}
        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">🏢 Total Flats</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-blue-600">{formatNumber(monthlyData.totalUnits)}</p>
                </div>
                <p className="text-xs text-muted-foreground">{`${Math.round(monthlyData.totalUnits * 0.7)} owners • ${Math.round(monthlyData.totalUnits * 0.3)} renters`}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Money In */}
        <ClickableCard
          title="💰 Money Collected"
          value={inr(monthlyData.totalCollected)}
          subtitle={`${monthlyData.collectionRate.toFixed(1)}% collection rate`}
          icon={TrendingUp}
          color="text-green-600"
          trend="up"
          href="/income"
        />

        {/* Money Out */}
        <ClickableCard
          title="💸 Money Spent"
          value={inr(monthlyData.totalExpenses)}
          subtitle={`Top: ${monthlyData.topExpenseCategory}`}
          icon={TrendingDown}
          color="text-red-600"
          href="/expenses"
        />

        {/* Surplus/Deficit */}
        <ClickableCard
          title={monthlyData.netSurplus >= 0 ? "💚 Surplus" : "❤️ Deficit"}
          value={inr(Math.abs(monthlyData.netSurplus))}
          subtitle={monthlyData.netSurplus >= 0 ? "Money saved this month" : "Overspent this month"}
          icon={monthlyData.netSurplus >= 0 ? TrendingUp : AlertTriangle}
          color={monthlyData.netSurplus >= 0 ? "text-green-600" : "text-red-600"}
          trend={monthlyData.netSurplus >= 0 ? "up" : "down"}
        />

        {/* Pending Dues */}
        <ClickableCard
          title="⚠️ Pending Payments"
          value={`${monthlyData.unitsWithDues} flats`}
          subtitle={`Out of ${monthlyData.totalUnits} total flats`}
          icon={AlertTriangle}
          color={monthlyData.unitsWithDues > monthlyData.totalUnits * 0.1 ? "text-red-600" : "text-green-600"}
          href="/dues"
        />
      </div>

      {/* Monthly Breakdown - What Everyone Wants to Know */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Collection Details */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {}}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🏠 Maintenance Collection</span>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Who paid maintenance this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-green-600">{inr(monthlyData.maintenancePaid)}</span>
              <Badge variant="outline">{monthlyData.maintenanceUnits} flats paid</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Payment Progress</span>
                <span>{((monthlyData.maintenanceUnits / monthlyData.totalUnits) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={(monthlyData.maintenanceUnits / monthlyData.totalUnits) * 100} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-lg font-semibold text-green-600">{monthlyData.maintenanceUnits}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold text-red-600">{monthlyData.totalUnits - monthlyData.maintenanceUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sinking Fund Status */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🏦 Sinking Fund</span>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Emergency & maintenance reserve</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{inr(monthlyData.sinkingFundCollected)}</p>
              <p className="text-sm text-muted-foreground">Collected this month</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">💰 Total Fund Balance</span>
                <span className="font-bold text-blue-700">{inr(5000000)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">📈 Monthly Growth</span>
                <span className="font-bold text-green-700">+{inr(monthlyData.sinkingFundCollected)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6-Month Trend - Simple Visual */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📊 Last 6 Months Trend</span>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
          <CardDescription>Financial health over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {last6MonthsData.map((month, index) => {
              const isPositive = month.surplus >= 0;
              const maxAmount = Math.max(...last6MonthsData.map(m => Math.max(m.collected, m.expenses)));
              
              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{getMonthName(month.month)}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{inr(month.surplus)}
                      </span>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* Collections Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Collected</span>
                        <span>{inr(month.collected)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${(month.collected / maxAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Expenses Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Spent</span>
                        <span>{inr(month.expenses)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all duration-500"
                          style={{ width: `${(month.expenses / maxAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dues">
          <Button variant="outline" className="w-full h-12">
            <Users className="mr-2 h-4 w-4" />
            Who Owes Money?
          </Button>
        </Link>
        
        <Link href="/expenses">
          <Button variant="outline" className="w-full h-12">
            <IndianRupee className="mr-2 h-4 w-4" />
            Where's Money Going?
          </Button>
        </Link>
        
        <Link href="/income">
          <Button variant="outline" className="w-full h-12">
            <TrendingUp className="mr-2 h-4 w-4" />
            Collection Details
          </Button>
        </Link>
        
        <Link href="/sinking-fund">
          <Button variant="outline" className="w-full h-12">
            <Building2 className="mr-2 h-4 w-4" />
            Emergency Fund
          </Button>
        </Link>
      </div>
    </div>
  );
}
