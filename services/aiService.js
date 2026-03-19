const OpenAI = require('openai');
const { SYSTEM_PROMPT } = require('../utils/therapistPrompt');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getTherapistResponse = async (userMessage, conversationHistory = []) => {
  try {
    if (!userMessage || typeof userMessage !== 'string') {
      throw new Error('Invalid user message');
    }

    const limitedHistory = conversationHistory.slice(-6);

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...limitedHistory,
      { role: 'user', content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    return completion.choices[0].message.content.trim();

  } catch (error) {
    console.error('OpenAI API error:', error);

    return "I'm here to listen, but I'm having trouble responding right now. If you're feeling overwhelmed, please consider reaching out to someone you trust or a professional.";
  }
};

module.exports = {
  getTherapistResponse,
};
