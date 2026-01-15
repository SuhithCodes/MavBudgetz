'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { type IncomeFormData, type Income } from '@/types';

// Update an existing income
export async function updateIncome(incomeId: string, incomeData: Partial<IncomeFormData>): Promise<void> {
    const incomeDoc = doc(db, 'incomes', incomeId);
    await updateDoc(incomeDoc, incomeData);
}

// Delete an income
export async function deleteIncome(incomeId: string): Promise<void> {
    const incomeDoc = doc(db, 'incomes', incomeId);
    await deleteDoc(incomeDoc);
}

// Get all incomes for a user
export async function getIncomes(userId: string): Promise<Income[]> {
    const q = query(collection(db, 'incomes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const incomes: Income[] = [];
    querySnapshot.forEach((doc) => {
        incomes.push({ id: doc.id, ...doc.data() } as Income);
    });
    return incomes;
}


export async function deleteAllIncomes(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const q = query(collection(db, 'incomes'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return { success: true };
        }

        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error("Error deleting all incomes: ", error);
        return { success: false, error: "Could not delete all incomes." };
    }
}
