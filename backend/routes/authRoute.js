const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

router.use((req, res, next) => {
  logger.info('Auth route triggered', {
    method: req.method,
    endpoint: req.originalUrl
  });
  next();
});

// POST /api/auth/register
router.post('/register', [
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Invalid registration payload', {
      endpoint: req.originalUrl,
      validationErrors: errors.array()
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      logger.warn('Registration blocked: user already exists', {
        endpoint: req.originalUrl,
        email
      });
      return res.status(400).json({ error: 'User already exists' });
    }

    logger.info('Creating user account', {
      endpoint: req.originalUrl,
      email
    });

    const passwordHash = await bcrypt.hash(password, 10);
    user = new User({ name, email, passwordHash });
    await user.save();

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    logger.info('User registered successfully', {
      endpoint: req.originalUrl,
      userId: user._id.toString()
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    logger.error('User registration failed', {
      endpoint: req.originalUrl,
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Invalid login payload', {
      endpoint: req.originalUrl,
      validationErrors: errors.array()
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login failed: user not found', {
        endpoint: req.originalUrl,
        email
      });
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      logger.warn('Login failed: invalid password', {
        endpoint: req.originalUrl,
        userId: user._id.toString()
      });
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    logger.info('Login successful', {
      endpoint: req.originalUrl,
      userId: user._id.toString()
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    logger.error('User login failed', {
      endpoint: req.originalUrl,
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;