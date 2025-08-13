"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { type Expense } from "@/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns';

interface TopVendorsChartProps {
  expenses: Expense[];
}

export function TopVendorsChart({ expenses }: TopVendorsChartProps) {
  const [selectedMonth, setSelectedMonth] = React.useState<string>("all");

  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(expense => {
      const month = format(new Date(expense.date), 'yyyy-MM');
      months.add(month);
    });
    return Array.from(months);
  }, [expenses]);

  const vendorData = React.useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const filteredExpenses = selectedMonth === "all"
      ? expenses
      : expenses.filter(expense => format(new Date(expense.date), 'yyyy-MM') === selectedMonth);
    
    const vendorTotals = filteredExpenses.reduce((acc, expense) => {
      const vendor = expense.vendorName || "Unknown Vendor";
      const amount = expense.totalAmount || 0;
      if (!acc[vendor]) {
        acc[vendor] = 0;
      }
      acc[vendor] += amount;
      return acc;
    }, {} as Record<string, number>);

    const sortedVendors = Object.entries(vendorTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const maxTotal = sortedVendors.length > 0 ? sortedVendors[0].total : 0;

    return sortedVendors.map(vendor => ({
        ...vendor,
        progress: maxTotal > 0 ? (vendor.total / maxTotal) * 100 : 0
    }));

  }, [expenses, selectedMonth]);
    
  if (vendorData.length === 0 && selectedMonth === "all") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Vendors</CardTitle>
          <CardDescription>Your most frequented vendors.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Vendor data will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Top Vendors</CardTitle>
            <CardDescription>Your top 5 vendors by spending.</CardDescription>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                    {format(new Date(month + '-02'), 'MMMM yyyy')}
                </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {vendorData.length > 0 ? (
            <div className="space-y-4">
                {vendorData.map((vendor) => (
                    <div key={vendor.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{vendor.name}</span>
                            <span className="text-muted-foreground">
                                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(vendor.total)}
                            </span>
                        </div>
                        <Progress value={vendor.progress} className="h-2" />
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">No vendor data for this month.</p>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
