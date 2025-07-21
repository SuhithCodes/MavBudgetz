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

interface TopVendorsChartProps {
  expenses: Expense[];
}

export function TopVendorsChart({ expenses }: TopVendorsChartProps) {
  const vendorData = React.useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    
    const vendorTotals = expenses.reduce((acc, expense) => {
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

  }, [expenses]);
    
  if (vendorData.length === 0) {
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
      <CardHeader>
        <CardTitle>Top Vendors</CardTitle>
        <CardDescription>Your top 5 vendors by spending.</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
