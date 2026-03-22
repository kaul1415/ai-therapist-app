const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT: BASE_SYSTEM_PROMPT } = require('../utils/therapistPrompt');

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

    // Intent detection with improved patterns
    const lowerMessage = userMessage.toLowerCase();
    let mode = 'emotional support'; // default mode

    // Guidance mode: user asks for instructions, steps, or help with a task
    if (/(how to|how do i|guide|steps|step by step|procedure|process|tutorial|instructions|learn|teach|show me|explain how)\b/.test(lowerMessage) ||
        /^(help|how|guide|steps)\b/.test(lowerMessage)) {
      mode = 'guidance';
    } 
    // Advice mode: user asks for suggestions or recommendations
    else if (/\b(advice|suggest|recommend|tip|suggestion)\b/.test(lowerMessage)) {
      mode = 'advice';
    }

    // Mode-specific instructions
    const modeInstructions = {
      'emotional support': `You are an empathetic therapist. Your primary goal is to provide emotional support, validation, and active listening. Listen carefully and reflect the user's feelings. Do not give advice unless explicitly asked.`,
      'guidance': `You are a guide. Your primary goal is to provide clear, step-by-step instructions. Break down complex processes into simple, actionable steps. Be patient and thorough. IMPORTANT: Format your response as a numbered list of steps. Each step should be concise and actionable.`,
      'advice': `You are an advisor. Your primary goal is to provide practical, actionable suggestions. Be concise and direct. Focus on solutions.`
    };

    // Build history properly
    const formattedHistory = conversationHistory?.length
      ? conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Therapist'}: ${msg.content}`)
        .join('\n')
      : 'No previous conversation.';

    // Single clean prompt (NO duplication)
    const prompt = `
${modeInstructions[mode]}

${BASE_SYSTEM_PROMPT}

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
