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
        { title: 'how to train your dragon', url: 'http://example.com/dragon', timestamp: Date.now() - 100000 },
        { title: 'embarrassing moments compilation', url: 'http://example.com/embarrassing', timestamp: Date.now() - 50000 },
        { title: 'why is my cat staring at me', url: 'http://example.com/cat', timestamp: Date.now() - 10000 },
    ];
    console.log('Attempting to process search history with Gemini API...');
    try {
        const result = await geminiClient.processSearchHistory(dummyHistory);
        console.log('Gemini API Test Result:', result);
    }
    catch (error) {
        console.error('Error during Gemini API test:', error);
    }
}
runGeminiTest();
