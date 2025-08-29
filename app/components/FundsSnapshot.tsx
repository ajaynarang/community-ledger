interface FundsData {
  bankBalance: number;
  sinkingFund: number;
  emergencyFund: number;
}

interface FundsSnapshotProps {
  data: FundsData;
}

export default function FundsSnapshot({ data }: FundsSnapshotProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const funds = [
    {
      name: 'Bank Balance',
      amount: data.bankBalance,
      color: 'bg-blue-50 text-blue-700',
      icon: '🏦'
    },
    {
      name: 'Sinking Fund',
      amount: data.sinkingFund,
      color: 'bg-purple-50 text-purple-700',
      icon: '🏗️'
    },
    {
      name: 'Emergency Fund',
      amount: data.emergencyFund,
      color: 'bg-orange-50 text-orange-700',
      icon: '🚨'
    }
  ];

  return (
    <div className="card-mobile">
      <h3 className="text-mobile-lg text-gray-800 mb-4">Funds Snapshot</h3>
      
      <div className="grid grid-cols-1 gap-3">
        {funds.map((fund, index) => (
          <div key={index} className={`p-3 rounded-lg ${fund.color}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{fund.icon}</span>
                <div>
                  <p className="text-sm font-medium">{fund.name}</p>
                  <p className="text-lg font-bold">{formatAmount(fund.amount)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
