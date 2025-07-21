"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format, parseISO, subMonths, startOfMonth, getMonth, getYear } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { type Expense } from "@/types"

interface MonthlySpendChartProps {
  expenses: Expense[];
}

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig

export function MonthlySpendChart({ expenses }: MonthlySpendChartProps) {
  const chartData = React.useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    const monthlyTotals = expenses.reduce((acc, expense) => {
      const expenseDate = parseISO(expense.date);
      if (isNaN(expenseDate.getTime()) || expenseDate < sixMonthsAgo) {
        return acc;
      }
      
      const month = format(expenseDate, "yyyy-MM");
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += expense.totalAmount;
      return acc;
    }, {} as Record<string, number>);
    
    // Ensure all 6 months are present, even if with 0 total
    for (let i = 0; i < 6; i++) {
        const monthDate = subMonths(new Date(), i);
        const monthKey = format(monthDate, "yyyy-MM");
        if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = 0;
        }
    }

    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({
        month,
        total,
      }))
      .sort((a, b) => {
        const dateA = parseISO(a.month);
        const dateB = parseISO(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .map(({ month, total }) => ({
        month: format(parseISO(month), "MMM yy"),
        total,
      }));
  }, [expenses]);
    
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Over Time</CardTitle>
          <CardDescription>No expense data available for the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Expenses will appear here as you add them.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Over Time</CardTitle>
        <CardDescription>Your total spending for the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} margin={{ left: -20 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              stroke="var(--muted-foreground)"
            />
            <YAxis
                stroke="var(--muted-foreground)"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `$${value}`}
             />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                indicator="dot" 
                formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number)}
                />}
            />
            <Bar dataKey="total" fill="var(--color-chart-1)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
