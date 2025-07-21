'use server';

/**
 * @fileOverview A receipt data extraction AI agent.
 *
 * - extractReceiptData - A function that handles the receipt data extraction process.
 * - ExtractReceiptDataInput - The input type for the extractReceiptData function.
 * - ExtractReceiptDataOutput - The return type for the extractReceiptData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractReceiptDataInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractReceiptDataInput = z.infer<typeof ExtractReceiptDataInputSchema>;

const ExtractReceiptDataOutputSchema = z.object({
    isReceipt: z.boolean().describe('Set to true if the image is a receipt, false otherwise.'),
    vendorName: z.string().optional().describe('The name of the vendor or merchant.'),
    date: z.string().optional().describe('The date of the purchase (YYYY-MM-DD).'),
    time: z.string().optional().describe('The time of the purchase (HH:MM).'),
    totalAmount: z.number().optional().describe('The total amount of the purchase.'),
    taxes: z.number().optional().describe('The amount of taxes included in the purchase.'),
    paymentMethod: z.string().optional().describe('The method of payment used (e.g., cash, credit card).'),
    subtotal: z.number().optional().describe('The subtotal amount of the purchase'),
    currency: z.string().optional().describe('The three-letter ISO 4217 currency code of the purchase (e.g., USD, EUR).'),
    lineItems: z.array(z.string()).optional().describe('The individual products or services purchased.')
});
export type ExtractReceiptDataOutput = z.infer<typeof ExtractReceiptDataOutputSchema>;

export async function extractReceiptData(input: ExtractReceiptDataInput): Promise<ExtractReceiptDataOutput> {
  return extractReceiptDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractReceiptDataPrompt',
  input: {schema: ExtractReceiptDataInputSchema},
  output: {schema: ExtractReceiptDataOutputSchema},
  prompt: `You are an expert financial assistant specializing in extracting data from receipts.

Your first task is to determine if the provided image is a receipt.
- If the image IS a receipt, set 'isReceipt' to true and extract all the relevant information.
- If the image IS NOT a receipt, set 'isReceipt' to false and do not attempt to extract any other information; return null or empty values for the other fields.

Use the following as the primary source of information about the receipt.

Photo: {{media url=photoDataUri}}

When extracting data from a valid receipt, pay close attention to the format requirements for each field. For the currency, you MUST return a three-letter ISO 4217 currency code (e.g., USD, EUR, JPY). It is critical that you do not use currency symbols like $ or €. Only use the three-letter code.

Output the data in JSON format. Do not include any surrounding text.
`,
});

const extractReceiptDataFlow = ai.defineFlow(
  {
    name: 'extractReceiptDataFlow',
    inputSchema: ExtractReceiptDataInputSchema,
    outputSchema: ExtractReceiptDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
