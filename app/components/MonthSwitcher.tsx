'use client';

interface MonthSwitcherProps {
  currentMonth: string;
  currentYear: number;
  onMonthChange: (monthKey: string) => void;
  availableMonths: string[];
}

export default function MonthSwitcher({ 
  currentMonth, 
  currentYear, 
  onMonthChange, 
  availableMonths 
}: MonthSwitcherProps) {
  const getCurrentMonthIndex = () => {
    return availableMonths.findIndex(month => month === `${currentMonth.toLowerCase()}-${currentYear}`);
  };

  const goToPreviousMonth = () => {
    const currentIndex = getCurrentMonthIndex();
    if (currentIndex > 0) {
      onMonthChange(availableMonths[currentIndex - 1]);
    }
  };

  const goToNextMonth = () => {
    const currentIndex = getCurrentMonthIndex();
    if (currentIndex < availableMonths.length - 1) {
      onMonthChange(availableMonths[currentIndex + 1]);
    }
  };

  const currentIndex = getCurrentMonthIndex();
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < availableMonths.length - 1;

  const formatMonthKey = (monthKey: string) => {
    const [month, year] = monthKey.split('-');
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      {/* Title and Description Section */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-green-600 via-blue-600 to-teal-600 bg-clip-text mb-3">
          🔍 ATS Financial Health Monitor
        </h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          Complete transparency in your ATS financial well-being. Track income, expenses, and fund health across time periods to ensure accountability and make informed decisions for your society's future.
        </p>
        <div className="flex items-center justify-center space-x-2 mt-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-teal-100 text-green-800">
            🔍 Transparent
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
            💚 Health Check
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-teal-100 to-green-100 text-teal-800">
            📈 Track Progress
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        {/* Previous Month Button */}
        <button
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            canGoPrevious
              ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="text-lg">←</span>
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Current Month Display */}
        <div className="text-center">
          <h2 className="text-mobile-xl text-gray-900 font-bold">
            {currentMonth} {currentYear}
          </h2>
          <p className="text-sm text-gray-500">
            {currentIndex + 1} of {availableMonths.length} months
          </p>
        </div>

        {/* Next Month Button */}
        <button
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            canGoNext
              ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <span className="text-lg">→</span>
        </button>
      </div>

              {/* Quick Month Selector Dropdown */}
        <div className="flex justify-center mb-3">
          <select
            value={`${currentMonth.toLowerCase()}-${currentYear}`}
            onChange={(e) => onMonthChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          {availableMonths.map((monthKey) => (
            <option key={monthKey} value={monthKey}>
              {formatMonthKey(monthKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Month Indicator Dots */}
      <div className="flex justify-center space-x-2">
        {availableMonths.map((_, index) => (
          <button
            key={index}
            onClick={() => onMonthChange(availableMonths[index])}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex
                ? 'bg-blue-500'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to month ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
