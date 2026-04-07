const logger = require("../utils/logger.js");
module.exports = (err, req, res, next) => {
  logger.error('Unhandled application error', {
    error: err.message,
    stack: err.stack,
    endpoint: req.originalUrl,
    method: req.method,
    userId: req.user?.id || null
  });

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Server error'
  });
};