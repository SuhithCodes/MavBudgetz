"use client"

import { useState, useEffect, useMemo } from "react"
import { ExpenseForm } from "@/components/expenses/expense-form"
import { ExpenseList } from "@/components/expenses/expense-list"
import { DashboardSummary } from "@/components/dashboard/dashboard-summary"
import { SankeyDiagram, type SankeyData } from "@/components/dashboard/sankey-diagram";
import { type Expense, type ExpenseFormData } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { PlusCircle, Banknote, Calendar as CalendarIcon } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, addDoc, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { deleteExpense, updateExpense } from "@/lib/actions/expenses"
import { IncomeForm } from "@/components/income/income-form"
import { type IncomeFormData, type Income } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { DateRange } from "react-day-picker"
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { ResponsiveSankey } from "@/components/dashboard/responsive-sankey"

export default function DashboardPage() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const { toast } = useToast();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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
    
    const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses]);

    const handleExpenseAdded = async (newExpenseData: ExpenseFormData) => {
        if (!user) return;
        
        try {
            const expenseWithUser = { ...newExpenseData, userId: user.uid };
            await addDoc(collection(db, "expenses"), expenseWithUser);
            setIsFormOpen(false);
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

    const setDatePreset = (preset: 'today' | 'thisWeek' | 'lastWeek' | 'last7Days' | 'thisMonth' | 'thisYear') => {
        const now = new Date();
        switch (preset) {
            case 'today':
                setDateRange({ from: now, to: now });
                break;
            case 'thisWeek':
                setDateRange({ from: startOfWeek(now), to: endOfWeek(now) });
                break;
            case 'lastWeek':
                const lastWeekStart = startOfWeek(subDays(now, 7));
                const lastWeekEnd = endOfWeek(subDays(now, 7));
                setDateRange({ from: lastWeekStart, to: lastWeekEnd });
                break;
            case 'last7Days':
                setDateRange({ from: subDays(now, 6), to: now });
                break;
            case 'thisMonth':
                setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
                break;
            case 'thisYear':
                setDateRange({ from: startOfYear(now), to: endOfYear(now) });
                break;
        }
    };

    const filteredExpenses = useMemo(() => {
        if (!dateRange?.from) return expenses;
        const fromDate = dateRange.from;
        const toDate = dateRange.to || dateRange.from; // If no 'to' date, use 'from' date for single day selection
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date + 'T00:00:00');
            return expenseDate >= fromDate && expenseDate <= toDate;
        });
    }, [expenses, dateRange]);

    const filteredIncomes = useMemo(() => {
        if (!dateRange?.from) return incomes;
        const fromDate = dateRange.from;
        const toDate = dateRange.to || dateRange.from;
        return incomes.filter(income => {
            const incomeDate = new Date(income.date + 'T00:00:00');
            return incomeDate >= fromDate && incomeDate <= toDate;
        });
    }, [incomes, dateRange]);

    const sankeyData = useMemo((): SankeyData => {
        const PARENT_CATEGORIES = {
            'Needs': ["Housing", "Transportation", "Food", "Utilities", "Healthcare"],
            'Wants': ["Personal Care", "Entertainment", "Shopping"],
            'Financial Goals': ["Debt Payments", "Savings & Investments"],
            'Other': ["Miscellaneous"]
        };

        const nodes: { nodeId: string; name: string }[] = [];
        const links: { source: string; target: string; value: number }[] = [];

        const totalIncome = filteredIncomes.reduce((acc, income) => acc + income.amount, 0);

        if (totalIncome > 0) {
            nodes.push({ nodeId: "total-income", name: "Total Income" });

            const incomeBySource: { [key: string]: number } = {};
            filteredIncomes.forEach(income => {
                const source = income.sourceName || 'Other Income';
                if (incomeBySource[source]) {
                    incomeBySource[source] += income.amount;
                } else {
                    incomeBySource[source] = income.amount;
                }
            });

            for (const source in incomeBySource) {
                nodes.push({ nodeId: source, name: source });
                links.push({ source: source, target: "total-income", value: incomeBySource[source] });
            }
        }

        const expenseByCategory: { [key: string]: number } = {};
        filteredExpenses.forEach(expense => {
            const amount = expense.totalAmount || 0;
            if (expenseByCategory[expense.category]) {
                expenseByCategory[expense.category] += amount;
            } else {
                expenseByCategory[expense.category] = amount;
            }
        });

        const parentCategoryTotals: { [key: string]: number } = {};
        for (const parent in PARENT_CATEGORIES) {
            parentCategoryTotals[parent] = 0;
            for (const child of PARENT_CATEGORIES[parent as keyof typeof PARENT_CATEGORIES]) {
                if (expenseByCategory[child]) {
                    parentCategoryTotals[parent] += expenseByCategory[child];
                }
            }
        }
        
        for (const parent in parentCategoryTotals) {
            if (parentCategoryTotals[parent] > 0) {
                nodes.push({ nodeId: parent, name: parent });
                links.push({ source: "total-income", target: parent, value: parentCategoryTotals[parent] });

                for (const child of PARENT_CATEGORIES[parent as keyof typeof PARENT_CATEGORIES]) {
                    if (expenseByCategory[child]) {
                        nodes.push({ nodeId: child, name: child });
                        links.push({ source: parent, target: child, value: expenseByCategory[child] });
                    }
                }
            }
        }
        
        const totalExpenses = Object.values(expenseByCategory).reduce((acc, amount) => acc + amount, 0);
        const savings = totalIncome - totalExpenses;
        
        if (savings > 0) {
            nodes.push({ nodeId: "Savings", name: "Savings" });
            links.push({ source: "total-income", target: "Savings", value: savings });
        }
        
        const uniqueNodes = Array.from(new Map(nodes.map(item => [item.nodeId, item])).values());

        return { nodes: uniqueNodes, links };
    }, [filteredIncomes, filteredExpenses]);

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
                    </div>
                </div>
             </main>
        )
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
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
                        <Card>
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <CardTitle>Financial Flow</CardTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="flex items-center gap-2">
                                                <span>Presets</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => setDatePreset('today')}>Today</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setDatePreset('thisWeek')}>This Week</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setDatePreset('lastWeek')}>Last Week</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setDatePreset('last7Days')}>Last 7 Days</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setDatePreset('thisMonth')}>This Month</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setDatePreset('thisYear')}>This Year</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[400px] w-full p-0">
                                {sankeyData.nodes.length > 1 && sankeyData.links.length > 0 ? (
                                    <ResponsiveSankey data={sankeyData} height={400} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <p className="text-center">No data for this period. <br /> Try adjusting the date filter.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2">
                        <ExpenseList 
                            expenses={recentExpenses}
                            onExpenseDeleted={handleExpenseDeleted}
                            onExpenseUpdated={handleExpenseUpdated}
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}
