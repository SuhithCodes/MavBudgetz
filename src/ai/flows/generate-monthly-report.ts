'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { type Expense } from '@/types';
import PDFDocument from 'pdfkit';

interface UserPreferences {
    monthlyReports: boolean;
    // other preferences...
}

// Define the input schema for the flow
const GenerateMonthlyReportInputSchema = z.object({
    year: z.number(),
    month: z.number(),
});

type GenerateMonthlyReportInput = z.infer<typeof GenerateMonthlyReportInputSchema>;

export async function generateMonthlyReport(input: GenerateMonthlyReportInput): Promise<string> {
    const { year, month } = GenerateMonthlyReportInputSchema.parse(input);
    
    console.log(`Generating report for ${year}-${month}`);

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const usersSnapshot = await getDocs(collection(db, 'userPreferences'));
    const usersToNotify = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() as UserPreferences }))
        .filter(pref => pref.monthlyReports);

    for (const user of usersToNotify) {
        const userExpenses: Expense[] = [];
        const q = query(
            collection(db, 'expenses'),
            where('userId', '==', user.id),
            where('date', '>=', startDate.toISOString().split('T')[0]),
            where('date', '<=', endDate.toISOString().split('T')[0])
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            userExpenses.push({ id: doc.id, ...doc.data() } as Expense);
        });

        if (userExpenses.length > 0) {
            const pdfBuffer = await generatePdf(userExpenses, year, month);
            console.log(`Generated PDF for user ${user.id} with ${userExpenses.length} expenses.`);
            // TODO: Email sending logic here
        }
    }

    return `Successfully processed reports for ${usersToNotify.length} users.`;
}

async function generatePdf(expenses: Expense[], year: number, month: number): Promise<Buffer> {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    
    // PDF content
    doc.fontSize(25).text(`Monthly Expense Report: ${year}-${month}`, { align: 'center' });
    doc.moveDown();
    
    const totalSpent = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
    doc.fontSize(18).text(`Total Spent: $${totalSpent.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(16).text('Expenses:', { underline: true });
    doc.moveDown(0.5);

    expenses.forEach(expense => {
        doc.fontSize(12).text(`${expense.date}: ${expense.vendorName} - $${expense.totalAmount.toFixed(2)} (${expense.category})`);
    });

    doc.end();

    return new Promise((resolve) => {
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
    });
}

// Function to run monthly report (can be triggered by a scheduler)
export async function runMonthlyReport(): Promise<string> {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;
    
    return generateMonthlyReport({ year, month });
}
