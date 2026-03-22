const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT } = require('../utils/therapistPrompt');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'models/gemini-2.5-flash',
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

    // Build history properly
    const formattedHistory = conversationHistory?.length
      ? conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Therapist'}: ${msg.content}`)
        .join('\n')
      : 'No previous conversation.';

    // Single clean prompt (NO duplication)
    const prompt = `
${SYSTEM_PROMPT}

Conversation:
${formattedHistory}

User: ${userMessage}

Therapist:
`;

    // Send ONLY this prompt
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    const response = await result.response;
    const text = await response.text();

    return text.trim();

  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm here to listen. Something went wrong, but you're not alone.";
  }
};

module.exports = {
  getTherapistResponse,
};
