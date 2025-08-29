# 🏡 Community Ledger - Society Dashboard

A modern, mobile-first dashboard for community leaders to manage society finances and operations. Built with Next.js 14, TailwindCSS, and Recharts.

## ✨ Features

- **📱 Mobile-First Design** - Optimized for mobile devices with responsive layout
- **💰 Financial Overview** - Income, expenses, and surplus tracking
- **📊 Interactive Charts** - Pie charts for income sources, bar charts for expenses
- **📈 Progress Tracking** - Dues collection progress with visual indicators
- **🏦 Funds Management** - Bank balance, sinking fund, and emergency fund tracking
- **📢 Notices System** - Priority-based notices and highlights
- **🎨 Clean UI** - Simple, intuitive interface for non-technical users

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Language**: TypeScript
- **Design**: Mobile-first, responsive design

## 📱 Mobile-First Features

- Responsive grid layouts that stack on mobile
- Touch-friendly interface elements
- Optimized chart sizes for mobile screens
- Readable typography at all screen sizes
- Efficient use of mobile screen real estate

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd community-ledger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
community-ledger/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── SummaryCard.tsx      # Summary statistics cards
│   │   ├── IncomeChart.tsx      # Income sources pie chart
│   │   ├── ExpensesChart.tsx    # Expenses breakdown bar chart
│   │   ├── DuesProgress.tsx     # Dues collection progress
│   │   ├── FundsSnapshot.tsx    # Funds overview cards
│   │   └── NoticesList.tsx      # Notices and highlights
│   ├── globals.css         # Global styles and TailwindCSS
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main dashboard page
├── data.ts                 # Dummy data and TypeScript interfaces
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # TailwindCSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## 🎯 Dashboard Sections

### 1. Summary Cards
- Total Income Collected: ₹8,40,000
- Total Expenses: ₹7,25,000
- Net Surplus: ₹1,15,000 (color-coded)

### 2. Income Sources (Pie Chart)
- Maintenance (85%)
- Rentals (7%)
- Parking (5%)
- Others (3%)

### 3. Expenses Breakdown (Bar Chart)
- Security & Housekeeping
- Electricity & Water
- Repairs & Maintenance
- Salaries
- Miscellaneous

### 4. Dues & Collections
- Collection progress bar
- Collected vs. pending amounts
- Number of flats with pending dues

### 5. Funds Snapshot
- Bank Balance
- Sinking Fund
- Emergency Fund

### 6. Notices & Highlights
- Priority-based notices
- Icons and descriptions
- Color-coded priority levels

## 🎨 Design Principles

- **Mobile-First**: Designed for mobile devices first, then enhanced for larger screens
- **Simple & Clean**: Easy to understand for non-technical users
- **Color Coding**: Green for positive/surplus, red for negative/deficit
- **Large Typography**: Readable text at all screen sizes
- **Touch-Friendly**: Optimized for mobile touch interactions

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (default, single column)
- **Small**: 640px+ (3-column summary cards)
- **Large**: 1024px+ (side-by-side charts, 3-column bottom section)

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Customization

### Adding New Data
Edit `data.ts` to add new data sources or modify existing ones.

### Styling Changes
Modify `tailwind.config.js` for theme customization or `app/globals.css` for custom styles.

### Component Modifications
Each component is self-contained and can be easily modified in the `app/components/` directory.

## 📊 Data Structure

The dashboard uses TypeScript interfaces for type safety. All data is currently dummy data stored in `data.ts` but can be easily connected to real APIs or databases.

## 🌟 Future Enhancements

- Real-time data updates
- User authentication
- Role-based access control
- Export functionality (PDF/Excel)
- Push notifications
- Offline support
- Dark mode toggle

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for community leaders**
