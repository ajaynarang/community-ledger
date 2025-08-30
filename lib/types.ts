export type TowerId = '1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'11'|'12'|'14'|'P1'|'P2'|'P3';
export type UnitId = `${TowerId}-${number}`;

export interface Unit {
  id: UnitId;
  tower: TowerId;
  floor: number;
  areaSqft: number;
  occupancy: 'Owner' | 'Tenant';
  ownerName: string;
  tenantName?: string;
  mobile: string;
  email: string;
  autoDebit: boolean;
  moveInDate: string; // ISO
}

export interface Invoice {
  id: string;
  unitId: UnitId;
  date: string; // ISO
  dueDate: string; // ISO
  type: 'Maintenance' | 'SinkingFund' | 'Amenity' | 'Parking' | 'Penalty' | 'Interest' | 'Other';
  amount: number; // gross
  tax: number; // if any
  notes?: string;
  status: 'Generated' | 'Sent' | 'Overdue' | 'Paid' | 'PartiallyPaid';
}

export interface Payment {
  id: string;
  unitId: UnitId;
  date: string; // ISO
  amount: number;
  mode: 'UPI' | 'Transfer' | 'Cheque' | 'Cash' | 'AutoDebit';
  againstInvoiceId?: string;
  transactionRef?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string; // ISO
  vendor: string;
  category: 'Security'|'Housekeeping'|'Electricity'|'Water'|'Diesel'|'Repairs'|'AMC'|'Insurance'|'Salaries'|'Admin'|'Waste'|'Internet'|'Legal'|'Landscaping'|'Other';
  subCategory?: string;
  amount: number;
  tax: number;
  status: 'Unpaid'|'PartPaid'|'Paid';
  tower?: TowerId;
  invoiceNumber?: string;
  description?: string;
  paymentDate?: string; // ISO
}

export interface IncomeSourceSummary {
  id: string;
  category: 'Maintenance' | 'SinkingFund' | 'Clubhouse' | 'CommunityHall' | 'Parking' | 'MoveInOut' | 'Penalties' | 'Interest' | 'Advertisements' | 'Miscellaneous';
  subCategory?: string;
  period: string; // YYYY-MM
  amount: number;
  txns: number;
  avgTicket: number;
  paymentModeSplit: Record<string, number>;
  variance: number; // vs last month
}

export interface SinkingFundEntry {
  id: string;
  date: string; // ISO
  type: 'Contribution' | 'Withdrawal' | 'Interest';
  amount: number;
  description: string;
  unitId?: UnitId; // for contributions
  approvedBy?: string; // for withdrawals
  balance: number; // running balance
}

export interface DuesAging {
  unitId: UnitId;
  currentDue: number;
  totalOverdue: number;
  aging0to30: number;
  aging31to60: number;
  aging61to90: number;
  aging90plus: number;
  lastPaymentDate?: string; // ISO
  escalationStage: 'None' | 'Reminder1' | 'Reminder2' | 'Call' | 'Legal';
}

export interface KPIMetrics {
  totalFlats: number;
  occupiedFlats: number;
  ownerOccupied: number;
  tenantOccupied: number;
  billedThisMonth: number;
  collectedThisMonth: number;
  outstanding: number;
  collectionEfficiency: number; // percentage
  avgDaysToCollect: number;
  sinkingFundBalance: number;
  monthlyBurnRate: number;
  runwayMonths: number;
}

export interface ChartDataPoint {
  period: string;
  [key: string]: string | number;
}

export interface VendorSummary {
  vendor: string;
  totalAmount: number;
  invoiceCount: number;
  category: string;
  lastInvoiceDate: string;
  pendingAmount: number;
}

export interface UnitLedgerEntry {
  id: string;
  unitId: UnitId;
  date: string; // ISO
  type: 'Invoice' | 'Payment' | 'Adjustment' | 'Penalty' | 'Interest';
  description: string;
  debit: number;
  credit: number;
  balance: number; // running balance
  referenceId?: string; // invoice or payment ID
}

export interface CollectionLeaderboard {
  tower: TowerId;
  onTimePaymentRate: number;
  totalUnits: number;
  avgDaysToCollect: number;
  rank: number;
}

export interface BudgetVsActual {
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  period: string; // YYYY-MM
}
