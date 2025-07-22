"use client"

import { useState, useEffect, useMemo } from "react"
import { ExpenseForm } from "@/components/expenses/expense-form"
import { ExpenseList } from "@/components/expenses/expense-list"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { DashboardSummary } from "@/components/dashboard/dashboard-summary"
import { MonthlySpendChart } from "@/components/dashboard/monthly-spend-chart"
import { TopVendorsChart } from "@/components/dashboard/top-vendors-chart"
import { SpendingHeatmap } from "@/components/dashboard/spending-heatmap"
import { type Expense, type ExpenseFormData } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, addDoc, orderBy, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { deleteExpense, updateExpense } from "@/lib/actions/expenses"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            const q = query(
                collection(db, "expenses"), 
                where("userId", "==", user.uid), 
                orderBy("date", "desc"),
            );
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const expensesData: Expense[] = [];
                querySnapshot.forEach((doc) => {
                    expensesData.push({ id: doc.id, ...doc.data() } as Expense);
                });
                setExpenses(expensesData);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching expenses: ", error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        } else {
            setExpenses([]);
            setIsLoading(false);
        }
    }, [user]);
    
    const recentExpenses = useMemo(() => expenses.slice(0, 15), [expenses]);

    const handleExpenseAdded = async (newExpenseData: ExpenseFormData) => {
        if (!user) return;
        
        try {
            const expenseWithUser = { ...newExpenseData, userId: user.uid };
            await addDoc(collection(db, "expenses"), expenseWithUser);
            setIsFormOpen(false); // Close the dialog upon successful submission
        } catch (error) {
            console.error("Error adding expense: ", error);
        }
    };
    
    const handleExpenseDeleted = async (expenseId: string) => {
        try {
            await deleteExpense(expenseId);
            setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
            toast({ title: "Success", description: "Expense deleted." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete expense." });
        }
    };

    const handleExpenseUpdated = async (expenseId: string, data: ExpenseFormData) => {
        try {
            await updateExpense(expenseId, data);
            setExpenses((prev) => prev.map((e) => e.id === expenseId ? { ...e, ...data, id: expenseId } : e));
            toast({ title: "Success", description: "Expense updated." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not update expense." });
        }
    };

    if (isLoading) {
        return (
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
                 <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                <div className="grid gap-8 lg:grid-cols-5">
                    <Skeleton className="lg:col-span-3 h-[500px]" />
                    <div className="lg:col-span-2 grid gap-8 auto-rows-min">
                        <Skeleton className="h-80" />
                        <Skeleton className="h-80" />
                        <Skeleton className="h-80" />
                    </div>
                </div>
             </main>
        )
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="font-headline text-3xl font-semibold">Dashboard</h1>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[95vh] overflow-y-auto p-4 sm:p-6">
                        <DialogHeader className="mb-4">
                            <DialogTitle>Add New Expense</DialogTitle>
                            <DialogDescription>
                                Upload or scan a receipt to automatically extract expense details.
                            </DialogDescription>
                        </DialogHeader>
                        <ExpenseForm onSubmit={handleExpenseAdded} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid gap-8">
                <DashboardSummary expenses={expenses} />
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                     <div className="lg:col-span-3">
                        <ExpenseList 
                            expenses={recentExpenses}
                            onExpenseDeleted={handleExpenseDeleted}
                            onExpenseUpdated={handleExpenseUpdated}
                        />
                        <div className="mt-8">
                            <SpendingHeatmap expenses={expenses} />
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <CategoryChart expenses={expenses} />
                        <MonthlySpendChart expenses={expenses} />
                        <TopVendorsChart expenses={expenses} />
                    </div>
                </div>
            </div>
        </main>
    )
}
