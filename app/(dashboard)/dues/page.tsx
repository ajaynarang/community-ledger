import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, AlertTriangle, CheckCircle, Clock, Phone } from 'lucide-react';
import { db } from '@/lib/db';
import { inr, formatDate, getDaysDifference } from '@/lib/utils';
import Link from 'next/link';

async function DuesDetails() {
  const duesAging = await db.getDuesAging();
  const units = await db.getUnits();
  
  // Combine dues with unit information
  const duesWithUnitInfo = duesAging.map(due => {
    const unit = units.find(u => u.id === due.unitId);
    const totalDue = due.currentDue + due.totalOverdue;
    
    // Calculate days overdue for the worst case
    let daysOverdue = 0;
    if (due.aging90plus > 0) daysOverdue = 120; // Assume 120+ days for 90+ bucket
    else if (due.aging61to90 > 0) daysOverdue = 75;
    else if (due.aging31to60 > 0) daysOverdue = 45;
    else if (due.aging0to30 > 0) daysOverdue = 15;
    
    return {
      ...due,
      unit,
      totalDue,
      daysOverdue,
      riskLevel: totalDue > 50000 ? 'high' : totalDue > 20000 ? 'medium' : 'low'
    };
  });

  // Separate into categories
  const unitsWithDues = duesWithUnitInfo.filter(d => d.totalDue > 0);
  const paidUnits = duesWithUnitInfo.filter(d => d.totalDue === 0);
  
  // Sort by total due amount (highest first)
  unitsWithDues.sort((a, b) => b.totalDue - a.totalDue);

  const totalOutstanding = unitsWithDues.reduce((sum, due) => sum + due.totalDue, 0);
  const highRiskUnits = unitsWithDues.filter(d => d.riskLevel === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">⚠️ Who Owes Money?</h1>
          <p className="text-muted-foreground">Outstanding dues by apartment</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-bold text-red-600">{inr(totalOutstanding)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Units with Dues</p>
            <p className="text-2xl font-bold text-orange-600">{unitsWithDues.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Paid Up Units</p>
            <p className="text-2xl font-bold text-green-600">{paidUnits.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">High Risk</p>
            <p className="text-2xl font-bold text-red-600">{highRiskUnits}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Payment Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Paid Units ({paidUnits.length})</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(paidUnits.length / duesAging.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {((paidUnits.length / duesAging.length) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Pending Units ({unitsWithDues.length})</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(unitsWithDues.length / duesAging.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {((unitsWithDues.length / duesAging.length) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units with Outstanding Dues */}
      {unitsWithDues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Apartments with Pending Dues</span>
            </CardTitle>
            <CardDescription>
              Sorted by amount owed (highest first)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unitsWithDues.slice(0, 20).map((due) => (
                <div key={due.unitId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="font-mono font-bold text-lg">{due.unitId}</p>
                      <Badge variant={due.unit?.occupancy === 'Owner' ? 'default' : 'secondary'} className="text-xs">
                        {due.unit?.occupancy}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="font-medium">{due.unit?.ownerName}</p>
                      {due.unit?.tenantName && (
                        <p className="text-sm text-muted-foreground">Tenant: {due.unit.tenantName}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-3 w-3" />
                        <span className="text-sm text-muted-foreground">{due.unit?.mobile}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-lg font-bold text-red-600">{inr(due.totalDue)}</p>
                    
                    <div className="flex items-center space-x-2">
                      {due.daysOverdue > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          {due.daysOverdue}+ days
                        </Badge>
                      )}
                      
                      <Badge 
                        variant={
                          due.riskLevel === 'high' ? 'destructive' : 
                          due.riskLevel === 'medium' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {due.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {due.escalationStage !== 'None' && (
                        <span>Action: {due.escalationStage}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {unitsWithDues.length > 20 && (
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing top 20 of {unitsWithDues.length} units with dues
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Well-Paid Units (Sample) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>👏 Well-Paid Apartments</span>
          </CardTitle>
          <CardDescription>
            Units with no outstanding dues (showing sample)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paidUnits.slice(0, 9).map((due) => (
              <div key={due.unitId} className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold">{due.unitId}</p>
                    <p className="text-sm text-muted-foreground">{due.unit?.ownerName}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <Badge variant="outline" className="text-xs mt-2">
                  {due.unit?.occupancy} • Up to date
                </Badge>
              </div>
            ))}
          </div>
          
          {paidUnits.length > 9 && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                ...and {paidUnits.length - 9} more units are up to date! 🎉
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16">
              📧 Send Reminders<br/>
              <span className="text-xs">to {unitsWithDues.length} units</span>
            </Button>
            
            <Button variant="outline" className="h-16">
              📞 Call High Risk<br/>
              <span className="text-xs">{highRiskUnits} units</span>
            </Button>
            
            <Button variant="outline" className="h-16">
              📊 Download Report<br/>
              <span className="text-xs">Excel format</span>
            </Button>
            
            <Button variant="outline" className="h-16">
              ⚖️ Legal Action<br/>
              <span className="text-xs">for 90+ days</span>
            </Button>
          </div>
        </CardContent>
      </Card>
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
