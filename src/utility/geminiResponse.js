import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash-latest" });
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const getAIResponse = async (userMessage, persona) => {
  const prompt = `
${persona}

CRITICAL INSTRUCTION: Before responding, carefully analyze the language used in the user's message below. You MUST respond in the exact same language (English, Hindi, or Gujarati) that the user used in their message. Never use any other language.

User's message to reply to: ${userMessage}

Remember: Detect the language from the above user message and reply only in that same language.
  `;
  try {
    console.log("Prompt sent to Gemini:", prompt);
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "I'm having trouble understanding right now. Please try again!";
  }
};
