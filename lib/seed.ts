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
import { monthKey, addMonths, getDaysDifference, getMonthName } from './utils';

// Set seed for reproducible data - This ensures consistent data generation
faker.seed(4242);

// Constants for data generation - Updated with realistic values
const TOWERS: TowerId[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', 'P1', 'P2', 'P3'];
const FLOORS_PER_TOWER = 10;
const UNITS_PER_FLOOR = 10;
const BASE_MAINTENANCE = 7500; // Updated to ₹7500 as per user assumption
const BASE_SINKING_FUND = 1000; // Updated to ₹1000 as per user assumption
export const TOTAL_FLATS = 1450; // Total flats as per user assumption

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

// Generate units across all towers - Updated to match 1450 total flats
export function generateUnits(): Unit[] {
  const units: Unit[] = [];
  
  // Calculate exact units per tower to reach exactly 1450 total
  const regularTowers = TOWERS.filter(t => !t.startsWith('P'));
  const parkingTowers = TOWERS.filter(t => t.startsWith('P'));
  
  // Distribute units: regular towers get more units, parking towers get fewer
  const unitsPerRegularTower = Math.ceil((TOTAL_FLATS * 0.85) / regularTowers.length);
  const unitsPerParkingTower = Math.ceil((TOTAL_FLATS * 0.15) / parkingTowers.length);
  
  TOWERS.forEach(tower => {
    const unitsInTower = tower.startsWith('P') ? unitsPerParkingTower : unitsPerRegularTower;
    
    for (let i = 1; i <= unitsInTower && units.length < TOTAL_FLATS; i++) {
      const floor = Math.ceil(i / UNITS_PER_FLOOR);
      const unitNumber = i.toString().padStart(3, '0');
      const unitId = `${tower}-${unitNumber}` as UnitId;
      
      // Area varies by tower and floor (higher floors = larger units)
      const baseArea = tower.startsWith('P') ? 
        faker.number.int({ min: 800, max: 1200 }) : 
        faker.number.int({ min: 1000, max: 2500 });
      const floorMultiplier = 1 + (floor - 1) * 0.02; // 2% increase per floor
      const areaSqft = Math.round(baseArea * floorMultiplier);
      
      // Updated occupancy to match 30% renters assumption
      const occupancy = faker.helpers.weightedArrayElement([
        { weight: 0.7, value: 'Owner' as const }, // 70% owners
        { weight: 0.3, value: 'Tenant' as const }  // 30% renters
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
  
  // Ensure exactly 1450 units
  if (units.length > TOTAL_FLATS) {
    units.splice(TOTAL_FLATS);
  }
  
  return units;
}

// Generate invoices for the last 3 months
export function generateInvoices(units: Unit[]): Invoice[] {
  const invoices: Invoice[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 2); // Start from 2 months ago to include current month
  
  let totalMaintenance = 0;
  let totalSinkingFund = 0;
  
  for (let month = 0; month < 3; month++) {
    const invoiceDate = addMonths(startDate, month);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(10); // Due on 10th of each month
    
    units.forEach(unit => {
      // Monthly maintenance invoice - Ensure ₹7500 average
      const maintenanceVariance = faker.number.int({ min: -1000, max: 1000 });
      // Simple approach: base amount + variance to ensure average is ₹7500
      const maintenanceAmount = BASE_MAINTENANCE + maintenanceVariance;
      totalMaintenance += maintenanceAmount;
      
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
      
      // Sinking fund invoice - Ensure ₹1000 average
      const sinkingVariance = faker.number.int({ min: -200, max: 200 });
      const sinkingAmount = BASE_SINKING_FUND + sinkingVariance;
      totalSinkingFund += sinkingAmount;
      
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

// Generate payments with realistic delays and penalties - Simplified and reliable
export function generatePayments(invoices: Invoice[]): { payments: Payment[], penaltyInvoices: Invoice[] } {
  const payments: Payment[] = [];
  const penaltyInvoices: Invoice[] = [];
  
  // Group invoices by month
  const invoicesByMonth = new Map<string, Invoice[]>();
  invoices.forEach(invoice => {
    const monthKey = invoice.date.substring(0, 7); // YYYY-MM
    if (!invoicesByMonth.has(monthKey)) {
      invoicesByMonth.set(monthKey, []);
    }
    invoicesByMonth.get(monthKey)!.push(invoice);
  });
  
  invoicesByMonth.forEach((monthInvoices, monthKey) => {
    // Determine collection rate based on specific month
    let collectionRate: number;
    
    // Extract month from monthKey (format: YYYY-MM)
    const month = monthKey.split('-')[1];
    const year = monthKey.split('-')[0];
    
    // Set specific collection rates for each month
    if (month === '07') { // July
      collectionRate = 0.70; // Deficit month - 70% collection
    } else if (month === '08') { // August
      collectionRate = 0.95; // Surplus month - 95% collection
    } else if (month === '06') { // June
      collectionRate = 0.92; // Surplus month - 92% collection
    } else {
      collectionRate = 0.85; // Default for other months
    }
    
    // Calculate how many invoices should be paid
    const totalInvoices = monthInvoices.length;
    const invoicesToPay = Math.floor(totalInvoices * collectionRate);
    
    // Shuffle invoices and take the first N for payment
    const shuffledInvoices = [...monthInvoices].sort(() => Math.random() - 0.5);
    const invoicesToProcess = shuffledInvoices.slice(0, invoicesToPay);
    
    invoicesToProcess.forEach(invoice => {
      const totalInvoiceAmount = invoice.amount + invoice.tax;
      
      // Determine payment timing: 80% on time, 10% 60 days late, 10% 90 days late
      const paymentTiming = faker.helpers.weightedArrayElement([
        { weight: 0.80, value: 'onTime' },
        { weight: 0.10, value: 'sixtyDays' },
        { weight: 0.10, value: 'ninetyDays' }
      ]);
      
      let paymentDate = new Date(invoice.dueDate);
      let penaltyAmount = 0;
      
      switch (paymentTiming) {
        case 'onTime':
          // Pay between due date - 10 days to due date + 5 days
          paymentDate.setDate(paymentDate.getDate() + faker.number.int({ min: -10, max: 5 }));
          break;
          
        case 'sixtyDays':
          // Pay 60 days late (55-65 days range)
          const daysLate60 = faker.number.int({ min: 55, max: 65 });
          paymentDate.setDate(paymentDate.getDate() + daysLate60);
          penaltyAmount = Math.min(invoice.amount * 0.05, 1000); // 5% penalty, max ₹1000
          break;
          
        case 'ninetyDays':
          // Pay 90 days late (85-95 days range)
          const daysLate90 = faker.number.int({ min: 85, max: 95 });
          paymentDate.setDate(paymentDate.getDate() + daysLate90);
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
      
      const totalAmount = totalInvoiceAmount + penaltyAmount;
      
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
  });
  
  return { payments, penaltyInvoices };
}

// Generate monthly expenses with seasonal variations - Updated for realistic totals
export function generateExpenses(): Expense[] {
  const expenses: Expense[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 2); // Start from 2 months ago
  
  // Calculate expected monthly income for reference
  const expectedMonthlyIncome = TOTAL_FLATS * BASE_MAINTENANCE; // ~₹1.09 crore
  const expectedExpenseRatio = 0.85; // Expenses should be 85% of income
  const baseMonthlyExpense = expectedMonthlyIncome * expectedExpenseRatio; // ~₹92.5 lakhs
  
  for (let month = 0; month < 3; month++) {
    const expenseDate = addMonths(startDate, month);
    const monthNum = expenseDate.getMonth() + 1;
    const monthKeyStr = monthKey(expenseDate);
    const monthStr = monthKeyStr.split('-')[1];
    
    // Calculate total monthly expenses with variation for specific months
    let monthlyExpenseBudget: number;
    
    if (monthStr === '07') { // July
      // Deficit month - higher expenses - 95% of income
      monthlyExpenseBudget = faker.number.int({ 
        min: Math.round(expectedMonthlyIncome * 0.92), 
        max: Math.round(expectedMonthlyIncome * 0.98) 
      }); // ₹1.00-1.07 crore
    } else if (monthStr === '08') { // August
      // Surplus month - lower expenses - 75% of income
      monthlyExpenseBudget = faker.number.int({ 
        min: Math.round(expectedMonthlyIncome * 0.72), 
        max: Math.round(expectedMonthlyIncome * 0.78) 
      }); // ₹78.5-85.0 lakhs
    } else if (monthStr === '06') { // June
      // Surplus month - lower expenses - 78% of income
      monthlyExpenseBudget = faker.number.int({ 
        min: Math.round(expectedMonthlyIncome * 0.75), 
        max: Math.round(expectedMonthlyIncome * 0.81) 
      }); // ₹81.8-88.3 lakhs
    } else {
      // Default for other months - 85% of income
      monthlyExpenseBudget = faker.number.int({ 
        min: Math.round(expectedMonthlyIncome * 0.82), 
        max: Math.round(expectedMonthlyIncome * 0.88) 
      });
    }
    
    // Generate expenses for each category with realistic proportions
    const categoryBudgets = {
      'Security': 0.15,      // 15% - ₹13.2-14.6 lakhs
      'Housekeeping': 0.08,  // 8% - ₹7.0-7.8 lakhs
      'Electricity': 0.25,   // 25% - ₹22.0-24.3 lakhs
      'Water': 0.05,         // 5% - ₹4.4-4.9 lakhs
      'Diesel': 0.03,        // 3% - ₹2.6-2.9 lakhs
      'Repairs': 0.12,       // 12% - ₹10.5-11.6 lakhs
      'AMC': 0.08,           // 8% - ₹7.0-7.8 lakhs
      'Insurance': 0.02,     // 2% - ₹1.8-2.0 lakhs
      'Salaries': 0.15,      // 15% - ₹13.2-14.6 lakhs
      'Admin': 0.03,         // 3% - ₹2.6-2.9 lakhs
      'Waste': 0.02,         // 2% - ₹1.8-2.0 lakhs
      'Internet': 0.01,      // 1% - ₹0.9-1.0 lakh
      'Legal': 0.01,         // 1% - ₹0.9-1.0 lakh
      'Landscaping': 0.02    // 2% - ₹1.8-2.0 lakhs
    };
    
    Object.entries(EXPENSE_CATEGORIES).forEach(([category, vendors]) => {
      const categoryBudget = monthlyExpenseBudget * categoryBudgets[category as keyof typeof categoryBudgets];
      const numExpenses = faker.number.int({ min: 1, max: 4 });
      
      for (let i = 0; i < numExpenses; i++) {
        const vendor = faker.helpers.arrayElement(vendors);
        let baseAmount: number;
        
        // Distribute category budget across multiple expenses
        const expenseShare = categoryBudget / numExpenses;
        const variance = faker.number.float({ min: 0.7, max: 1.3 });
        baseAmount = Math.round(expenseShare * variance);
        
        // Apply seasonal variations
        switch (category) {
          case 'Electricity':
            // Higher in summer months (Apr-Jun) and winter (Dec-Feb)
            const electricityMultiplier = [4, 5, 6].includes(monthNum) || [12, 1, 2].includes(monthNum) ? 1.4 : 1.0;
            baseAmount = Math.round(baseAmount * electricityMultiplier);
            break;
          case 'Diesel':
            // Spike during power outages (random)
            const dieselMultiplier = faker.datatype.boolean(0.2) ? 2.5 : 1.0;
            baseAmount = Math.round(baseAmount * dieselMultiplier);
            break;
          case 'Water':
            // Higher in summer months
            const waterMultiplier = [4, 5, 6].includes(monthNum) ? 1.3 : 1.0;
            baseAmount = Math.round(baseAmount * waterMultiplier);
            break;
        }
        
        const amount = Math.max(baseAmount, 1000); // Minimum ₹1000 per expense
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

// Generate sinking fund entries - Updated for realistic amounts
export function generateSinkingFundEntries(units: Unit[]): SinkingFundEntry[] {
  const entries: SinkingFundEntry[] = [];
  let runningBalance = 15000000; // Starting balance of ₹1.5 crore (realistic for 1450 flats)
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 2); // Start from 2 months ago
  
  // Add opening balance entry
  entries.push({
    id: 'SF-OPENING-BALANCE',
    date: startDate.toISOString(),
    type: 'Contribution',
    amount: runningBalance,
    description: 'Opening balance as of ' + startDate.toDateString(),
    balance: runningBalance
  });
  
  for (let month = 0; month < 3; month++) {
    const entryDate = addMonths(startDate, month);
    
    // Monthly contributions from all units - Updated for ₹1000 average
    const monthlyContributions = units.reduce((total, unit) => {
      const areaMultiplier = unit.areaSqft / 1500;
      const variance = faker.number.float({ min: -300, max: 300 });
      const contribution = Math.round((BASE_SINKING_FUND + variance) * areaMultiplier);
      return total + contribution;
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
    
    // Occasional withdrawals for major expenses (15% chance per month)
    if (faker.datatype.boolean(0.15)) {
      const withdrawalAmount = faker.number.int({ min: 100000, max: 1000000 });
      const purposes = [
        'Elevator maintenance and modernization',
        'Building facade repairs and painting',
        'Common area renovation and upgrades',
        'Security system upgrade and CCTV installation',
        'Generator overhaul and maintenance',
        'Plumbing infrastructure replacement',
        'Electrical panel upgrade and safety measures',
        'Parking area resurfacing',
        'Garden and landscaping improvements',
        'Fire safety system upgrades'
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
        description: `Quarterly interest earned on sinking fund balance`,
        balance: runningBalance
      });
    }
  }
  
  return entries;
}

// getMonthName function is imported from lib/utils.ts
