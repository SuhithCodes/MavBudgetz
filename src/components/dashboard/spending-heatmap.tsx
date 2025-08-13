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
  startDate?: Date;
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

export function SpendingHeatmap({ expenses, startDate: initialStartDate }: SpendingHeatmapProps) {
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

  const startDate = initialStartDate || subYears(new Date(), 1);

  const handleDayClick = (event: React.MouseEvent, data?: any) => {
    // Try to get the date from the event target or data
    const target = event.target as HTMLElement;
    const dateAttr = target.getAttribute('data-date') || target.getAttribute('data-value');
    
    if (dateAttr) {
      // Convert heatmap date (yyyy/MM/dd) to yyyy-MM-dd for comparison
      const [year, month, day] = dateAttr.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      console.log('Clicked date:', dateAttr);
      console.log('Looking for expenses on:', isoDate);
      console.log('Total expenses:', expenses.length);
      
      const expensesForDay = expenses.filter(exp => {
        // Normalize the expense date to ensure proper comparison
        const expenseDate = new Date(exp.date);
        const expenseDateStr = format(expenseDate, 'yyyy-MM-dd');
        const matches = expenseDateStr === isoDate;
        
        console.log(`Expense: ${exp.vendorName}, Date: ${exp.date}, Normalized: ${expenseDateStr}, Matches: ${matches}`);
        
        return matches;
      });
      
      console.log('Found expenses for day:', expensesForDay.length);
      setSelectedDay({ date: dateAttr, expenses: expensesForDay });
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
                        onClick={handleDayClick}
                    />
                </div>
            </CardContent>
        </Card>

        <Dialog open={selectedDay !== null} onOpenChange={(isOpen) => !isOpen && setSelectedDay(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {selectedDay?.date ? format(new Date(selectedDay.date.replace(/\//g, '-')), 'EEEE, MMMM d, yyyy') : ''}
                    </DialogTitle>
                    <DialogDescription className="text-lg font-semibold text-primary">
                        Total spent: {formatCurrency(selectedDay?.expenses.reduce((acc, exp) => acc + exp.totalAmount, 0) || 0)}
                    </DialogDescription>
                    <div className="text-sm text-muted-foreground">
                        Found {selectedDay?.expenses.length || 0} transactions for this day
                    </div>
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
                        <p className="text-center text-muted-foreground py-8">No expenses recorded for this day.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
} 