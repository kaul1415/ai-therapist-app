const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const chatRoutes = require('./chatRoutes');
const userRoutes = require('./userRoutes');

// router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
// router.use('/users', userRoutes);

module.exports = router;
