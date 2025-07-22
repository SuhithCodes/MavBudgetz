"use client"

import * as React from 'react';
import HeatMap from '@uiw/react-heat-map';
import Tooltip from '@uiw/react-tooltip';
import { type Expense } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { subYears, format, parse } from 'date-fns';

interface SpendingHeatmapProps {
  expenses: Expense[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const panelColors = {
    0: '#f4decd',
    20: '#e4b293',
    50: '#d48462',
    100: '#c2533a',
    200: '#ad001d',
    500: '#6c0012',
};

export function SpendingHeatmap({ expenses }: SpendingHeatmapProps) {
  const [selectedDay, setSelectedDay] = React.useState<{ date: string; expenses: Expense[] } | null>(null);

  const heatmapData = React.useMemo(() => {
    if (!expenses) return [];
    const dailyTotals = new Map<string, number>();
    expenses.forEach(expense => {
      const dateStr = format(new Date(expense.date), 'yyyy/MM/dd');
      const amount = expense.totalAmount || 0;
      dailyTotals.set(dateStr, (dailyTotals.get(dateStr) || 0) + amount);
    });
    return Array.from(dailyTotals.entries()).map(([date, count]) => ({ date, count }));
  }, [expenses]);

  const startDate = subYears(new Date(), 1);

  const handleDayClick = (data: { date?: string }) => {
    if (data.date) {
      // Convert heatmap date (yyyy/MM/dd) to yyyy-MM-dd for comparison
      const [year, month, day] = data.date.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const expensesForDay = expenses.filter(exp => {
        // Compare only the date part (ignore time)
        return exp.date.startsWith(isoDate);
      });
      setSelectedDay({ date: data.date, expenses: expensesForDay });
    }
  };

  return (
    <>
        <Card>
            <CardHeader>
                <CardTitle>Spending Activity</CardTitle>
                <CardDescription>A heatmap of your spending over the last year. Click a cell for details.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <div className="min-w-[720px]">
                    <HeatMap
                        value={heatmapData}
                        startDate={startDate}
                        width="100%"
                        style={{ color: '#ad001d' }}
                        panelColors={panelColors}
                        rectRender={(props) => <rect {...props} />}
                    />
                </div>
            </CardContent>
        </Card>

        <Dialog open={selectedDay !== null} onOpenChange={(isOpen) => !isOpen && setSelectedDay(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Expenses for {selectedDay?.date}</DialogTitle>
                    <DialogDescription>
                        Total spent: {formatCurrency(selectedDay?.expenses.reduce((acc, exp) => acc + exp.totalAmount, 0) || 0)}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    {selectedDay?.expenses.length ? (
                        <ul className="space-y-4">
                            {selectedDay.expenses.map(expense => (
                                <li key={expense.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                                    <div className="font-medium">{expense.vendorName}</div>
                                    <div className="text-lg font-bold">{formatCurrency(expense.totalAmount)}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No expenses recorded for this day.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
} 