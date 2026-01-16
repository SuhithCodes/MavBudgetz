// src/ai/flows/categorize-expenses.ts
'use server';

/**
 * @fileOverview This file defines a function for automatically categorizing expenses using Groq AI.
 *
 * - categorizeExpense - A function that categorizes an expense based on its description and other information.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import { groq, TEXT_MODEL, DEFAULT_SETTINGS } from '@/ai/groq';

export interface CategorizeExpenseInput {
  description: string;
  vendor: string;
  amount: number;
  date: string;
}

export interface CategorizeExpenseOutput {
  category: string;
  confidence: number;
}

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  const prompt = `You are an expert expense categorizer. Given the following information about an expense, determine the most appropriate category for it.

Description: ${input.description}
Vendor: ${input.vendor}
Amount: ${input.amount}
Date: ${input.date}

Respond with a category and a confidence level between 0 and 1. Make sure that the category is a short noun, like "Groceries" or "Transportation".

Return the category and confidence in JSON format. The category field should contain the category of the expense. The confidence field should be a number between 0 and 1 representing the confidence level. Only return a valid JSON object, no additional text.

For example:
{
  "category": "Groceries",
  "confidence": 0.95
}`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: TEXT_MODEL,
    temperature: DEFAULT_SETTINGS.temperature,
    max_tokens: DEFAULT_SETTINGS.max_tokens,
    top_p: DEFAULT_SETTINGS.top_p,
  });

  const responseText = chatCompletion.choices[0]?.message?.content || '';
  
  try {
    // Extract JSON from the response (handle potential markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    const result = JSON.parse(jsonMatch[0]) as CategorizeExpenseOutput;
    return {
      category: result.category || 'Uncategorized',
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.5,
    };
  } catch (error) {
    console.error('Failed to parse AI response:', responseText, error);
    return {
      category: 'Uncategorized',
      confidence: 0,
    };
  }
}
