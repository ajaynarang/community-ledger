interface DuesData {
  collected: number;
  pending: number;
  total: number;
  pendingFlats: number;
}

interface DuesProgressProps {
  data: DuesData;
}

export default function DuesProgress({ data }: DuesProgressProps) {
  const percentage = Math.round((data.collected / data.total) * 100);
  
  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  return (
    <div className="card-mobile">
      <h3 className="text-mobile-lg text-gray-800 mb-4">Dues & Collections</h3>
      
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Collection Progress</span>
            <span className="text-sm font-semibold text-gray-800">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{formatAmount(data.collected)}</p>
            <p className="text-xs text-green-700">Collected</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{formatAmount(data.pending)}</p>
            <p className="text-xs text-red-700">Pending</p>
          </div>
        </div>

        {/* Pending Flats */}
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-lg font-semibold text-yellow-700">{data.pendingFlats}</p>
          <p className="text-sm text-yellow-600">Flats Pending Dues</p>
        </div>
      </div>
    </div>
  );
}
