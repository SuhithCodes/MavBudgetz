'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { type ExpenseFormData, type Expense } from '@/types';

// Update an existing expense
export async function updateExpense(expenseId: string, expenseData: Partial<ExpenseFormData>): Promise<void> {
    const expenseDoc = doc(db, 'expenses', expenseId);
    await updateDoc(expenseDoc, expenseData);
}

// Delete an expense
export async function deleteExpense(expenseId: string): Promise<void> {
    const expenseDoc = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseDoc);
}

const expensesCollection = collection(db, 'expenses');

export async function getExpenses(userId: string): Promise<Expense[]> {
    const q = query(expensesCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const expenses: Expense[] = [];
    querySnapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() } as Expense);
    });
    return expenses;
} 