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
import { PlusCircle, Banknote } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, addDoc, orderBy, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { deleteExpense, updateExpense } from "@/lib/actions/expenses"
import { IncomeForm } from "@/components/income/income-form"
import { type IncomeFormData, type Income } from "@/types"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            const qExpenses = query(
                collection(db, "expenses"), 
                where("userId", "==", user.uid), 
                orderBy("date", "desc"),
            );
            const qIncomes = query(
                collection(db, "incomes"),
                where("userId", "==", user.uid),
                orderBy("date", "desc"),
            );
            const unsubExpenses = onSnapshot(qExpenses, (querySnapshot) => {
                const expensesData: Expense[] = [];
                querySnapshot.forEach((doc) => {
                    expensesData.push({ id: doc.id, ...doc.data() } as Expense);
                });
                setExpenses(expensesData);
                setIsLoading(false);
            }, () => setIsLoading(false));
            const unsubIncomes = onSnapshot(qIncomes, (querySnapshot) => {
                const incomesData: Income[] = [];
                querySnapshot.forEach((doc) => {
                    incomesData.push({ id: doc.id, ...doc.data() } as Income);
                });
                setIncomes(incomesData);
                setIsLoading(false);
            }, () => setIsLoading(false));

            return () => {
                unsubExpenses();
                unsubIncomes();
            }
        } else {
            setExpenses([]);
            setIncomes([]);
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
    
    const handleIncomeAdded = async (newIncomeData: IncomeFormData) => {
        if (!user) return;
        try {
            const incomeWithUser = { ...newIncomeData, userId: user.uid };
            await addDoc(collection(db, "incomes"), incomeWithUser);
            setIsIncomeFormOpen(false);
        } catch (error) {
            console.error("Error adding income: ", error);
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
                <div className="flex items-center gap-2">
                    <Dialog open={isIncomeFormOpen} onOpenChange={setIsIncomeFormOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Banknote className="mr-2 h-4 w-4" />
                                Add Income
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[95vh] overflow-y-auto p-4 sm:p-6">
                            <DialogHeader className="mb-4">
                                <DialogTitle>Add New Income</DialogTitle>
                                <DialogDescription>
                                    Record money you received.
                                </DialogDescription>
                            </DialogHeader>
                            <IncomeForm onSubmit={handleIncomeAdded} />
                        </DialogContent>
                    </Dialog>
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
            </div>
            <div className="grid gap-8">
                <DashboardSummary expenses={expenses} incomes={incomes} />
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
