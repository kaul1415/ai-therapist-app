const OpenAI = require('openai');
const { SYSTEM_PROMPT } = require('./therapistPrompt');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getTherapistResponse = async (userMessage, conversationHistory = []) => {
  try {
    // Build messages array with system prompt, conversation history, and current user message
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // or 'gpt-3.5-turbo' for cost savings
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get AI response');
  }
};

module.exports = {
  getTherapistResponse,
};
