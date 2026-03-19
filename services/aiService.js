const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getTherapistResponse = async (userMessage, conversationHistory = []) => {
  try {
    const systemPrompt = `You are a compassionate and empathetic AI therapist. 
    Your goal is to provide supportive, non-judgmental responses to help users explore their feelings and thoughts. 
    Use active listening techniques, ask open-ended questions, and avoid giving direct advice unless asked. 
    Maintain a calm and reassuring tone. Remember, you are an AI and not a licensed therapist, so encourage professional help when needed.`;

    // Build messages array with system prompt, conversation history, and current user message
    const messages = [
      { role: 'system', content: systemPrompt },
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
