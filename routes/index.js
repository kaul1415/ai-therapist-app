const express = require('express');
const router = express.Router();

const chatRoutes = require('./chatRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

router.use('/chat', chatRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
