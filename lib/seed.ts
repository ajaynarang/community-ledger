import { faker } from '@faker-js/faker';
import type { 
  Unit, 
  Invoice, 
  Payment, 
  Expense, 
  IncomeSourceSummary, 
  SinkingFundEntry,
  TowerId, 
  UnitId,
  DuesAging,
  UnitLedgerEntry,
  VendorSummary 
} from './types';
import { monthKey, addMonths, getDaysDifference } from './utils';

// Set seed for reproducible data
faker.seed(4242);

// Constants for data generation
const TOWERS: TowerId[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', 'P1', 'P2', 'P3'];
const FLOORS_PER_TOWER = 10;
const UNITS_PER_FLOOR = 10;
const BASE_MAINTENANCE = 7500;
const BASE_SINKING_FUND = 1000;

// Expense categories and vendors
const EXPENSE_CATEGORIES = {
  'Security': ['SecureGuard Services', 'Elite Security', 'Guardian Protection'],
  'Housekeeping': ['CleanPro Services', 'Sparkle Maintenance', 'Fresh Clean Co'],
  'Electricity': ['BESCOM', 'Electrical Solutions Ltd', 'Power Systems Inc'],
  'Water': ['BWSSB', 'AquaTech Services', 'Water Solutions'],
  'Diesel': ['Bharat Petroleum', 'Indian Oil', 'HP Petrol Pump'],
  'Repairs': ['FixIt Services', 'Maintenance Masters', 'Repair Pro'],
  'AMC': ['Elevator Tech', 'HVAC Solutions', 'Fire Safety Systems'],
  'Insurance': ['HDFC ERGO', 'ICICI Lombard', 'Bajaj Allianz'],
  'Salaries': ['Staff Payroll', 'Management Salaries', 'Contract Workers'],
  'Admin': ['Office Supplies', 'Legal Services', 'Audit Fees'],
  'Waste': ['Waste Management Co', 'Green Disposal', 'Eco Solutions'],
  'Internet': ['Airtel Business', 'Jio Fiber', 'ACT Broadband'],
  'Legal': ['Legal Associates', 'Property Lawyers', 'Compliance Consultants'],
  'Landscaping': ['Green Thumb Gardens', 'Landscape Solutions', 'Garden Care']
} as const;

const PAYMENT_MODES = ['UPI', 'Transfer', 'Cheque', 'Cash', 'AutoDebit'] as const;
const PAYMENT_MODE_WEIGHTS = [0.45, 0.30, 0.15, 0.05, 0.05]; // UPI dominant

// Generate units across all towers
export function generateUnits(): Unit[] {
  const units: Unit[] = [];
  
  TOWERS.forEach(tower => {
    const unitsInTower = tower.startsWith('P') ? 50 : 100; // Parking towers have fewer units
    
    for (let i = 1; i <= unitsInTower; i++) {
      const floor = Math.ceil(i / UNITS_PER_FLOOR);
      const unitNumber = i.toString().padStart(3, '0');
      const unitId = `${tower}-${unitNumber}` as UnitId;
      
      // Area varies by tower and floor (higher floors = larger units)
      const baseArea = tower.startsWith('P') ? 
        faker.number.int({ min: 800, max: 1200 }) : 
        faker.number.int({ min: 1000, max: 2500 });
      const floorMultiplier = 1 + (floor - 1) * 0.02; // 2% increase per floor
      const areaSqft = Math.round(baseArea * floorMultiplier);
      
      const occupancy = faker.helpers.weightedArrayElement([
        { weight: 0.7, value: 'Owner' as const },
        { weight: 0.3, value: 'Tenant' as const }
      ]);
      
      const ownerName = faker.person.fullName();
      const tenantName = occupancy === 'Tenant' ? faker.person.fullName() : undefined;
      
      units.push({
        id: unitId,
        tower,
        floor,
        areaSqft,
        occupancy,
        ownerName,
        tenantName,
        mobile: '9' + faker.string.numeric(9),
        email: faker.internet.email(),
        autoDebit: faker.datatype.boolean(0.25), // 25% have auto-debit
        moveInDate: faker.date.between({ 
          from: '2020-01-01', 
          to: '2024-01-01' 
        }).toISOString()
      });
    }
  });
  
  return units;
}

// Generate invoices for the last 24 months
export function generateInvoices(units: Unit[]): Invoice[] {
  const invoices: Invoice[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 24);
  
  for (let month = 0; month < 24; month++) {
    const invoiceDate = addMonths(startDate, month);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(10); // Due on 10th of each month
    
    units.forEach(unit => {
      // Monthly maintenance invoice
      const maintenanceVariance = faker.number.float({ min: -1500, max: 1500 });
      const areaMultiplier = unit.areaSqft / 1500; // Normalize to 1500 sqft
      const maintenanceAmount = Math.round((BASE_MAINTENANCE + maintenanceVariance) * areaMultiplier);
      
      invoices.push({
        id: `INV-${unit.id}-${monthKey(invoiceDate)}-MAINT`,
        unitId: unit.id,
        date: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
        type: 'Maintenance',
        amount: maintenanceAmount,
        tax: Math.round(maintenanceAmount * 0.18), // 18% GST
        status: 'Generated'
      });
      
      // Sinking fund invoice
      const sinkingVariance = faker.number.float({ min: -300, max: 300 });
      const sinkingAmount = Math.round((BASE_SINKING_FUND + sinkingVariance) * areaMultiplier);
      
      invoices.push({
        id: `INV-${unit.id}-${monthKey(invoiceDate)}-SINK`,
        unitId: unit.id,
        date: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
        type: 'SinkingFund',
        amount: sinkingAmount,
        tax: 0,
        status: 'Generated'
      });
      
      // Occasional other charges (10% chance each month)
      if (faker.datatype.boolean(0.1)) {
        const chargeTypes = ['Amenity', 'Parking', 'Other'] as const;
        const chargeType = faker.helpers.arrayElement(chargeTypes);
        const amount = faker.number.int({ min: 500, max: 5000 });
        
        invoices.push({
          id: `INV-${unit.id}-${monthKey(invoiceDate)}-${chargeType.toUpperCase()}`,
          unitId: unit.id,
          date: invoiceDate.toISOString(),
          dueDate: dueDate.toISOString(),
          type: chargeType,
          amount,
          tax: chargeType === 'Amenity' ? Math.round(amount * 0.18) : 0,
          status: 'Generated',
          notes: `${chargeType} charges for ${getMonthName(monthKey(invoiceDate))}`
        });
      }
    });
  }
  
  return invoices;
}

// Generate payments with realistic delays and penalties
export function generatePayments(invoices: Invoice[]): { payments: Payment[], penaltyInvoices: Invoice[] } {
  const payments: Payment[] = [];
  const penaltyInvoices: Invoice[] = [];
  
  invoices.forEach(invoice => {
    const paymentProbability = faker.helpers.weightedArrayElement([
      { weight: 0.75, value: 'onTime' },      // 75% pay on time
      { weight: 0.15, value: 'late1to30' },   // 15% pay 1-30 days late
      { weight: 0.07, value: 'late31to60' },  // 7% pay 31-60 days late
      { weight: 0.03, value: 'veryLate' }     // 3% pay 60+ days late or don't pay
    ]);
    
    if (paymentProbability === 'veryLate' && faker.datatype.boolean(0.5)) {
      // 50% of very late don't pay at all (for now)
      return;
    }
    
    let paymentDate = new Date(invoice.dueDate);
    let penaltyAmount = 0;
    
    switch (paymentProbability) {
      case 'onTime':
        // Pay between due date - 5 days to due date + 2 days
        paymentDate.setDate(paymentDate.getDate() + faker.number.int({ min: -5, max: 2 }));
        break;
        
      case 'late1to30':
        const daysLate1 = faker.number.int({ min: 1, max: 30 });
        paymentDate.setDate(paymentDate.getDate() + daysLate1);
        penaltyAmount = Math.min(invoice.amount * 0.02, 500); // 2% penalty, max ₹500
        break;
        
      case 'late31to60':
        const daysLate2 = faker.number.int({ min: 31, max: 60 });
        paymentDate.setDate(paymentDate.getDate() + daysLate2);
        penaltyAmount = Math.min(invoice.amount * 0.05, 1000); // 5% penalty, max ₹1000
        break;
        
      case 'veryLate':
        const daysLate3 = faker.number.int({ min: 61, max: 120 });
        paymentDate.setDate(paymentDate.getDate() + daysLate3);
        penaltyAmount = Math.min(invoice.amount * 0.1, 2000); // 10% penalty, max ₹2000
        break;
    }
    
    // Don't generate payments for future dates
    if (paymentDate > new Date()) {
      return;
    }
    
    // Generate penalty invoice if applicable
    if (penaltyAmount > 0) {
      penaltyInvoices.push({
        id: `PEN-${invoice.id}-${paymentDate.getTime()}`,
        unitId: invoice.unitId,
        date: paymentDate.toISOString(),
        dueDate: paymentDate.toISOString(),
        type: 'Penalty',
        amount: penaltyAmount,
        tax: 0,
        status: 'Generated',
        notes: `Late payment penalty for ${invoice.id}`
      });
    }
    
    // Generate payment
    const paymentMode = faker.helpers.weightedArrayElement(
      PAYMENT_MODES.map((mode, index) => ({ 
        weight: PAYMENT_MODE_WEIGHTS[index], 
        value: mode 
      }))
    );
    
    const totalAmount = invoice.amount + invoice.tax + penaltyAmount;
    
    payments.push({
      id: `PAY-${invoice.id}-${paymentDate.getTime()}`,
      unitId: invoice.unitId,
      date: paymentDate.toISOString(),
      amount: totalAmount,
      mode: paymentMode,
      againstInvoiceId: invoice.id,
      transactionRef: paymentMode === 'UPI' ? faker.string.alphanumeric(12) : 
                     paymentMode === 'Transfer' ? faker.string.numeric(16) :
                     paymentMode === 'Cheque' ? faker.string.numeric(6) : undefined
    });
  });
  
  return { payments, penaltyInvoices };
}

// Generate monthly expenses with seasonal variations
export function generateExpenses(): Expense[] {
  const expenses: Expense[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 24);
  
  for (let month = 0; month < 24; month++) {
    const expenseDate = addMonths(startDate, month);
    const monthNum = expenseDate.getMonth() + 1;
    
    // Generate expenses for each category
    Object.entries(EXPENSE_CATEGORIES).forEach(([category, vendors]) => {
      const numExpenses = faker.number.int({ min: 1, max: 3 });
      
      for (let i = 0; i < numExpenses; i++) {
        const vendor = faker.helpers.arrayElement(vendors);
        let baseAmount: number;
        
        // Category-specific base amounts with seasonal variations
        switch (category) {
          case 'Security':
            baseAmount = faker.number.int({ min: 80000, max: 120000 });
            break;
          case 'Housekeeping':
            baseAmount = faker.number.int({ min: 40000, max: 60000 });
            break;
          case 'Electricity':
            // Higher in summer months (Apr-Jun) and winter (Dec-Feb)
            const electricityMultiplier = [4, 5, 6].includes(monthNum) || [12, 1, 2].includes(monthNum) ? 1.4 : 1.0;
            baseAmount = faker.number.int({ min: 150000, max: 250000 }) * electricityMultiplier;
            break;
          case 'Water':
            baseAmount = faker.number.int({ min: 25000, max: 40000 });
            break;
          case 'Diesel':
            // Spike during power outages (random)
            const dieselMultiplier = faker.datatype.boolean(0.2) ? 2.5 : 1.0;
            baseAmount = faker.number.int({ min: 15000, max: 30000 }) * dieselMultiplier;
            break;
          case 'Salaries':
            baseAmount = faker.number.int({ min: 200000, max: 300000 });
            break;
          default:
            baseAmount = faker.number.int({ min: 5000, max: 50000 });
        }
        
        const amount = Math.round(baseAmount);
        const tax = category === 'Salaries' ? 0 : Math.round(amount * 0.18);
        
        expenses.push({
          id: `EXP-${category}-${vendor.replace(/\s+/g, '')}-${monthKey(expenseDate)}-${i}`,
          date: faker.date.between({ 
            from: new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1),
            to: new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 0)
          }).toISOString(),
          vendor,
          category: category as any,
          amount,
          tax,
          status: faker.helpers.weightedArrayElement([
            { weight: 0.8, value: 'Paid' as const },
            { weight: 0.15, value: 'PartPaid' as const },
            { weight: 0.05, value: 'Unpaid' as const }
          ]),
          invoiceNumber: `${vendor.substring(0, 3).toUpperCase()}${faker.string.numeric(6)}`,
          description: `${category} services for ${getMonthName(monthKey(expenseDate))}`,
          tower: faker.helpers.maybe(() => faker.helpers.arrayElement(TOWERS), { probability: 0.3 })
        });
      }
    });
  }
  
  return expenses;
}

// Generate sinking fund entries
export function generateSinkingFundEntries(units: Unit[]): SinkingFundEntry[] {
  const entries: SinkingFundEntry[] = [];
  let runningBalance = 5000000; // Starting balance of ₹50 lakhs
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 24);
  
  // Add opening balance entry
  entries.push({
    id: 'SF-OPENING-BALANCE',
    date: startDate.toISOString(),
    type: 'Contribution',
    amount: runningBalance,
    description: 'Opening balance as of ' + startDate.toDateString(),
    balance: runningBalance
  });
  
  for (let month = 0; month < 24; month++) {
    const entryDate = addMonths(startDate, month);
    
    // Monthly contributions from all units
    const monthlyContributions = units.reduce((total, unit) => {
      const areaMultiplier = unit.areaSqft / 1500;
      const variance = faker.number.float({ min: -300, max: 300 });
      return total + Math.round((BASE_SINKING_FUND + variance) * areaMultiplier);
    }, 0);
    
    runningBalance += monthlyContributions;
    
    entries.push({
      id: `SF-CONTRIB-${monthKey(entryDate)}`,
      date: entryDate.toISOString(),
      type: 'Contribution',
      amount: monthlyContributions,
      description: `Monthly sinking fund contributions for ${getMonthName(monthKey(entryDate))}`,
      balance: runningBalance
    });
    
    // Occasional withdrawals for major expenses (20% chance per month)
    if (faker.datatype.boolean(0.2)) {
      const withdrawalAmount = faker.number.int({ min: 50000, max: 500000 });
      const purposes = [
        'Elevator maintenance',
        'Building repairs',
        'Common area renovation',
        'Security system upgrade',
        'Generator overhaul',
        'Plumbing infrastructure',
        'Electrical panel upgrade'
      ];
      
      runningBalance -= withdrawalAmount;
      
      entries.push({
        id: `SF-WITHDRAW-${monthKey(entryDate)}-${faker.string.numeric(4)}`,
        date: faker.date.between({
          from: new Date(entryDate.getFullYear(), entryDate.getMonth(), 1),
          to: new Date(entryDate.getFullYear(), entryDate.getMonth() + 1, 0)
        }).toISOString(),
        type: 'Withdrawal',
        amount: withdrawalAmount,
        description: faker.helpers.arrayElement(purposes),
        approvedBy: 'Society Committee',
        balance: runningBalance
      });
    }
    
    // Monthly interest (0.5% per month on average balance)
    if (month > 0 && month % 3 === 0) { // Quarterly interest
      const interestAmount = Math.round(runningBalance * 0.015); // 1.5% quarterly
      runningBalance += interestAmount;
      
      entries.push({
        id: `SF-INTEREST-${monthKey(entryDate)}`,
        date: new Date(entryDate.getFullYear(), entryDate.getMonth(), 28).toISOString(),
        type: 'Interest',
        amount: interestAmount,
        description: `Quarterly interest earned`,
        balance: runningBalance
      });
    }
  }
  
  return entries;
}

function getMonthName(monthKey: string) {
  const [year, month] = monthKey.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });
}
