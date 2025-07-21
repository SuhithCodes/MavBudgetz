// src/ai/flows/categorize-expenses.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically categorizing expenses.
 *
 * - categorizeExpense - A function that categorizes an expense based on its description and other information.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseInputSchema = z.object({
  description: z.string().describe('A detailed description of the expense.'),
  vendor: z.string().describe('The name of the vendor or merchant.'),
  amount: z.number().describe('The total amount of the expense.'),
  date: z.string().describe('The date of the expense in ISO format (YYYY-MM-DD).'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  category: z.string().describe('The predicted category of the expense.'),
  confidence: z.number().describe('The confidence level of the categorization (0-1).'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpensePrompt',
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `You are an expert expense categorizer. Given the following information about an expense, determine the most appropriate category for it.

Description: {{{description}}}
Vendor: {{{vendor}}}
Amount: {{{amount}}}
Date: {{{date}}}

Respond with a category and a confidence level between 0 and 1.  Make sure that the category is a short noun, like "Groceries" or "Transportation".

Return the category and confidence in JSON format. The category field should contain the category of the expense. The confidence field should be a number between 0 and 1 representing the confidence level. Only return a valid JSON object.

For example:
{
  "category": "Groceries",
  "confidence": 0.95
}`,
});

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
