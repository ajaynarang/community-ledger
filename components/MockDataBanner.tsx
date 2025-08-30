'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';

export function MockDataBanner() {
  const [isVisible, setIsVisible] = useState(false); // Start hidden to avoid hydration issues

  useEffect(() => {
    setIsVisible(true); // Show after mount
  }, []);

  if (!isVisible) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50 text-blue-800 rounded-none">
      <div className="flex items-center justify-between">
        <AlertDescription className="text-sm text-center flex-1">
          Dashboard displays <strong>mock data</strong> for demonstration purposes. 
        </AlertDescription>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 p-1 hover:bg-blue-100 rounded-full transition-colors"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
}
