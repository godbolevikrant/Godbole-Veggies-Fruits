const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ success: false, error: 'username is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, error: 'password must be at least 6 chars' });
    }
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ success: false, error: 'username already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: 'username and password are required' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};


