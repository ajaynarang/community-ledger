import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatting utilities
export const inr = (n: number) => 
  new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(n);

export const inrWithDecimals = (n: number) => 
  new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 2 
  }).format(n);

export const formatNumber = (n: number) => 
  new Intl.NumberFormat('en-IN').format(n);

export const formatPercent = (n: number) => 
  new Intl.NumberFormat('en-IN', { 
    style: 'percent', 
    maximumFractionDigits: 1 
  }).format(n / 100);

export const monthKey = (d: Date) => 
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const formatDate = (dateStr: string) => 
  new Date(dateStr).toLocaleDateString('en-IN');

export const formatDateTime = (dateStr: string) => 
  new Date(dateStr).toLocaleString('en-IN');

export const getMonthName = (monthKey: string) => {
  const [year, month] = monthKey.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

export const getAgingBucket = (daysOverdue: number): string => {
  if (daysOverdue <= 0) return 'Current';
  if (daysOverdue <= 30) return '0-30 days';
  if (daysOverdue <= 60) return '31-60 days';
  if (daysOverdue <= 90) return '61-90 days';
  return '90+ days';
};
