'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { type ExpenseFormData } from '@/types';

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