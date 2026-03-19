const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Protect all routes
router.use(auth);

router.post('/sessions', chatController.createSession);
router.get('/sessions', chatController.getSessions);
router.get('/sessions/:id', chatController.getSession);
router.post('/sessions/:id/messages', [
  body('content').notEmpty().withMessage('Message content is required'),
], chatController.sendMessage);
router.delete('/sessions/:id', chatController.deleteSession);

module.exports = router;
