'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Wallet,
  FileText,
  Menu,
  Building2
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Executive overview and KPIs'
  },
  {
    name: 'Income',
    href: '/income',
    icon: TrendingUp,
    description: 'Revenue sources and collections'
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: TrendingDown,
    description: 'Vendor payments and categories'
  },
  {
    name: 'Dues',
    href: '/dues',
    icon: Users,
    description: 'Apartment-wise collections'
  },
  {
    name: 'Yearly Data',
    href: '/yearly-data',
    icon: FileText,
    description: 'Annual financial summary and trends'
  }
];

function NavigationItems({ mobile = false, onItemClick }: { mobile?: boolean; onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className={cn('space-y-1', mobile && 'px-4 py-6')}>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              mobile && 'text-base py-3'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 flex-shrink-0 h-5 w-5',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
              )}
            />
            <div className="flex flex-col">
              <span>{item.name}</span>
              {mobile && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function Navigation() {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r bg-card">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div className="ml-3">
                <h1 className="text-xl font-bold">SocietyScope</h1>
                <p className="text-xs text-muted-foreground">Finance & Operations</p>
              </div>
            </div>
            <div className="mt-8 flex-1 px-4">
              <NavigationItems />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-primary" />
            <div className="ml-2">
              <h1 className="text-lg font-bold">SocietyScope</h1>
            </div>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex items-center mb-6">
                <Building2 className="h-8 w-8 text-primary" />
                <div className="ml-3">
                  <h1 className="text-xl font-bold">SocietyScope</h1>
                  <p className="text-xs text-muted-foreground">Finance & Operations</p>
                </div>
              </div>
              <NavigationItems mobile />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
