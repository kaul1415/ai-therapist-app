const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const aiService = require('../services/aiService');

// @desc    Create a new chat session
// @route   POST /api/chat/sessions
// @access  Public
const createSession = async (req, res, next) => {
  console.log('chatController.createSession hit');
  try {
    const { title } = req.body;
    const session = await ChatSession.create({
      title: title || 'New Chat Session',
    });
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chat sessions
// @route   GET /api/chat/sessions
// @access  Public
const getSessions = async (req, res, next) => {
  console.log('chatController.getSessions hit');
  try {
    const sessions = await ChatSession.find({}).sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific chat session with messages
// @route   GET /api/chat/sessions/:id
// @access  Public
const getSession = async (req, res, next) => {
  console.log('chatController.getSession hit');
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
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
// @access  Public
const sendMessage = async (req, res, next) => {
  console.log('chatController.sendMessage hit');
  try {
    const content = req.body.content || req.body.message;
    const sessionId = req.params.id;

    // Validate input
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'Invalid message' });
    }

    // Check if session exists
    const session = await ChatSession.findOne({
      _id: sessionId,
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Save user message
    const userMessage = await Message.create({
      chatSession: sessionId,
      sender: 'user',
      content,
    });

    // Fetch limited previous messages (last 6)
    const previousMessages = await Message.find({
      chatSession: sessionId,
      _id: { $ne: userMessage._id }
    })
      .sort({ createdAt: -1 })
      .limit(6);

    // Reverse to correct order (old → new)
    const orderedMessages = previousMessages.reverse();

    // Format conversation history for AI
    const conversationHistory = orderedMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Get AI response (with safety fallback)
    let aiResponse;

    try {
      aiResponse = await aiService.getTherapistResponse(
        content,
        conversationHistory
      );
    } catch (error) {
      console.error('AI Error:', error);
      aiResponse = "I'm here to listen. I'm having trouble responding right now, but you're not alone. Please consider talking to someone you trust.";
    }

    // Save AI message
    const aiMessage = await Message.create({
      chatSession: sessionId,
      sender: 'ai',
      content: aiResponse,
    });

    // Update session activity
    session.isActive = true;
    session.updatedAt = new Date();
    await session.save();

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
// @access  Public
const deleteSession = async (req, res, next) => {
  console.log('chatController.deleteSession hit');
  try {
    const session = await ChatSession.findOneAndDelete({
      _id: req.params.id,
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
