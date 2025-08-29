interface SummaryCardProps {
  title: string;
  amount: number;
  isPositive?: boolean;
  className?: string;
}

export default function SummaryCard({ title, amount, isPositive, className = '' }: SummaryCardProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const getAmountColor = () => {
    if (isPositive === undefined) return 'text-gray-900';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={`card-mobile ${className}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className={`text-mobile-xl ${getAmountColor()}`}>
        {formatAmount(amount)}
      </p>
    </div>
  );
}
