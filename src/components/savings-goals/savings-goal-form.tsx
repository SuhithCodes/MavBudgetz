"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SavingsGoalFormData, savingsGoalFormSchema } from '@/types';
import { Loader2 } from 'lucide-react';

interface SavingsGoalFormProps {
    onGoalAdded: (goal: SavingsGoalFormData) => void;
}

export function SavingsGoalForm({ onGoalAdded }: SavingsGoalFormProps) {
    const form = useForm<SavingsGoalFormData>({
        resolver: zodResolver(savingsGoalFormSchema),
        defaultValues: {
            name: '',
            targetAmount: 0,
            currentAmount: 0,
            deadline: '',
        },
    });

    const onSubmit = (data: SavingsGoalFormData) => {
        onGoalAdded(data);
        form.reset();
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="name">Goal Name</Label>
                <Input id="name" {...form.register('name')} placeholder="e.g., New Laptop" />
                {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    <Input id="targetAmount" type="number" step="0.01" {...form.register('targetAmount', { valueAsNumber: true })} placeholder="1200.00" />
                     {form.formState.errors.targetAmount && (
                        <p className="text-sm text-destructive">{form.formState.errors.targetAmount.message}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="currentAmount">Current Amount</Label>
                    <Input id="currentAmount" type="number" step="0.01" {...form.register('currentAmount', { valueAsNumber: true })} placeholder="100.00" />
                    {form.formState.errors.currentAmount && (
                        <p className="text-sm text-destructive">{form.formState.errors.currentAmount.message}</p>
                    )}
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input id="deadline" type="date" {...form.register('deadline')} />
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Goal
            </Button>
        </form>
    );
} 