const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT } = require('../utils/therapistPrompt');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 500,
  }
});

const getTherapistResponse = async (userMessage, conversationHistory = []) => {
  try {
    if (!userMessage || typeof userMessage !== 'string') {
      throw new Error('Invalid user message');
    }

    // Build conversation string: system prompt + history + current message
    let conversationString = SYSTEM_PROMPT + "\n\n";

    // Add conversation history
    for (const msg of conversationHistory) {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      conversationString += `${role}: ${msg.content}\n`;
    }

    // Add current user message
    conversationString += `User: ${userMessage}\n`;
    conversationString += `Assistant:`;

    const result = await model.generateContent(conversationString);
    const response = await result.response;
    const text = response.text();
    
    return text.trim();

  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm here to listen, but I'm having trouble responding right now. If you're feeling overwhelmed, please consider reaching out to someone you trust or a professional.";
  }
};

module.exports = {
  getTherapistResponse,
};
