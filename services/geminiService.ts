import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return ai;
};

export const generateThalassaResponse = async (userPrompt: string): Promise<string> => {
  try {
    const client = getAI();
    const model = client.models;
    
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "Communication with the deep disrupted. Re-calibrating sonar...";
  } catch (error) {
    console.error("Thalassa Connection Error:", error);
    return "The currents are too strong. Signal lost.";
  }
};
