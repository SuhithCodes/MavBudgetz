import { config } from 'dotenv';
config();

// Import AI flows for use
import '@/ai/flows/categorize-expenses';
import '@/ai/flows/extract-receipt-data';

// Export the Groq client for external use
export { groq, TEXT_MODEL, VISION_MODEL, DEFAULT_SETTINGS } from '@/ai/groq';
