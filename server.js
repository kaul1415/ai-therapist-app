require('dotenv').config(); // Loads variables from .env
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

// Import config
const { connectDB } = require('./config/database');
const { validateEnv } = require('./config/env');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const apiRoutes = require('./routes');

// Validate environment variables
console.log('TEST .env:', process.env.MONGODB_URI);
validateEnv();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/api', (req, res) => {
  res.send('API is working 🚀');
});
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // for testing
