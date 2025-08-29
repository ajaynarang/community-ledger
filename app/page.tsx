import { dashboardData } from '../data';
import SummaryCard from './components/SummaryCard';
import IncomeChart from './components/IncomeChart';
import ExpensesChart from './components/ExpensesChart';
import DuesProgress from './components/DuesProgress';
import FundsSnapshot from './components/FundsSnapshot';
import NoticesList from './components/NoticesList';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-mobile-2xl text-gray-900 font-bold">
            🏡 Society Dashboard – August 2025
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Summary Cards - Mobile first: 1 column, then 3 columns on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SummaryCard 
            title="Total Income Collected" 
            amount={dashboardData.summary.totalIncome}
          />
          <SummaryCard 
            title="Total Expenses" 
            amount={dashboardData.summary.totalExpenses}
          />
          <SummaryCard 
            title="Net Surplus" 
            amount={dashboardData.summary.netSurplus}
            isPositive={dashboardData.summary.netSurplus >= 0}
          />
        </div>

        {/* Charts Section - Mobile first: stacked, then side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <IncomeChart data={dashboardData.incomeSources} />
          <ExpensesChart data={dashboardData.expenses} />
        </div>

        {/* Bottom Section - Mobile first: stacked, then side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DuesProgress data={dashboardData.dues} />
          <FundsSnapshot data={dashboardData.funds} />
          <NoticesList notices={dashboardData.notices} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Community Ledger Dashboard • Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </footer>
    </div>
  );
}
