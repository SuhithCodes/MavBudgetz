"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2, Star } from 'lucide-react';
import { SavingsGoalList } from '@/components/savings-goals/savings-goal-list';
import { SavingsGoalForm } from '@/components/savings-goals/savings-goal-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type SavingsGoal, type SavingsGoalFormData } from '@/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { addSavingsGoal, getSavingsGoals, deleteSavingsGoal, updateSavingsGoal } from '@/lib/actions/savings-goals';

export default function SavingsGoalsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        async function fetchGoals() {
            if (user) {
                setIsLoading(true);
                try {
                    const userGoals = await getSavingsGoals(user.uid);
                    setGoals(userGoals);
                } catch (error) {
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Could not fetch savings goals.',
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        }
        fetchGoals();
    }, [user, toast]);

    const handleGoalAdded = async (newGoalData: SavingsGoalFormData) => {
        if (!user) return;
        try {
            const newGoal = await addSavingsGoal(newGoalData, user.uid);
            setGoals((prev) => [...prev, newGoal]);
            setIsFormOpen(false);
            toast({ title: 'Success', description: 'Savings goal created.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create goal.' });
        }
    };
    
    const handleGoalDeleted = async (goalId: string) => {
        try {
            await deleteSavingsGoal(goalId);
            setGoals((prev) => prev.filter((g) => g.id !== goalId));
            toast({ title: 'Success', description: 'Savings goal deleted.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete goal.' });
        }
    };

    const handleGoalUpdated = async (goalId: string, updatedData: Partial<SavingsGoalFormData>) => {
        try {
            await updateSavingsGoal(goalId, updatedData);
            setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, ...updatedData } : g));
            toast({ title: 'Success', description: 'Savings goal updated.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update goal.' });
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="font-headline text-3xl font-semibold">Savings Goals</h1>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a New Savings Goal</DialogTitle>
                        </DialogHeader>
                        <SavingsGoalForm onGoalAdded={handleGoalAdded} />
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        <span>Your Savings Goals</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <SavingsGoalList 
                            goals={goals} 
                            onGoalDeleted={handleGoalDeleted}
                            onGoalUpdated={handleGoalUpdated} 
                        />
                    )}
                </CardContent>
            </Card>
        </main>
    );
} 