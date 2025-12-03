import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const optimizeSubjectLine = async (subject: string): Promise<string> => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are an expert corporate communication specialist. 
      Analyze the following email subject line: "${subject}".
      
      Provide a response in plain text that contains exactly 3 bullet points.
      Each bullet point should be a strictly better, more engaging alternative subject line 
      that keeps the professional tone but increases the probability of the email being opened.
      Do not add introductory text or conversational filler. Just the 3 bullet points.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Could not generate suggestions.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI service. Please check your API key.";
  }
};
