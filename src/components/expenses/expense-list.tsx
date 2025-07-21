"use client"

import { useState } from "react"
import { FileDown, Pencil, Trash2 } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { type Expense, type ExpenseFormData } from "@/types"
import { CategoryIcon } from "@/components/expenses/category-icon"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExpenseForm } from "./expense-form"

interface ExpenseListProps {
  expenses: Expense[];
  showTitle?: boolean;
  showExport?: boolean;
  onExpenseDeleted?: (expenseId: string) => Promise<void>;
  onExpenseUpdated?: (expenseId: string, data: ExpenseFormData) => Promise<void>;
}

export function ExpenseList({ expenses, showTitle = true, showExport = true, onExpenseDeleted, onExpenseUpdated }: ExpenseListProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const openDeleteDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };
  
  const openEditDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (selectedExpense && onExpenseDeleted) {
      await onExpenseDeleted(selectedExpense.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUpdate = async (data: ExpenseFormData) => {
    if (selectedExpense && onExpenseUpdated) {
        await onExpenseUpdated(selectedExpense.id, data);
        setIsEditDialogOpen(false);
    }
  };

  const getSafeCurrencyCode = (code?: string): string => {
    const defaultCurrency = "USD";
    if (!code) {
      return defaultCurrency;
    }
    try {
      new Intl.NumberFormat("en-US", { style: "currency", currency: code });
      return code;
    } catch (e) {
      if (code === "$") return "USD";
      if (code === "€") return "EUR";
      if (code === "£") return "GBP";
      return defaultCurrency;
    }
  };

  const handleExport = () => {
    if (expenses.length === 0) {
      toast({
        title: "No Data",
        description: "There are no expenses to export.",
        variant: "destructive"
      });
      return;
    }

    const headers = [
      "id", "vendorName", "date", "time", "totalAmount", "currency", 
      "category", "subtotal", "taxes", "paymentMethod", "lineItems", "confidence"
    ];

    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      let str = String(value);
      if (Array.isArray(value)) {
        str = value.join('; ');
      }
      if (str.search(/("|,|\n)/g) >= 0) {
        str = `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [headers.join(',')];

    for (const expense of expenses) {
      const values = headers.map(header => {
        const key = header as keyof Expense;
        return escapeCSV(expense[key]);
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'expenses.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Your expenses have been downloaded as a CSV file.",
    })
  };


  return (
    <>
        <Card>
            {showTitle && (
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Expenses</CardTitle>
                        <CardDescription>A list of your most recent transactions.</CardDescription>
                    </div>
                    {showExport && (
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <FileDown className="h-4 w-4" />
                            <span className="ml-2 hidden sm:inline">Export</span>
                        </Button>
                    )}
                </CardHeader>
            )}
            <CardContent className={!showTitle ? 'pt-6' : ''}>
                {expenses.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-3">
                    {expenses.map((expense) => (
                    <AccordionItem value={expense.id} key={expense.id} className="border-b-0">
                        <div className="rounded-md border px-4 transition-all hover:bg-muted/50">
                        <AccordionTrigger className="py-0 hover:no-underline">
                            <div className="flex items-center gap-4 py-4 w-full">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <CategoryIcon category={expense.category} className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="grid gap-1 text-left">
                                    <div className="font-semibold">{expense.vendorName}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(expense.date + 'T00:00:00').toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="font-bold">
                                        {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: getSafeCurrencyCode(expense.currency),
                                        }).format(expense.totalAmount)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{expense.category}</div>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-14 pr-4">
                            <p className="text-sm text-muted-foreground">
                                Paid with {expense.paymentMethod} at {expense.time}.
                            </p>
                            {expense.lineItems && expense.lineItems.length > 0 && (
                                <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    {expense.lineItems.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            )}
                            {(typeof expense.subtotal === 'number' || typeof expense.taxes === 'number') && (
                                <div className="pt-3 mt-3 border-t">
                                    <div className="space-y-1.5 text-sm">
                                        {typeof expense.subtotal === 'number' && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span className="font-mono">
                                                    {new Intl.NumberFormat("en-US", {
                                                        style: "currency",
                                                        currency: getSafeCurrencyCode(expense.currency),
                                                    }).format(expense.subtotal)}
                                                </span>
                                            </div>
                                        )}
                                        {typeof expense.taxes === 'number' && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Taxes</span>
                                                <span className="font-mono">
                                                    {new Intl.NumberFormat("en-US", {
                                                        style: "currency",
                                                        currency: getSafeCurrencyCode(expense.currency),
                                                    }).format(expense.taxes)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center font-bold pt-1.5 mt-1.5 border-t">
                                            <span>Total</span>
                                            <span className="font-mono">
                                                {new Intl.NumberFormat("en-US", {
                                                    style: "currency",
                                                    currency: getSafeCurrencyCode(expense.currency),
                                                }).format(expense.totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                <Button variant="outline" size="sm" onClick={() => openEditDialog(expense)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(expense)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </AccordionContent>
                        </div>
                    </AccordionItem>
                    ))}
                </Accordion>
                ) : (
                <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                    <p className="text-muted-foreground">No expenses recorded yet.</p>
                </div>
                )}
            </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the expense for {selectedExpense?.vendorName}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Edit Expense Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Expense</DialogTitle>
                </DialogHeader>
                {selectedExpense && (
                    <ExpenseForm 
                        onSubmit={handleUpdate} 
                        initialData={selectedExpense} 
                    />
                )}
            </DialogContent>
        </Dialog>
    </>
  )
}
