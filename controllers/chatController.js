const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const aiService = require('../services/aiService');

// @desc    Create a new chat session
// @route   POST /api/chat/sessions
// @access  Private
const createSession = async (req, res, next) => {
  try {
    const { title } = req.body;
    const session = await ChatSession.create({
      user: req.userId,
      title: title || 'New Chat Session',
    });
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chat sessions for user
// @route   GET /api/chat/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific chat session with messages
// @route   GET /api/chat/sessions/:id
// @access  Private
const getSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Fetch all messages for this session, sorted by createdAt ascending
    const messages = await Message.find({ chatSession: session._id }).sort({ createdAt: 1 });

    // Combine session with messages
    const sessionWithMessages = {
      ...session.toObject(),
      messages: messages
    };

    res.status(200).json(sessionWithMessages);
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message and get AI response
// @route   POST /api/chat/sessions/:id/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const sessionId = req.params.id;

    // ✅ 1. Validate input
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'Invalid message' });
    }

    // ✅ 2. Check session ownership
    const session = await ChatSession.findOne({
      _id: sessionId,
      user: req.userId,
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // ✅ 3. Save user message
    const userMessage = await Message.create({
      chatSession: sessionId,
      sender: 'user',
      content,
    });

    // ✅ 4. Fetch limited previous messages (last 6)
    const previousMessages = await Message.find({
      chatSession: sessionId,
      _id: { $ne: userMessage._id }
    })
      .sort({ createdAt: -1 })
      .limit(6);

    // Reverse to correct order (old → new)
    const orderedMessages = previousMessages.reverse();

    // ✅ 5. Format conversation history for AI
    const conversationHistory = orderedMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // ✅ 6. Get AI response (with safety fallback)
    let aiResponse;

    try {
      aiResponse = await aiService.getTherapistResponse(
        content,
        conversationHistory
      );
    } catch (error) {
      console.error('AI Error:', error);

      aiResponse =
        "I'm here to listen. I'm having trouble responding right now, but you're not alone. Please consider talking to someone you trust.";
    }

    // ✅ 7. Save AI message
    const aiMessage = await Message.create({
      chatSession: sessionId,
      sender: 'assistant', // better naming than 'ai'
      content: aiResponse,
    });

    // ✅ 8. Update session activity
    session.isActive = true;
    session.updatedAt = new Date();
    await session.save();

    // ✅ 9. Send response
    res.status(201).json({
      success: true,
      data: {
        userMessage,
        aiMessage,
      },
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chat session
// @route   DELETE /api/chat/sessions/:id
// @access  Private
const deleteSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Delete all messages in the session
    await Message.deleteMany({ chatSession: req.params.id });

    res.status(200).json({ message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getSessions,
  getSession,
  sendMessage,
  deleteSession,
};
