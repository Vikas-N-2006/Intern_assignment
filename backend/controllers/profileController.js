const User = require('../models/User');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

exports.getMe = async (req, res, next) => {
  logger.info('Profile fetch requested', {
    method: req.method,
    endpoint: req.originalUrl,
    userId: req.user?.id || null
  });

  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if(!user) {
      logger.warn('Profile fetch failed: user not found', {
        userId: req.user?.id || null
      });
      return res.status(404).json({ success:false, error:'User not found' });
    }

    res.json({ success:true, user });
  } catch (err) {
    logger.error('Failed to fetch profile', {
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    logger.warn('Invalid payload for profile update', {
      method: req.method,
      endpoint: req.originalUrl,
      userId: req.user?.id || null,
      validationErrors: errors.array()
    });
    return res.status(400).json({ success:false, errors: errors.array() });
  }

  logger.info('Profile update requested', {
    method: req.method,
    endpoint: req.originalUrl,
    userId: req.user?.id || null,
    bodyKeys: Object.keys(req.body || {})
  });

  try {
    const user = await User.findById(req.user.id);
    if(!user) {
      logger.warn('Profile update failed: user not found', {
        userId: req.user?.id || null
      });
      return res.status(404).json({ success:false, error:'User not found' });
    }

    const { name, email } = req.body;
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        logger.warn('Profile update blocked: email already in use', {
          userId: req.user?.id || null
        });
        return res.status(400).json({ success:false, error:'Email already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    await user.save();

    logger.info('Profile updated', {
      userId: user._id.toString()
    });

    res.json({ success:true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    logger.error('Failed to update profile', {
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });
    next(err);
  }
};