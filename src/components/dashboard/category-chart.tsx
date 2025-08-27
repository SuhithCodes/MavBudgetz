"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { type Expense } from "@/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, getMonth, getYear } from 'date-fns';

interface CategoryChartProps {
  expenses: Expense[];
}

const chartColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

export function CategoryChart({ expenses }: CategoryChartProps) {
  const [selectedMonth, setSelectedMonth] = React.useState<string>("all");

  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(expense => {
      const month = format(new Date(expense.date), 'yyyy-MM');
      months.add(month);
    });
    return Array.from(months);
  }, [expenses]);

  const { data, config } = React.useMemo(() => {
    if (!expenses || expenses.length === 0) return { data: [], config: {} };
    
    const filteredExpenses = selectedMonth === "all"
      ? expenses
      : expenses.filter(expense => format(new Date(expense.date), 'yyyy-MM') === selectedMonth);

    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      const category = expense.category || "Uncategorized";
      const amount = expense.totalAmount || 0;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += amount;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        name: category,
        value: total,
      }))
      .sort((a, b) => b.value - a.value);

    const chartConfig = chartData.reduce((acc, item, index) => {
      acc[item.name] = {
        label: item.name,
        color: chartColors[index % chartColors.length],
      };
      return acc;
    }, {} as ChartConfig);

    return { data: chartData, config: chartConfig };
  }, [expenses, selectedMonth]);

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>No expense data available.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Upload a receipt to see your spending breakdown.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>A breakdown of your expenses.</CardDescription>
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
        <div className="flex items-center justify-center h-[350px] w-full">
          <ChartContainer config={config} className="w-full max-w-[360px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      const value = typeof data.value === 'number' ? data.value : 0;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center">
                              <div
                                className="mr-2 h-2 w-2 rounded"
                                style={{
                                  background: data.payload.fill,
                                }}
                              />
                              <span className="font-medium">{data.name}</span>
                            </div>
                            <div className="text-right font-medium">
                              {formatCurrency(value)}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
