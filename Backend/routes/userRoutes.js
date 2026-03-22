const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Protect all routes
router.use(auth);

router.get('/profile', userController.getProfile);
router.put('/profile', [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
], userController.updateProfile);

module.exports = router;
