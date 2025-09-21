import { GoogleGenerativeAI } from '@google/generative-ai';

interface SearchHistoryEntry {
  query: string;
  timestamp: number;
}

interface GeminiProcessingResult {
  selectedSearchTerm: string;
  sentiment: string;
  keywords: string[];
  category: string;
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any; // GenerativeModel

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async processSearchHistory(history: SearchHistoryEntry[]): Promise<GeminiProcessingResult> {
    const prompt = `Analyze the following search history entries and identify the most embarrassing or funny search term. Also, provide a sentiment (positive, negative, neutral), keywords, and a category for the selected search term. Return the output as a JSON object with the following structure: { "selectedSearchTerm": "", "sentiment": "", "keywords": [], "category": "" }\n\nSearch History:\n${history.map(entry => `- ${entry.query}`).join('\n')}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Raw Gemini API response:', text); // Keep this for debugging

      // Remove markdown code block fences if present
      const jsonString = text.replace(/```json\n|```/g, '').trim();

      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error processing search history with Gemini API:', error);
      // Fallback or error handling
      return { selectedSearchTerm: 'Error processing history', sentiment: 'neutral', keywords: [], category: '' };
    }
  }
}