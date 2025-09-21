import 'dotenv/config';
import { GeminiClient } from './GeminiClient.js';

async function runGeminiTest() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY environment variable is not set.');
    return;
  }

  const geminiClient = new GeminiClient(GEMINI_API_KEY);

  const dummyHistory = [
    { query: 'how to train your dragon', timestamp: Date.now() - 100000 },
    { query: 'embarrassing moments compilation', timestamp: Date.now() - 50000 },
    { query: 'why is my cat staring at me', timestamp: Date.now() - 10000 },
  ];

  console.log('Attempting to process search history with Gemini API...');
  try {
    const result = await geminiClient.processSearchHistory(dummyHistory);
    console.log('Gemini API Test Result:', result);
  } catch (error) {
    console.error('Error during Gemini API test:', error);
  }
}

runGeminiTest();
