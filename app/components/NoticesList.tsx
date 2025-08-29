interface Notice {
  id: number;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

interface NoticesListProps {
  notices: Notice[];
}

export default function NoticesList({ notices }: NoticesListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'Normal';
    }
  };

  return (
    <div className="card-mobile">
      <h3 className="text-mobile-lg text-gray-800 mb-4">Notices & Highlights</h3>
      
      <div className="space-y-3">
        {notices.map((notice) => (
          <div 
            key={notice.id} 
            className={`p-3 rounded-lg border-l-4 ${getPriorityColor(notice.priority)}`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">{notice.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-800 text-sm">{notice.title}</h4>
                  <span className="text-xs text-gray-500 px-2 py-1 bg-white rounded-full">
                    {getPriorityText(notice.priority)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{notice.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
