import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search, AlertTriangle, CheckCircle, Clock, Phone, Building, PiggyBank } from 'lucide-react';
import { db } from '@/lib/db';
import { inr, formatDate, getDaysDifference } from '@/lib/utils';
import Link from 'next/link';

async function DuesDetails() {
  const duesAging = await db.getDuesAging();
  const units = await db.getUnits();
  const invoices = await db.getInvoices();
  const payments = await db.getPayments();
  
  // Get current month for filtering
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  // Get invoices due in current month
  const currentMonthInvoices = invoices.filter(inv => {
    const dueDate = new Date(inv.dueDate);
    const dueMonth = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
    return dueMonth === currentMonth;
  });
  
  // Get payments made in current month
  const currentMonthPayments = payments.filter(pay => {
    const paymentDate = new Date(pay.date);
    const paymentMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
    return paymentMonth === currentMonth;
  });

  // Separate maintenance and sinking fund data
  const maintenanceInvoices = currentMonthInvoices.filter(inv => inv.type === 'Maintenance');
  const sinkingFundInvoices = currentMonthInvoices.filter(inv => inv.type === 'SinkingFund');
  
  const maintenancePayments = currentMonthPayments.filter(pay => {
    const invoice = currentMonthInvoices.find(inv => inv.id === pay.againstInvoiceId);
    return invoice && invoice.type === 'Maintenance';
  });
  
  const sinkingFundPayments = currentMonthPayments.filter(pay => {
    const invoice = currentMonthInvoices.find(inv => inv.id === pay.againstInvoiceId);
    return invoice && invoice.type === 'SinkingFund';
  });

  // Calculate maintenance dues
  const maintenanceDues = units.map(unit => {
    const unitMaintenanceInvoices = maintenanceInvoices.filter(inv => inv.unitId === unit.id);
    const unitMaintenancePayments = maintenancePayments.filter(pay => pay.unitId === unit.id);
    
    const totalBilled = unitMaintenanceInvoices.reduce((sum, inv) => sum + inv.amount + inv.tax, 0);
    const totalPaid = unitMaintenancePayments.reduce((sum, pay) => sum + pay.amount, 0);
    const outstanding = totalBilled - totalPaid;
    
    return {
      unitId: unit.id,
      unit,
      totalBilled,
      totalPaid,
      outstanding,
      status: outstanding > 0 ? 'pending' : 'paid'
    };
  });

  // Calculate sinking fund dues
  const sinkingFundDues = units.map(unit => {
    const unitSinkingInvoices = sinkingFundInvoices.filter(inv => inv.unitId === unit.id);
    const unitSinkingPayments = sinkingFundPayments.filter(pay => pay.unitId === unit.id);
    
    const totalBilled = unitSinkingInvoices.reduce((sum, inv) => sum + inv.amount + inv.tax, 0);
    const totalPaid = unitSinkingPayments.reduce((sum, pay) => sum + pay.amount, 0);
    const outstanding = totalBilled - totalPaid;
    
    return {
      unitId: unit.id,
      unit,
      totalBilled,
      totalPaid,
      outstanding,
      status: outstanding > 0 ? 'pending' : 'paid'
    };
  });

  // Summary statistics
  const maintenanceSummary = {
    totalBilled: maintenanceInvoices.reduce((sum, inv) => sum + inv.amount + inv.tax, 0),
    totalCollected: maintenancePayments.reduce((sum, pay) => sum + pay.amount, 0),
    pendingUnits: maintenanceDues.filter(d => d.outstanding > 0).length,
    paidUnits: maintenanceDues.filter(d => d.outstanding === 0).length,
    collectionRate: maintenanceInvoices.reduce((sum, inv) => sum + inv.amount + inv.tax, 0) > 0 ? 
      (maintenancePayments.reduce((sum, pay) => sum + pay.amount, 0) / maintenanceInvoices.reduce((sum, inv) => sum + inv.amount + inv.tax, 0)) * 100 : 0
  };

  const sinkingFundSummary = {
    totalBilled: sinkingFundInvoices.reduce((sum, inv) => sum + inv.amount + inv.tax, 0),
    totalCollected: sinkingFundPayments.reduce((sum, pay) => sum + pay.amount, 0),
    pendingUnits: sinkingFundDues.filter(d => d.outstanding > 0).length,
    paidUnits: sinkingFundDues.filter(d => d.outstanding === 0).length,
    collectionRate: sinkingFundInvoices.reduce((sum, inv) => sum + inv.amount + inv.tax, 0) > 0 ? 
      (sinkingFundPayments.reduce((sum, pay) => sum + pay.amount, 0) / sinkingFundInvoices.reduce((sum, inv) => sum + inv.amount + inv.tax, 0)) * 100 : 0
  };

  // Find units with mixed payment status
  const mixedStatusUnits = units.filter(unit => {
    const maintenanceDue = maintenanceDues.find(d => d.unitId === unit.id);
    const sinkingDue = sinkingFundDues.find(d => d.unitId === unit.id);
    return maintenanceDue && sinkingDue && 
           ((maintenanceDue.status === 'paid' && sinkingDue.status === 'pending') ||
            (maintenanceDue.status === 'pending' && sinkingDue.status === 'paid'));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button - Separate row for mobile */}
        <div className="flex justify-start">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        
        {/* Title - Separate row for mobile */}
        <div>
          <h1 className="text-3xl font-bold">⚠️ Dues Breakdown</h1>
          <p className="text-muted-foreground">Maintenance vs Sinking Fund payments</p>
        </div>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Maintenance Due</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{inr(maintenanceSummary.totalBilled - maintenanceSummary.totalCollected)}</p>
            <p className="text-xs text-muted-foreground">{maintenanceSummary.pendingUnits} units pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Sinking Fund Due</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{inr(sinkingFundSummary.totalBilled - sinkingFundSummary.totalCollected)}</p>
            <p className="text-xs text-muted-foreground">{sinkingFundSummary.pendingUnits} units pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Status Units</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{mixedStatusUnits.length}</p>
            <p className="text-xs text-muted-foreground">Partial payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Fully Paid Units</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
              {units.filter(unit => {
                const maintenanceDue = maintenanceDues.find(d => d.unitId === unit.id);
                const sinkingDue = sinkingFundDues.find(d => d.unitId === unit.id);
                return maintenanceDue && sinkingDue && 
                       maintenanceDue.status === 'paid' && sinkingDue.status === 'paid';
              }).length}
            </p>
            <p className="text-xs text-muted-foreground">Both dues paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Maintenance and Sinking Fund */}
      <Tabs defaultValue="maintenance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="maintenance" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Maintenance Dues</span>
          </TabsTrigger>
          <TabsTrigger value="sinking-fund" className="flex items-center space-x-2">
            <PiggyBank className="h-4 w-4" />
            <span>Sinking Fund Dues</span>
          </TabsTrigger>
        </TabsList>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          {/* Maintenance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-500" />
                <span>Maintenance Collection Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{inr(maintenanceSummary.totalBilled)}</p>
                  <p className="text-sm text-muted-foreground">Total Billed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{inr(maintenanceSummary.totalCollected)}</p>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{maintenanceSummary.collectionRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Collection Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Pending Units */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Maintenance Pending ({maintenanceSummary.pendingUnits} units)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenanceDues
                  .filter(d => d.outstanding > 0)
                  .sort((a, b) => b.outstanding - a.outstanding)
                  .slice(0, 15)
                  .map((due) => (
                    <div key={due.unitId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <p className="font-mono font-bold text-base">{due.unitId}</p>
                          <Badge variant={due.unit?.occupancy === 'Owner' ? 'default' : 'secondary'} className="text-xs mt-1">
                            {due.unit?.occupancy}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Billed:</span>
                              <span className="font-medium">{inr(due.totalBilled)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Paid:</span>
                              <span className="font-medium text-green-600">{inr(due.totalPaid)}</span>
                            </div>
                          </div>
                          <div className="w-40 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((due.outstanding / due.totalBilled) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{inr(due.outstanding)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((due.outstanding / due.totalBilled) * 100).toFixed(1)}% pending
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sinking Fund Tab */}
        <TabsContent value="sinking-fund" className="space-y-4">
          {/* Sinking Fund Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PiggyBank className="h-5 w-5 text-purple-500" />
                <span>Sinking Fund Collection Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{inr(sinkingFundSummary.totalBilled)}</p>
                  <p className="text-sm text-muted-foreground">Total Billed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{inr(sinkingFundSummary.totalCollected)}</p>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{sinkingFundSummary.collectionRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Collection Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sinking Fund Pending Units */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Sinking Fund Pending ({sinkingFundSummary.pendingUnits} units)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sinkingFundDues
                  .filter(d => d.outstanding > 0)
                  .sort((a, b) => b.outstanding - a.outstanding)
                  .slice(0, 15)
                  .map((due) => (
                    <div key={due.unitId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <p className="font-mono font-bold text-base">{due.unitId}</p>
                          <Badge variant={due.unit?.occupancy === 'Owner' ? 'default' : 'secondary'} className="text-xs mt-1">
                            {due.unit?.occupancy}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Billed:</span>
                              <span className="font-medium">{inr(due.totalBilled)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Paid:</span>
                              <span className="font-medium text-green-600">{inr(due.totalPaid)}</span>
                            </div>
                          </div>
                          <div className="w-40 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((due.outstanding / due.totalBilled) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{inr(due.outstanding)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((due.outstanding / due.totalBilled) * 100).toFixed(1)}% pending
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DuesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<div className="text-center py-8">Loading dues information...</div>}>
        <DuesDetails />
      </Suspense>
    </div>
  );
}
