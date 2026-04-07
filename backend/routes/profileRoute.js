const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const profileController = require('../controllers/profileController');
const logger = require('../utils/logger');

router.use((req, res, next) => {
  logger.info('Profile route triggered', {
    method: req.method,
    endpoint: req.originalUrl,
    userId: req.user?.id || null
  });
  next();
});

router.get('/me', auth, profileController.getMe);
router.put('/', auth, [
  check('name').optional().notEmpty().withMessage('Name cannot be empty'),
  check('email').optional().isEmail().withMessage('Valid email required'),
],
    profileController.updateMe
);

module.exports = router;
