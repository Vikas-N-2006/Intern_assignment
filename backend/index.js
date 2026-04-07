const { configDotenv } = require('dotenv');
configDotenv();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 4000;


const startServer = async () => {
  try {
    await connectDB();
    logger.info('Database connection established successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (err) {
    logger.error('Server startup failed', {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
};

startServer();