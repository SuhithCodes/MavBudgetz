import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-expenses.ts';
import '@/ai/flows/extract-receipt-data.ts';