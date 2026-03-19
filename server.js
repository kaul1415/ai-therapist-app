const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Import config
const { connectDB } = require('./config/database');
const { validateEnv } = require('./config/env');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const apiRoutes = require('./routes');

// Validate environment variables
validateEnv();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // for testing
