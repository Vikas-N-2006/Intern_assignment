const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error('MongoDB connection error', {
      error: err.message,
      stack: err.stack
    });
    throw err;
  }
};

module.exports = connectDB;