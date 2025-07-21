"use client"

import { type Budget, type Expense } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { startOfMonth, startOfWeek, startOfYear, endOfMonth, endOfWeek, endOfYear, parseISO, isWithinInterval } from 'date-fns';

interface BudgetListProps {
    budgets: Budget[];
    expenses: Expense[];
    onBudgetDeleted: (budgetId: string) => void;
}

const getPeriodDateRange = (period: 'Weekly' | 'Monthly' | 'Yearly') => {
    const now = new Date();
    switch (period) {
        case 'Weekly':
            return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        case 'Monthly':
            return { start: startOfMonth(now), end: endOfMonth(now) };
        case 'Yearly':
            return { start: startOfYear(now), end: endOfYear(now) };
    }
};

export function BudgetList({ budgets, expenses, onBudgetDeleted }: BudgetListProps) {
    const calculatedBudgets = useMemo(() => {
        return budgets.map((budget) => {
            const range = getPeriodDateRange(budget.period);
            const spent = expenses
                .filter((expense) => {
                    const expenseDate = parseISO(expense.date);
                    return expense.category === budget.category && isWithinInterval(expenseDate, range);
                })
                .reduce((sum, expense) => sum + expense.totalAmount, 0);

            const remaining = budget.amount - spent;
            const progress = (spent / budget.amount) * 100;

            return { ...budget, spent, remaining, progress };
        });
    }, [budgets, expenses]);

    if (calculatedBudgets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                <h3 className="text-xl font-semibold tracking-tight">No budgets yet</h3>
                <p className="text-sm text-muted-foreground mt-2">Create a budget to start tracking your spending.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {calculatedBudgets.map((budget) => (
                <Card key={budget.id}>
                    <CardHeader>
                        <CardTitle>{budget.name}</CardTitle>
                        <CardDescription>{budget.category} - {budget.period}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Spent</span>
                            <span>${budget.spent.toFixed(2)}</span>
                        </div>
                        <Progress value={budget.progress} />
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining</span>
                            <span>${budget.remaining.toFixed(2)}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => onBudgetDeleted(budget.id)}>Delete</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
} 