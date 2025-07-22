"use client"

import { useState } from 'react';
import { type SavingsGoal, type SavingsGoalFormData } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import { format, parseISO, differenceInMonths, differenceInDays, addMonths, addDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface SavingsGoalListProps {
    goals: SavingsGoal[];
    onGoalDeleted: (goalId: string) => void;
    onGoalUpdated: (goalId: string, updatedData: Partial<SavingsGoalFormData>) => void;
}

export function SavingsGoalList({ goals, onGoalDeleted, onGoalUpdated }: SavingsGoalListProps) {
    const [isUpdateAmountOpen, setIsUpdateAmountOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
    const [amountToUpdate, setAmountToUpdate] = useState(0);

    const openUpdateModal = (goal: SavingsGoal) => {
        setSelectedGoal(goal);
        setIsUpdateAmountOpen(true);
        setAmountToUpdate(0);
    };

    const handleUpdateAmount = (operation: 'add' | 'subtract') => {
        if (!selectedGoal) return;
        
        const newCurrentAmount = operation === 'add'
            ? selectedGoal.currentAmount + amountToUpdate
            : selectedGoal.currentAmount - amountToUpdate;

        onGoalUpdated(selectedGoal.id, { currentAmount: Math.max(0, newCurrentAmount) });
        setIsUpdateAmountOpen(false);
    };

    if (goals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                <h3 className="text-xl font-semibold tracking-tight">No savings goals yet</h3>
                <p className="text-sm text-muted-foreground mt-2">Create a goal to start saving!</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;

                    // Forecasting logic
                    let forecastText = '';
                    let monthsElapsed = 0;
                    let daysElapsed = 0;
                    let avgMonthlySavings = 0;
                    let avgDailySavings = 0;
                    let projectedDate: Date | null = null;
                    // Use created date if available, else fallback to currentAmount > 0 as start
                    const startDate = goal.deadline ? parseISO(goal.deadline) : null;
                    const today = new Date();
                    // If the user has made progress, estimate based on time since first progress
                    if (goal.currentAmount > 0) {
                        // For simplicity, use days since the goal was created or since first progress
                        // If you have a createdAt field, use it. Otherwise, fallback to 1 month ago
                        // Here, we fallback to 1 month ago if no deadline
                        const effectiveStart = startDate || addMonths(today, -1);
                        daysElapsed = Math.max(differenceInDays(today, effectiveStart), 1);
                        avgDailySavings = goal.currentAmount / daysElapsed;
                        const remaining = goal.targetAmount - goal.currentAmount;
                        if (avgDailySavings > 0) {
                            const daysToGoal = Math.ceil(remaining / avgDailySavings);
                            projectedDate = addDays(today, daysToGoal);
                            forecastText = `Estimated completion: ${format(projectedDate, 'MMM yyyy')}`;
                        } else {
                            forecastText = 'No projection available';
                        }
                    } else {
                        forecastText = 'No projection available';
                    }

                    return (
                        <Card key={goal.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{goal.name}</CardTitle>
                                        {goal.deadline && (
                                            <CardDescription>
                                                Deadline: {format(parseISO(goal.deadline), 'MMM dd, yyyy')}
                                            </CardDescription>
                                        )}
                                        <CardDescription className="mt-1 text-green-800 font-medium">
                                            {forecastText}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openUpdateModal(goal)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Update Amount
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onGoalDeleted(goal.id)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>{`$${goal.currentAmount.toFixed(2)}`}</span>
                                    <span className="text-muted-foreground">{`of $${goal.targetAmount.toFixed(2)}`}</span>
                                </div>
                                <Progress value={progress} />
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isUpdateAmountOpen} onOpenChange={setIsUpdateAmountOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update progress for {selectedGoal?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p>Current Amount: ${selectedGoal?.currentAmount.toFixed(2)}</p>
                        <div className="space-y-1.5">
                             <Label htmlFor="update-amount">Amount to Add/Subtract</Label>
                             <Input 
                                id="update-amount"
                                type="number"
                                value={amountToUpdate}
                                onChange={(e) => setAmountToUpdate(parseFloat(e.target.value) || 0)}
                             />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => handleUpdateAmount('add')}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add
                            </Button>
                            <Button variant="outline" onClick={() => handleUpdateAmount('subtract')}>
                                <MinusCircle className="mr-2 h-4 w-4" /> Subtract
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
} 