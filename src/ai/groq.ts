import { Groq } from 'groq-sdk';

// Initialize the Groq client - it automatically reads GROQ_API_KEY from environment
export const groq = new Groq();

// Default model for text completions
export const TEXT_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// Vision model for image analysis (Llama 4 Scout supports multimodal)
export const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// Default completion settings
export const DEFAULT_SETTINGS = {
  temperature: 0.7,
  max_tokens: 2048,
  top_p: 1,
};

