# 🔍 ATS Financial Health Monitor - Project Specification

## 📋 Project Overview

**Project Name**: ATS Financial Health Monitor  
**Version**: 1.0.0  
**Framework**: Next.js 14 (App Router)  
**Design Philosophy**: Mobile-First, Community-Centric  
**Target Users**: Community Leaders, Society Management Committees  

## 🎯 Core Objectives

1. **Financial Transparency**: Provide complete visibility into society's financial health
2. **Mobile Accessibility**: Ensure seamless experience on mobile devices
3. **Data Visualization**: Present complex financial data in digestible formats
4. **Time-based Analysis**: Enable month-over-month financial tracking
5. **Non-Technical User Friendly**: Simple interface for community leaders

## 🏗️ System Architecture

### Technology Stack
```
Frontend Framework: Next.js 14 (App Router)
Styling Framework: TailwindCSS 3.3.0
Chart Library: Recharts 2.8.0
Language: TypeScript 5.x
Package Manager: npm
```

### Project Structure
```
community-ledger/
├── app/
│   ├── components/              # Reusable UI Components
│   │   ├── MonthSwitcher.tsx       # Month navigation component
│   │   ├── SummaryCard.tsx         # Financial summary cards
│   │   ├── IncomeChart.tsx         # Income sources pie chart
│   │   ├── ExpensesChart.tsx       # Expenses breakdown bar chart
│   │   ├── DuesProgress.tsx        # Collection progress tracking
│   │   ├── FundsSnapshot.tsx       # Fund management cards
│   │   └── NoticesList.tsx         # Priority-based notices
│   ├── globals.css             # Global styles & TailwindCSS
│   ├── layout.tsx              # Root layout component
│   └── page.tsx                # Main dashboard page
├── data.ts                    # Data models & dummy data
├── package.json               # Dependencies & scripts
├── tailwind.config.js         # TailwindCSS configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
├── postcss.config.js          # PostCSS configuration
└── README.md                  # Project documentation
```

## 📊 Data Models

### DashboardData Interface
```typescript
interface DashboardData {
  month: string;                    // Month name (e.g., "August")
  year: number;                     // Year (e.g., 2025)
  summary: {
    totalIncome: number;            // Total income collected
    totalExpenses: number;          // Total expenses incurred
    netSurplus: number;             // Net surplus/deficit
  };
  incomeSources: Array<{
    name: string;                   // Income source name
    amount: number;                 // Amount in rupees
    percentage: number;             // Percentage of total income
    color: string;                  // Chart color hex code
  }>;
  expenses: Array<{
    category: string;               // Expense category
    amount: number;                 // Amount in rupees
    color: string;                  // Chart color hex code
  }>;
  dues: {
    collected: number;              // Collected dues amount
    pending: number;                // Pending dues amount
    total: number;                  // Total dues amount
    pendingFlats: number;           // Number of flats with pending dues
  };
  funds: {
    bankBalance: number;            // Current bank balance
    sinkingFund: number;            // Sinking fund amount
    emergencyFund: number;          // Emergency fund amount
  };
  notices: Array<{
    id: number;                     // Unique notice ID
    title: string;                  // Notice title
    description: string;            // Notice description
    icon: string;                   // Emoji icon
    priority: 'high' | 'medium' | 'low'; // Priority level
  }>;
}
```

## 🎨 UI/UX Specifications

### Design System
- **Color Palette**:
  - Primary: Blue (#3b82f6)
  - Success: Green (#22c55e)
  - Danger: Red (#ef4444)
  - Warning: Yellow (#f59e0b)
  - Neutral: Gray scale

- **Typography**:
  - Mobile-first responsive text classes
  - `text-mobile-lg`: 18px/20px (mobile/desktop)
  - `text-mobile-xl`: 20px/24px (mobile/desktop)
  - `text-mobile-2xl`: 24px/30px (mobile/desktop)

- **Spacing**:
  - Mobile: 16px base spacing
  - Desktop: 24px base spacing
  - Responsive padding: `p-3` (mobile) → `p-6` (desktop)

### Component Specifications

#### 1. MonthSwitcher Component
**Purpose**: Navigate between different months
**Features**:
- Previous/Next month navigation
- Quick month selector dropdown
- Month indicator dots
- Current month/year display
- Month counter (e.g., "1 of 2 months")

**Mobile Optimizations**:
- Touch-friendly buttons
- Responsive text hiding ("Previous"/"Next" hidden on mobile)
- Dropdown for quick month selection

#### 2. SummaryCard Component
**Purpose**: Display key financial metrics
**Features**:
- Amount formatting (₹8.4L, ₹840K, ₹840)
- Color coding (green for positive, red for negative)
- Responsive typography
- Card-based layout

#### 3. IncomeChart Component
**Purpose**: Visualize income sources distribution
**Features**:
- Interactive pie chart
- Custom tooltips with amount formatting
- Legend with percentages
- Responsive container

#### 4. ExpensesChart Component
**Purpose**: Visualize expense breakdown
**Features**:
- Bar chart with category labels
- Mobile-optimized label truncation
- Custom tooltips
- Responsive grid layout

#### 5. DuesProgress Component
**Purpose**: Track dues collection progress
**Features**:
- Visual progress bar
- Collected vs. pending amounts
- Pending flats counter
- Color-coded statistics

#### 6. FundsSnapshot Component
**Purpose**: Display fund balances
**Features**:
- Three fund categories (Bank, Sinking, Emergency)
- Icon-based visual indicators
- Color-coded backgrounds
- Amount formatting

#### 7. NoticesList Component
**Purpose**: Display priority-based notices
**Features**:
- Priority color coding (red/yellow/green)
- Emoji icons
- Priority badges
- Responsive layout

## 📱 Responsive Design Specifications

### Breakpoint Strategy
```css
/* Mobile First Approach */
/* Base (Mobile): < 640px */
.grid-cols-1                    /* Single column layout */

/* Small: 640px+ */
.sm:grid-cols-3                /* 3-column summary cards */

/* Large: 1024px+ */
.lg:grid-cols-2                /* Side-by-side charts */
.lg:grid-cols-3                /* 3-column bottom section */
```

### Mobile Optimizations
1. **Touch Targets**: Minimum 44px touch targets
2. **Typography**: Readable at 16px base font size
3. **Charts**: Full-width responsive containers
4. **Navigation**: Thumb-friendly button placement
5. **Content**: Vertical stacking for better readability

## 🔄 State Management

### Current Implementation
- **Local State**: React useState for month switching
- **Data Flow**: Props-based component communication
- **State Persistence**: None (resets on page refresh)

### Future Considerations
- URL-based state management
- Local storage for user preferences
- Server-side state management
- Real-time data updates

## 📊 Data Specifications

### Current Data Sources
- **August 2025**: Initial dataset with baseline metrics
- **September 2025**: Comparative dataset showing improvements

### Data Validation Rules
- All amounts must be positive numbers
- Percentages must sum to 100%
- Dates must be valid month/year combinations
- Priority levels must be predefined values

### Data Formatting
```typescript
// Amount Formatting
const formatAmount = (amount: number) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};
```

## 🚀 Performance Specifications

### Loading Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Runtime Performance
- **Chart Rendering**: < 100ms
- **Month Switching**: < 50ms
- **Mobile Touch Response**: < 16ms

### Optimization Strategies
- Component lazy loading
- Chart virtualization for large datasets
- Image optimization
- CSS purging

## 🔒 Security Considerations

### Current Implementation
- Client-side only application
- No authentication required
- No sensitive data transmission

### Future Security Requirements
- User authentication
- Role-based access control
- Data encryption
- API security
- Input validation

## 🧪 Testing Specifications

### Unit Testing
- Component rendering tests
- Data formatting tests
- State management tests
- Responsive behavior tests

### Integration Testing
- Month switching functionality
- Chart interactions
- Mobile responsiveness
- Cross-browser compatibility

### User Acceptance Testing
- Non-technical user usability
- Mobile device testing
- Accessibility compliance
- Performance benchmarks

## 📈 Future Enhancement Roadmap

### Phase 1 (Current)
- ✅ Basic dashboard with month switching
- ✅ Mobile-first responsive design
- ✅ Chart visualizations
- ✅ Dummy data implementation

### Phase 2 (Planned)
- Real-time data integration
- User authentication
- Export functionality (PDF/Excel)
- Push notifications

### Phase 3 (Future)
- Advanced analytics
- Predictive insights
- Multi-society support
- API integration

## 🛠️ Development Guidelines

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component-based architecture

### Git Workflow
- Feature branch development
- Pull request reviews
- Semantic versioning
- Automated testing

### Deployment
- Vercel deployment
- Environment configuration
- Performance monitoring
- Error tracking

## 📋 Acceptance Criteria

### Functional Requirements
- [x] Month switching between August and September 2025
- [x] Financial summary cards with color coding
- [x] Interactive income and expense charts
- [x] Dues collection progress tracking
- [x] Funds snapshot display
- [x] Priority-based notices system
- [x] Mobile-responsive design

### Non-Functional Requirements
- [x] Mobile-first responsive layout
- [x] Touch-friendly interface
- [x] Fast loading times
- [x] Cross-browser compatibility
- [x] Accessibility compliance
- [x] Clean, maintainable code

## 📞 Support & Maintenance

### Documentation
- README.md for setup instructions
- Component documentation
- API documentation (future)
- User guides

### Maintenance Schedule
- Monthly dependency updates
- Quarterly security audits
- Annual feature reviews
- Continuous performance monitoring

---

**Document Version**: 1.0.0  
**Last Updated**: December 2024  
**Next Review**: January 2025
