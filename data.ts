export interface DashboardData {
  month: string;
  year: number;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSurplus: number;
  };
  incomeSources: {
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  expenses: {
    category: string;
    amount: number;
    color: string;
  }[];
  dues: {
    collected: number;
    pending: number;
    total: number;
    pendingFlats: number;
  };
  funds: {
    bankBalance: number;
    sinkingFund: number;
    emergencyFund: number;
  };
  notices: {
    id: number;
    title: string;
    description: string;
    icon: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export const dashboardData: { [key: string]: DashboardData } = {
  'august-2025': {
    month: 'August',
    year: 2025,
    summary: {
      totalIncome: 840000,
      totalExpenses: 725000,
      netSurplus: 115000
    },
    incomeSources: [
      { name: 'Maintenance', amount: 714000, percentage: 85, color: '#3b82f6' },
      { name: 'Rentals', amount: 58800, percentage: 7, color: '#10b981' },
      { name: 'Parking', amount: 42000, percentage: 5, color: '#f59e0b' },
      { name: 'Others', amount: 25200, percentage: 3, color: '#8b5cf6' }
    ],
    expenses: [
      { category: 'Security & Housekeeping', amount: 180000, color: '#ef4444' },
      { category: 'Electricity & Water', amount: 150000, color: '#f59e0b' },
      { category: 'Repairs & Maintenance', amount: 120000, color: '#8b5cf6' },
      { category: 'Salaries', amount: 200000, color: '#06b6d4' },
      { category: 'Miscellaneous', amount: 75000, color: '#84cc16' }
    ],
    dues: {
      collected: 756000,
      pending: 144000,
      total: 900000,
      pendingFlats: 40
    },
    funds: {
      bankBalance: 250000,
      sinkingFund: 500000,
      emergencyFund: 100000
    },
    notices: [
      {
        id: 1,
        title: 'Lift Overhaul Next Month',
        description: '₹2,50,000 budget allocated for lift maintenance',
        icon: '🚀',
        priority: 'high'
      },
      {
        id: 2,
        title: 'Solar Savings Achieved',
        description: 'Saved 10% electricity costs through solar installation',
        icon: '☀️',
        priority: 'medium'
      },
      {
        id: 3,
        title: 'Dues Payment Reminder',
        description: 'Please pay maintenance dues before 10th of month',
        icon: '💰',
        priority: 'high'
      },
      {
        id: 4,
        title: 'Garden Maintenance',
        description: 'New plants added to society garden area',
        icon: '🌱',
        priority: 'low'
      }
    ]
  },
  'september-2025': {
    month: 'September',
    year: 2025,
    summary: {
      totalIncome: 920000,
      totalExpenses: 780000,
      netSurplus: 140000
    },
    incomeSources: [
      { name: 'Maintenance', amount: 782000, percentage: 85, color: '#3b82f6' },
      { name: 'Rentals', amount: 64400, percentage: 7, color: '#10b981' },
      { name: 'Parking', amount: 46000, percentage: 5, color: '#f59e0b' },
      { name: 'Others', amount: 27600, percentage: 3, color: '#8b5cf6' }
    ],
    expenses: [
      { category: 'Security & Housekeeping', amount: 195000, color: '#ef4444' },
      { category: 'Electricity & Water', amount: 160000, color: '#f59e0b' },
      { category: 'Repairs & Maintenance', amount: 130000, color: '#8b5cf6' },
      { category: 'Salaries', amount: 210000, color: '#06b6d4' },
      { category: 'Miscellaneous', amount: 85000, color: '#84cc16' }
    ],
    dues: {
      collected: 828000,
      pending: 92000,
      total: 920000,
      pendingFlats: 25
    },
    funds: {
      bankBalance: 390000,
      sinkingFund: 640000,
      emergencyFund: 140000
    },
    notices: [
      {
        id: 1,
        title: 'Lift Overhaul Completed',
        description: 'Lift maintenance completed successfully within budget',
        icon: '✅',
        priority: 'medium'
      },
      {
        id: 2,
        title: 'Festival Preparations',
        description: 'Diwali decorations and lighting arrangements planned',
        icon: '🎆',
        priority: 'high'
      },
      {
        id: 3,
        title: 'New Security System',
        description: 'CCTV cameras upgraded for better security',
        icon: '📹',
        priority: 'high'
      },
      {
        id: 4,
        title: 'Water Conservation',
        description: 'Rainwater harvesting system installation started',
        icon: '💧',
        priority: 'medium'
      }
    ]
  }
};
