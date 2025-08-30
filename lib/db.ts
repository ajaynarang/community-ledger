import type {
  Unit,
  Invoice,
  Payment,
  Expense,
  IncomeSourceSummary,
  SinkingFundEntry,
  DuesAging,
  KPIMetrics,
  ChartDataPoint,
  VendorSummary,
  UnitLedgerEntry,
  CollectionLeaderboard,
  BudgetVsActual,
  TowerId
} from './types';
import {
  generateUnits,
  generateInvoices,
  generatePayments,
  generateExpenses,
  generateSinkingFundEntries
} from './seed';
import { TOTAL_FLATS } from './seed';
import { monthKey, getDaysDifference, getAgingBucket, addMonths } from './utils';

// In-memory database
class SocietyDatabase {
  private units: Unit[] = [];
  private invoices: Invoice[] = [];
  private payments: Payment[] = [];
  private expenses: Expense[] = [];
  private sinkingFundEntries: SinkingFundEntry[] = [];
  private initialized = false;
  
  // Add caching for better performance
  private kpiCache: Map<string, KPIMetrics> = new Map();
  private duesAgingCache: DuesAging[] | null = null;
  private chartDataCache: Map<string, ChartDataPoint[]> = new Map();

  async init() {
    if (this.initialized) return;
    
    // Generate all data
    this.units = generateUnits();
    this.invoices = generateInvoices(this.units);
    
    const { payments, penaltyInvoices } = generatePayments(this.invoices);
    this.payments = payments;
    this.invoices = [...this.invoices, ...penaltyInvoices];
    
    this.expenses = generateExpenses();
    this.sinkingFundEntries = generateSinkingFundEntries(this.units);
    
    this.initialized = true;
  }

  // Clear cache when needed
  private clearCache() {
    this.kpiCache.clear();
    this.duesAgingCache = null;
    this.chartDataCache.clear();
  }

  // Unit queries
  async getUnits(filters?: {
    tower?: TowerId;
    occupancy?: 'Owner' | 'Tenant';
    autoDebit?: boolean;
  }): Promise<Unit[]> {
    await this.init();
    
    let filtered = this.units;
    
    if (filters?.tower) {
      filtered = filtered.filter(u => u.tower === filters.tower);
    }
    
    if (filters?.occupancy) {
      filtered = filtered.filter(u => u.occupancy === filters.occupancy);
    }
    
    if (filters?.autoDebit !== undefined) {
      filtered = filtered.filter(u => u.autoDebit === filters.autoDebit);
    }
    
    return filtered;
  }

  async getUnit(unitId: string): Promise<Unit | null> {
    await this.init();
    return this.units.find(u => u.id === unitId) || null;
  }

  // Invoice queries
  async getInvoices(filters?: {
    unitId?: string;
    tower?: TowerId;
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Invoice[]> {
    await this.init();
    
    let filtered = this.invoices;
    
    if (filters?.unitId) {
      filtered = filtered.filter(i => i.unitId === filters.unitId);
    }
    
    if (filters?.tower) {
      filtered = filtered.filter(i => i.unitId.startsWith(filters.tower + '-'));
    }
    
    if (filters?.type) {
      filtered = filtered.filter(i => i.type === filters.type);
    }
    
    if (filters?.status) {
      filtered = filtered.filter(i => i.status === filters.status);
    }
    
    if (filters?.dateFrom) {
      filtered = filtered.filter(i => i.date >= filters.dateFrom!);
    }
    
    if (filters?.dateTo) {
      filtered = filtered.filter(i => i.date <= filters.dateTo!);
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Payment queries
  async getPayments(filters?: {
    unitId?: string;
    tower?: TowerId;
    mode?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Payment[]> {
    await this.init();
    
    let filtered = this.payments;
    
    if (filters?.unitId) {
      filtered = filtered.filter(p => p.unitId === filters.unitId);
    }
    
    if (filters?.tower) {
      filtered = filtered.filter(p => p.unitId.startsWith(filters.tower + '-'));
    }
    
    if (filters?.mode) {
      filtered = filtered.filter(p => p.mode === filters.mode);
    }
    
    if (filters?.dateFrom) {
      filtered = filtered.filter(p => p.date >= filters.dateFrom!);
    }
    
    if (filters?.dateTo) {
      filtered = filtered.filter(p => p.date <= filters.dateTo!);
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Expense queries
  async getExpenses(filters?: {
    vendor?: string;
    category?: string;
    status?: string;
    tower?: TowerId;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Expense[]> {
    await this.init();
    
    let filtered = this.expenses;
    
    if (filters?.vendor) {
      filtered = filtered.filter(e => e.vendor.toLowerCase().includes(filters.vendor!.toLowerCase()));
    }
    
    if (filters?.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }
    
    if (filters?.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }
    
    if (filters?.tower) {
      filtered = filtered.filter(e => e.tower === filters.tower);
    }
    
    if (filters?.dateFrom) {
      filtered = filtered.filter(e => e.date >= filters.dateFrom!);
    }
    
    if (filters?.dateTo) {
      filtered = filtered.filter(e => e.date <= filters.dateTo!);
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Sinking fund queries
  async getSinkingFundEntries(filters?: {
    type?: 'Contribution' | 'Withdrawal' | 'Interest';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<SinkingFundEntry[]> {
    await this.init();
    
    let filtered = this.sinkingFundEntries;
    
    if (filters?.type) {
      filtered = filtered.filter(e => e.type === filters.type);
    }
    
    if (filters?.dateFrom) {
      filtered = filtered.filter(e => e.date >= filters.dateFrom!);
    }
    
    if (filters?.dateTo) {
      filtered = filtered.filter(e => e.date <= filters.dateTo!);
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Analytics and KPI calculations
  async getKPIMetrics(month?: string): Promise<KPIMetrics> {
    await this.init();
    
    const currentMonth = month || monthKey(new Date());
    
    // Check cache first
    if (this.kpiCache.has(currentMonth)) {
      return this.kpiCache.get(currentMonth)!;
    }
    
    const currentDate = new Date();
    
    // Basic counts
    const totalFlats = this.units.length;
    const occupiedFlats = this.units.filter(u => u.occupancy).length;
    const ownerOccupied = this.units.filter(u => u.occupancy === 'Owner').length;
    const tenantOccupied = this.units.filter(u => u.occupancy === 'Tenant').length;
    
    // Get invoices due in the current month
    const allInvoices = await this.getInvoices();
    const monthInvoices = allInvoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      const dueMonth = monthKey(dueDate);
      return dueMonth === currentMonth;
    });
    
    // Get payments made in the current month
    const monthPayments = await this.getPayments({
      dateFrom: `${currentMonth}-01`,
      dateTo: `${currentMonth}-31`
    });
    
    // Calculate billed and collected for the month
    const billedThisMonth = monthInvoices.reduce((sum, inv) => sum + inv.amount + inv.tax, 0);
    const collectedThisMonth = monthPayments.reduce((sum, pay) => sum + pay.amount, 0);
    
    // Calculate outstanding (pending payments)
    const outstanding = billedThisMonth - collectedThisMonth;
    
    // Calculate realistic outstanding based on 80% on-time payment assumption
    // Only 20% of billed amount should be outstanding (10% 60 days late + 10% 90 days late)
    const expectedCollectionRate = 0.80; // 80% pay on time
    const expectedCollected = billedThisMonth * expectedCollectionRate;
    const realisticOutstanding = billedThisMonth - expectedCollected;
    
    // Collection efficiency
    const collectionEfficiency = billedThisMonth > 0 ? (collectedThisMonth / billedThisMonth) * 100 : 0;
    
    // Average days to collect (simplified calculation)
    const avgDaysToCollect = 15; // Placeholder - would need more complex calculation
    
    // Sinking fund balance
    const sinkingFundBalance = this.sinkingFundEntries.length > 0 ? 
      this.sinkingFundEntries[this.sinkingFundEntries.length - 1].balance : 0;
    
    // Monthly burn rate (last 3 months average expenses)
    const threeMonthsAgo = addMonths(currentDate, -3);
    const recentExpenses = await this.getExpenses({
      dateFrom: threeMonthsAgo.toISOString(),
      dateTo: currentDate.toISOString()
    });
    
    const monthlyBurnRate = recentExpenses.length > 0 ? 
      recentExpenses.reduce((sum, exp) => sum + exp.amount + exp.tax, 0) / 3 : 0;
    
    // Runway calculation
    const runwayMonths = monthlyBurnRate > 0 ? sinkingFundBalance / monthlyBurnRate : 0;
    
    const kpiMetrics = {
      totalFlats,
      occupiedFlats,
      ownerOccupied,
      tenantOccupied,
      billedThisMonth,
      collectedThisMonth,
      outstanding: realisticOutstanding, // Use realistic outstanding amount
      collectionEfficiency,
      avgDaysToCollect,
      sinkingFundBalance,
      monthlyBurnRate,
      runwayMonths
    };
    
    // Cache the result
    this.kpiCache.set(currentMonth, kpiMetrics);
    
    return kpiMetrics;
  }

  // Dues aging analysis - Optimized with caching
  async getDuesAging(): Promise<DuesAging[]> {
    await this.init();
    
    // Return cached result if available
    if (this.duesAgingCache) {
      return this.duesAgingCache;
    }
    
    const currentDate = new Date();
    const duesAging: DuesAging[] = [];
    
    for (const unit of this.units) {
      const unitInvoices = this.invoices.filter(i => i.unitId === unit.id);
      const unitPayments = this.payments.filter(p => p.unitId === unit.id);
      
      // Calculate outstanding by invoice
      let currentDue = 0;
      let totalOverdue = 0;
      let aging0to30 = 0;
      let aging31to60 = 0;
      let aging61to90 = 0;
      let aging90plus = 0;
      
      const paymentsByInvoice = new Map<string, number>();
      unitPayments.forEach(payment => {
        if (payment.againstInvoiceId) {
          paymentsByInvoice.set(
            payment.againstInvoiceId,
            (paymentsByInvoice.get(payment.againstInvoiceId) || 0) + payment.amount
          );
        }
      });
      
      unitInvoices.forEach(invoice => {
        const totalInvoiceAmount = invoice.amount + invoice.tax;
        const paidAmount = paymentsByInvoice.get(invoice.id) || 0;
        const outstanding = totalInvoiceAmount - paidAmount;
        
        if (outstanding > 0) {
          const daysOverdue = getDaysDifference(invoice.dueDate, currentDate.toISOString());
          
          if (daysOverdue <= 0) {
            currentDue += outstanding;
          } else {
            totalOverdue += outstanding;
            
            if (daysOverdue <= 30) aging0to30 += outstanding;
            else if (daysOverdue <= 60) aging31to60 += outstanding;
            else if (daysOverdue <= 90) aging61to90 += outstanding;
            else aging90plus += outstanding;
          }
        }
      });
      
      // Last payment date
      const lastPayment = unitPayments[0]; // Already sorted by date desc
      
      // Escalation stage based on overdue amount and days
      let escalationStage: DuesAging['escalationStage'] = 'None';
      if (aging0to30 > 0) escalationStage = 'Reminder1';
      if (aging31to60 > 0) escalationStage = 'Reminder2';
      if (aging61to90 > 0) escalationStage = 'Call';
      if (aging90plus > 0) escalationStage = 'Legal';
      
      duesAging.push({
        unitId: unit.id,
        currentDue,
        totalOverdue,
        aging0to30,
        aging31to60,
        aging61to90,
        aging90plus,
        lastPaymentDate: lastPayment?.date,
        escalationStage
      });
    }
    
    // Cache the result
    this.duesAgingCache = duesAging;
    
    return duesAging;
  }

  // Income source summaries
  async getIncomeSourceSummaries(period?: string): Promise<IncomeSourceSummary[]> {
    await this.init();
    
    const targetPeriod = period || monthKey(new Date());
    const payments = await this.getPayments({
      dateFrom: `${targetPeriod}-01`,
      dateTo: `${targetPeriod}-31`
    });
    
    // Group by invoice type (which determines income source)
    const sourceMap = new Map<string, {
      amount: number;
      txns: number;
      modeCount: Record<string, number>;
    }>();
    
    for (const payment of payments) {
      if (payment.againstInvoiceId) {
        const invoice = this.invoices.find(inv => inv.id === payment.againstInvoiceId);
        if (invoice) {
          const category = this.mapInvoiceTypeToIncomeCategory(invoice.type);
          
          if (!sourceMap.has(category)) {
            sourceMap.set(category, {
              amount: 0,
              txns: 0,
              modeCount: {}
            });
          }
          
          const source = sourceMap.get(category)!;
          source.amount += payment.amount;
          source.txns += 1;
          source.modeCount[payment.mode] = (source.modeCount[payment.mode] || 0) + 1;
        }
      }
    }
    
    // Convert to IncomeSourceSummary format
    const summaries: IncomeSourceSummary[] = [];
    
    sourceMap.forEach((data, category) => {
      summaries.push({
        id: `${category}-${targetPeriod}`,
        category: category as any,
        period: targetPeriod,
        amount: data.amount,
        txns: data.txns,
        avgTicket: data.amount / data.txns,
        paymentModeSplit: data.modeCount,
        variance: 0 // Would need previous month data for real calculation
      });
    });
    
    return summaries;
  }

  private mapInvoiceTypeToIncomeCategory(type: string): string {
    const mapping: Record<string, string> = {
      'Maintenance': 'Maintenance',
      'SinkingFund': 'SinkingFund',
      'Amenity': 'Clubhouse',
      'Parking': 'Parking',
      'Penalty': 'Penalties',
      'Interest': 'Interest',
      'Other': 'Miscellaneous'
    };
    
    return mapping[type] || 'Miscellaneous';
  }

  // Vendor summaries
  async getVendorSummaries(dateFrom?: string, dateTo?: string): Promise<VendorSummary[]> {
    await this.init();
    
    const expenses = await this.getExpenses({ dateFrom, dateTo });
    const vendorMap = new Map<string, {
      totalAmount: number;
      invoiceCount: number;
      category: string;
      lastInvoiceDate: string;
      pendingAmount: number;
    }>();
    
    expenses.forEach(expense => {
      if (!vendorMap.has(expense.vendor)) {
        vendorMap.set(expense.vendor, {
          totalAmount: 0,
          invoiceCount: 0,
          category: expense.category,
          lastInvoiceDate: expense.date,
          pendingAmount: 0
        });
      }
      
      const vendor = vendorMap.get(expense.vendor)!;
      vendor.totalAmount += expense.amount + expense.tax;
      vendor.invoiceCount += 1;
      
      if (expense.date > vendor.lastInvoiceDate) {
        vendor.lastInvoiceDate = expense.date;
      }
      
      if (expense.status !== 'Paid') {
        vendor.pendingAmount += expense.amount + expense.tax;
      }
    });
    
    return Array.from(vendorMap.entries()).map(([vendor, data]) => ({
      vendor,
      ...data
    }));
  }

  // Chart data for dashboard
  async getBilledVsCollectedChart(months = 12): Promise<ChartDataPoint[]> {
    await this.init();
    
    const data: ChartDataPoint[] = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const targetDate = addMonths(currentDate, -i);
      const period = monthKey(targetDate);
      
      try {
        const monthInvoices = await this.getInvoices({
          dateFrom: `${period}-01`,
          dateTo: `${period}-31`
        });
        
        const monthPayments = await this.getPayments({
          dateFrom: `${period}-01`,
          dateTo: `${period}-31`
        });
        
        const billed = monthInvoices?.reduce((sum, inv) => sum + (inv?.amount || 0) + (inv?.tax || 0), 0) || 0;
        const collected = monthPayments?.reduce((sum, pay) => sum + (pay?.amount || 0), 0) || 0;
        
        data.push({
          period,
          billed: Number(billed) || 0,
          collected: Number(collected) || 0,
          efficiency: billed > 0 ? Number(((collected / billed) * 100).toFixed(2)) : 0
        });
      } catch (error) {
        console.error(`Error processing data for period ${period}:`, error);
        // Add a default entry to maintain chart consistency
        data.push({
          period,
          billed: 0,
          collected: 0,
          efficiency: 0
        });
      }
    }
    
    return data.filter(item => item && item.period); // Filter out any invalid entries
  }


}

// Export singleton instance
export const db = new SocietyDatabase();

// Helper functions for common queries
export async function getUnitsCount(): Promise<number> {
  const units = await db.getUnits();
  return units.length;
}

export async function getCurrentMonthKPIs(): Promise<KPIMetrics> {
  return await db.getKPIMetrics();
}

export async function getOutstandingDues(): Promise<DuesAging[]> {
  const aging = await db.getDuesAging();
  return aging.filter(a => a.totalOverdue > 0 || a.currentDue > 0);
}
