"use client"

import { useState } from "react";
import { Pencil, Trash2, FileDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { type Income, type IncomeFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { IncomeForm } from "./income-form";

interface IncomeListProps {
  incomes: Income[];
  showTitle?: boolean;
  showExport?: boolean;
  onIncomeDeleted?: (incomeId: string) => Promise<void>;
  onIncomeUpdated?: (incomeId: string, data: IncomeFormData) => Promise<void>;
}

export function IncomeList({ incomes, showTitle = true, showExport = true, onIncomeDeleted, onIncomeUpdated }: IncomeListProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  const openDeleteDialog = (income: Income) => {
    setSelectedIncome(income);
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (income: Income) => {
    setSelectedIncome(income);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (selectedIncome && onIncomeDeleted) {
      await onIncomeDeleted(selectedIncome.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUpdate = async (data: IncomeFormData) => {
    if (selectedIncome && onIncomeUpdated) {
      await onIncomeUpdated(selectedIncome.id, data);
      setIsEditDialogOpen(false);
    }
  };

  const exportCSV = () => {
    if (incomes.length === 0) {
      toast({ title: "No Data", description: "There are no incomes to export.", variant: "destructive" });
      return;
    }
    const headers = ["id", "sourceName", "date", "amount", "currency", "note"];
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      let str = String(value);
      if (str.search(/("|,|\n)/g) >= 0) {
        str = `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const csvRows = [headers.join(',')];
    for (const inc of incomes) {
      const values = headers.map((h) => escapeCSV((inc as any)[h]));
      csvRows.push(values.join(','));
    }
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'incomes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Export Successful", description: "Your incomes have been downloaded as CSV." });
  };

  return (
    <Card>
      {showTitle && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Incomes</CardTitle>
            <CardDescription>Your recorded income entries.</CardDescription>
          </div>
          {showExport && (
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <FileDown className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Export</span>
            </Button>
          )}
        </CardHeader>
      )}
      <CardContent>
        {incomes.length > 0 ? (
          <div className="divide-y rounded-md border">
            {incomes.map((income) => (
              <div key={income.id} className="flex items-center justify-between px-4 py-3">
                <div className="space-y-0.5">
                  <div className="font-semibold">{income.sourceName}</div>
                  <div className="text-xs text-muted-foreground">{new Date(income.date + 'T00:00:00').toLocaleDateString('en-US')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-mono font-semibold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: income.currency || 'USD' }).format(income.amount)}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(income)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(income)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
            <p className="text-muted-foreground">No incomes recorded yet.</p>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the income from {selectedIncome?.sourceName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Income Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
          </DialogHeader>
          {selectedIncome && (
            <IncomeForm onSubmit={handleUpdate} initialData={selectedIncome} />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

