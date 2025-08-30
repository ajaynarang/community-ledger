'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface MonthSwitcherProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

export function MonthSwitcher({ currentMonth, onMonthChange }: MonthSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Generate last 3 months options
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-IN', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      options.push({ value: monthKey, label: monthName });
    }
    
    return options;
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    onMonthChange(month);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    params.set('month', month);
    router.push(`?${params.toString()}`);
  };

  const goToPreviousMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    currentDate.setMonth(currentDate.getMonth() - 1);
    
    const newMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Only allow navigation if the new month is in our available options
    const availableOptions = getMonthOptions();
    const isValidMonth = availableOptions.some(option => option.value === newMonthKey);
    
    if (isValidMonth) {
      handleMonthChange(newMonthKey);
    }
  };

  const goToNextMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    const newMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Only allow navigation if the new month is in our available options
    const availableOptions = getMonthOptions();
    const isValidMonth = availableOptions.some(option => option.value === newMonthKey);
    
    if (isValidMonth) {
      handleMonthChange(newMonthKey);
    }
  };

  const isCurrentMonth = () => {
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    return selectedMonth === currentMonthKey;
  };

  const isOldestMonth = () => {
    const availableOptions = getMonthOptions();
    return selectedMonth === availableOptions[availableOptions.length - 1].value;
  };

  return (
    <div className="flex items-center space-x-2 bg-card border rounded-lg p-2">
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousMonth}
        disabled={isOldestMonth()}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-48 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getMonthOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={goToNextMonth}
        disabled={isCurrentMonth()}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
