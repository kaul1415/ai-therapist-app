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
    }).populate({
      path: 'messages',
      options: { sort: { createdAt: 1 } },
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.status(200).json(session);
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

    // Verify session belongs to user
    const session = await ChatSession.findOne({
      _id: sessionId,
      user: req.userId,
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

    // Fetch all previous messages for this session to build conversation history
    const previousMessages = await Message.find({ 
      chatSession: sessionId,
      _id: { $ne: userMessage._id } // Exclude the current message we just saved
    }).sort({ createdAt: 1 });

    // Build conversation history array for OpenAI
    const conversationHistory = previousMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Get AI response with conversation history
    const aiResponse = await aiService.getTherapistResponse(content, conversationHistory);

    // Save AI message
    const aiMessage = await Message.create({
      chatSession: sessionId,
      sender: 'ai',
      content: aiResponse,
    });

    // Update session's last activity
    session.isActive = true;
    await session.save();

    res.status(201).json({
      userMessage,
      aiMessage,
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
