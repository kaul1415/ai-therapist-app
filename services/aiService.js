const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getTherapistResponse = async (userMessage, sessionId) => {
  try {
    // In a real app, you might want to maintain conversation history per session
    // For simplicity, we'll just send the current message.
    // You can enhance this by storing and retrieving previous messages from the database.

    const systemPrompt = `You are a compassionate and empathetic AI therapist. 
    Your goal is to provide supportive, non-judgmental responses to help users explore their feelings and thoughts. 
    Use active listening techniques, ask open-ended questions, and avoid giving direct advice unless asked. 
    Maintain a calm and reassuring tone. Remember, you are an AI and not a licensed therapist, so encourage professional help when needed.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // or 'gpt-3.5-turbo' for cost savings
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
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
