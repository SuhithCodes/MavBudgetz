"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PiggyBank, 
  Target, 
  Settings 
} from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      active: pathname === '/dashboard'
    },
    {
      href: '/dashboard/transactions',
      icon: ReceiptText,
      label: 'Transactions',
      active: pathname === '/dashboard/transactions'
    },
    {
      href: '/dashboard/budgets',
      icon: PiggyBank,
      label: 'Budgets',
      active: pathname === '/dashboard/budgets'
    },
    {
      href: '/dashboard/savings-goals',
      icon: Target,
      label: 'Savings',
      active: pathname === '/dashboard/savings-goals'
    },
    {
      href: '/dashboard/profile',
      icon: Settings,
      label: 'Settings',
      active: pathname === '/dashboard/profile'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background/80 backdrop-blur-sm border rounded-full px-2 py-2 shadow-lg">
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center transition-all duration-200",
                  item.active
                    ? "bg-primary text-primary-foreground shadow-md rounded-full px-3 py-2"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full w-10 h-10"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.active && (
                  <span className="text-xs font-medium ml-2 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 