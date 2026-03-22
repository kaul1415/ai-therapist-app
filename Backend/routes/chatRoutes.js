const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/sessions', chatController.createSession);
router.get('/sessions', chatController.getSessions);
router.get('/sessions/:id', chatController.getSession);
router.post('/sessions/:id/messages', chatController.sendMessage);
router.delete('/sessions/:id', chatController.deleteSession);

module.exports = router;
