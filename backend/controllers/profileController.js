const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if(!user) return res.status(404).json({ success:false, error:'User not found' });
    res.json({ success:true, user });
  } catch (err) { next(err); }
};

exports.updateMe = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });

  try {
    const user = await User.findById(req.user.id);
    if(!user) return res.status(404).json({ success:false, error:'User not found' });

    const { name, email } = req.body;
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success:false, error:'Email already in use' });
      user.email = email;
    }
    if (name) user.name = name;
    await user.save();
    res.json({ success:true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};