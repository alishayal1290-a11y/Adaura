import { GoogleGenAI } from "@google/genai";

// NOTE: In a real production app, never expose API keys on the client side.
// This should be proxied through a backend.
// Since this is a demo, we assume the key is in env.
const API_KEY = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

try {
  if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize Gemini", error);
}

export const GeminiService = {
  getFinancialAdvice: async (): Promise<string> => {
    if (!ai) return "Gemini API Key not configured.";
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Give me a very short, one sentence funny or wise tip about saving money or getting rich.",
      });
      return response.text.trim();
    } catch (e) {
      console.error(e);
      return "Save your coins for a rainy day!";
    }
  },

  getLuckyNumber: async (): Promise<string> => {
    if (!ai) return "7";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Generate a random lucky number between 1 and 99 and a short lucky color. Format: 'Number: [x] Color: [y]'"
        });
        return response.text.trim();
    } catch (e) {
        return "Number: 7, Color: Gold";
    }
  }
};