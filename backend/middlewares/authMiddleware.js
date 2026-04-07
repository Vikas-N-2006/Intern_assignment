const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: missing or malformed authorization header', {
      method: req.method,
      endpoint: req.originalUrl,
      ip: req.ip
    });
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    logger.warn('Authentication failed: token verification error', {
      method: req.method,
      endpoint: req.originalUrl,
      error: err.message
    });
    return res.status(401).json({ error: 'Token is not valid' });
  }
};