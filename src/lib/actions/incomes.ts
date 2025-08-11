'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
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

const incomesCollection = collection(db, 'incomes');

export async function getIncomes(userId: string): Promise<Income[]> {
  const q = query(incomesCollection, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const incomes: Income[] = [];
  querySnapshot.forEach((docSnap) => {
    incomes.push({ id: docSnap.id, ...docSnap.data() } as Income);
  });
  return incomes;
}

