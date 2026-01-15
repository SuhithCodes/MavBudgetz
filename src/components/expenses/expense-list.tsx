"use client"

import { useState } from "react"
import { MoreHorizontal, FileDown, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { type Expense, type ExpenseFormData } from "@/types"
import { CategoryIcon } from "@/components/expenses/category-icon"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExpenseForm } from "./expense-form"
import { Badge } from "@/components/ui/badge"

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseDeleted?: (expenseId: string) => Promise<void>;
  onExpenseUpdated?: (expenseId: string, data: ExpenseFormData) => Promise<void>;
}

export function ExpenseList({ expenses, onExpenseDeleted, onExpenseUpdated }: ExpenseListProps) {
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

  return (
    <>
        <Card>
            <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>A list of your most recent transactions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-12">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length > 0 ? (
                            expenses.map(expense => (
                                <TableRow key={expense.id}>
                                    <TableCell className="font-medium max-w-[150px] whitespace-normal break-words">{expense.vendorName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{expense.category}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{new Date(expense.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</TableCell>
                                    <TableCell className="text-right">{new Intl.NumberFormat("en-US", { style: "currency", currency: expense.currency || 'USD' }).format(expense.totalAmount)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={() => openEditDialog(expense)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => openDeleteDialog(expense)}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No expenses recorded yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
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
