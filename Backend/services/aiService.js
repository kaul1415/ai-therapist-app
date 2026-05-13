const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 400,
  }
});

const getTherapistResponse = async (userMessage, conversationHistory = []) => {
  try {
    if (!userMessage || typeof userMessage !== 'string') {
      throw new Error('Invalid user message');
    }

    // Intent detection
    const lowerMessage = userMessage.toLowerCase().trim();
    let mode = 'emotional support'; // default

    // Define keyword patterns
    const guidancePatterns = [
      /\b(how to|how do i|guide|steps|step by step|procedure|process|tutorial|instructions|learn|teach|show me|explain how)\b/,
      /^(help|how|guide|steps)\b/,
      /\b(walk me through|take me through|demonstrate)\b/
    ];
    const advicePatterns = [
      /\b(advice|suggest|recommend|tip|suggestion|recommendation)\b/,
      /\b(what should i|what can i do|what would you do)\b/
    ];

    if (guidancePatterns.some(pattern => pattern.test(lowerMessage))) {
      mode = 'guidance';
    } else if (advicePatterns.some(pattern => pattern.test(lowerMessage))) {
      mode = 'advice';
    }

    // Build conversation history string
    const formattedHistory = Array.isArray(conversationHistory) && conversationHistory.length
      ? conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Therapist'}: ${msg.content}`)
        .join('\n')
      : 'No previous conversation.';

    // Construct mode-specific system prompt
    let systemPrompt = '';
    switch (mode) {
      case 'emotional support':
        systemPrompt = `
You are Bloom, a calm and supportive AI wellness companion.

Your goal is to help users feel supported, calmer, and understood without sounding overly clinical or robotic.

Rules:
- Respond directly to the user's message first.
- Avoid repetitive therapy phrases.
- Do NOT frequently say:
  - "I hear you"
  - "It sounds like"
  - "Tell me more"
  - "How does that make you feel?"
- Do not repeat the user's message back to them.
- Keep responses natural, warm, and concise.
- Give encouragement and practical emotional support when appropriate.
- Never leave sentences unfinished.
- Avoid sounding scripted or overly formal.
`;
        break;
      case 'guidance':
        systemPrompt = `You are a patient guide. Your primary goal is to provide clear, step-by-step instructions. Break down complex processes into simple, actionable steps. Number each step clearly (e.g., 1., 2., 3.). Be thorough and ensure each step is easy to follow. Maintain a supportive tone.`;
        break;
      case 'advice':
        systemPrompt = `You are a practical advisor. Your primary goal is to provide concise, actionable suggestions. Focus on solutions and be direct. Offer specific tips or recommendations that the user can implement immediately. Ensure advice is given with empathy and without judgment.`;
        break;
    }

    // Add common therapist principles
    const commonPrinciples = `
General guidelines:
- Always maintain a supportive and non-judgmental attitude.
- Use simple, clear language.
- If the user appears to be in emotional distress, prioritize emotional support over guidance or advice.
- Respect privacy and confidentiality.`;

    const fullSystemPrompt = systemPrompt + commonPrinciples;

    // Build the final prompt
    const prompt = `${fullSystemPrompt}

Conversation history:
${formattedHistory}

Current user message: ${userMessage}

Therapist:`;

    // Call Gemini API
    const result = await model.generateContent(prompt);

    const response = await result.response;
    const text = await response.text();
    if (!text || !text.trim()) {
      throw new Error("Empty Gemini response");
    }

    return text.trim();

  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm still here with you. Things may feel difficult right now, but you don't have to carry everything alone. Take one small breath and give yourself a moment of kindness.";
  }
};

module.exports = {
  getTherapistResponse,
};
