
import { GoogleGenAI, Type } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY}); strictly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeReport = async (description: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this scam report and provide a risk assessment and short summary.
      Category: ${category}
      Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'One-sentence summary of the scam technique.' },
            riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
            warningSigns: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Key warning signs present in this report.'
            }
          },
          required: ['summary', 'riskLevel', 'warningSigns']
        }
      }
    });

    // Access the text property directly from the response.
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};
