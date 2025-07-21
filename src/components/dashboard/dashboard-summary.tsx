"use client"

import { DollarSign, ReceiptText, Tags } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Expense } from "@/types"
import Link from "next/link"

interface DashboardSummaryProps {
  expenses: Expense[];
}

export function DashboardSummary({ expenses }: DashboardSummaryProps) {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
  const totalExpenses = expenses.length;
  const uniqueCategories = new Set(expenses.map(e => e.category)).size;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount)}
          </div>
          <p className="text-xs text-muted-foreground">Across all expenses</p>
        </CardContent>
      </Card>
      <Link href="/dashboard/transactions">
        <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{totalExpenses}</div>
            <p className="text-xs text-muted-foreground">Receipts processed</p>
            </CardContent>
        </Card>
      </Link>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <Tags className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueCategories}</div>
          <p className="text-xs text-muted-foreground">Unique spending categories</p>
        </CardContent>
      </Card>
    </div>
  )
}
