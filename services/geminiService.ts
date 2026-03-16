
// Fix: Use strictly the recommended import for GoogleGenAI
import { GoogleGenAI } from "@google/genai";

export interface MediaPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export const generateAIResponse = async (
  prompt: string, 
  history: { role: string; parts: ( { text: string } | MediaPart )[] }[],
  image?: { mimeType: string; data: string }
): Promise<string> => {
  // Fix: Initialize GoogleGenAI inside the function as recommended
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const contents: any[] = [...history];
    const currentParts: any[] = [{ text: prompt }];

    if (image) {
      currentParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        }
      });
    }

    contents.push({ role: 'user', parts: currentParts });

    // Fix: Using 'gemini-1.5-flash'.
    // This is the most reliable Free Tier model that supports Images (Multimodal).
    // It avoids the billing requirements of 2.0-flash and the 404 errors of the Gemma models.
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
      config: {
        systemInstruction: `Your name is "CropShield AI". You are a friendly and professional agricultural health assistant.

        RULES FOR RESPONSE:
        1. LANGUAGE: Use simple, professional English. Do not use Hindi or slang.
        2. STRUCTURE: Use clear bullet points and emojis.
           - ## 🌱 Crop Identification
           - ## 🏥 Diagnosis (What's wrong?)
           - ## 🛡️ CropShield Care Plan (Step-by-step)
           - ## 💧 Vital Stats (Light, Water, Soil - use simple table)
        3. TONE: Protective, helpful, and scientific yet accessible.
        4. IMAGES: If an image is provided, analyze the leaves, stem, and soil carefully for pests or disease.
        5. AUTOMATION: Mention that the user can set up automated CropShield alerts for this crop.

        Goal: Empower the user to protect their crops and maximize yield.`,
        temperature: 0.6,
        topP: 0.9,
      }
    });

    // Fix: Use response.text property directly
    return response.text || "I'm sorry, I couldn't process that report. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: System is currently busy or the model is unavailable. Please try again.";
  }
};
