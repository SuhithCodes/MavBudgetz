"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
import { BudgetList } from '@/components/budgets/budget-list';
import { BudgetForm } from '@/components/budgets/budget-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type Budget, type BudgetFormData } from '@/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { addBudget, getBudgets, deleteBudget } from '@/lib/actions/budgets';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Expense } from '@/types';

export default function BudgetsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const fetchBudgets = async () => {
            try {
                const userBudgets = await getBudgets(user.uid);
                setBudgets(userBudgets);
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not fetch budgets.',
                });
            }
        };

        const unsubscribeExpenses = onSnapshot(
            query(collection(db, 'expenses'), where('userId', '==', user.uid), orderBy('date', 'desc')),
            (snapshot) => {
                const expensesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Expense));
                setExpenses(expensesData);
            },
            (error) => {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not fetch expenses.',
                });
            }
        );

        Promise.all([fetchBudgets()]).finally(() => setIsLoading(false));

        return () => {
            unsubscribeExpenses();
        };
    }, [user, toast]);

    const handleBudgetAdded = async (newBudgetData: BudgetFormData) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to create a budget.',
            });
            return;
        }

        try {
            const newBudget = await addBudget(newBudgetData, user.uid);
            setBudgets((prevBudgets) => [...prevBudgets, newBudget]);
            setIsFormOpen(false);
            toast({
                title: 'Budget Created',
                description: `Your budget for "${newBudget.name}" has been created.`,
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not create budget.',
            });
        }
    };
    
    const handleBudgetDeleted = async (budgetId: string) => {
        try {
            await deleteBudget(budgetId);
            setBudgets((prevBudgets) => prevBudgets.filter((b) => b.id !== budgetId));
            toast({
                title: 'Budget Deleted',
                description: 'Your budget has been deleted.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete budget.',
            });
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="font-headline text-3xl font-semibold">Budgets</h1>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Budget
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a New Budget</DialogTitle>
                        </DialogHeader>
                        <BudgetForm onBudgetAdded={handleBudgetAdded} />
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Budgets</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <BudgetList budgets={budgets} expenses={expenses} onBudgetDeleted={handleBudgetDeleted} />
                    )}
                </CardContent>
            </Card>
        </main>
    );
} 