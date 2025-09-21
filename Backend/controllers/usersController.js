const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.status = (req, res) => {
  const singleUserUsername = process.env.SINGLE_USER_USERNAME || process.env.ADMIN_USERNAME;
  const hasPlain = Boolean(process.env.SINGLE_USER_PASSWORD || process.env.ADMIN_PASSWORD);
  const hasHash = Boolean(process.env.SINGLE_USER_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH);
  res.json({
    success: true,
    mode: singleUserUsername ? 'single-user' : 'db',
    username: singleUserUsername || null,
    passwordConfigured: hasPlain || hasHash,
    usesHash: hasHash,
  });
};

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
    // Single-user mode via env vars
    const singleUserUsername = process.env.SINGLE_USER_USERNAME || process.env.ADMIN_USERNAME;
    const singleUserPassword = process.env.SINGLE_USER_PASSWORD || process.env.ADMIN_PASSWORD;
    const singleUserPasswordHash = process.env.SINGLE_USER_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH;

    // Debug (safe): log which mode we're using and expected username
    const mode = singleUserUsername ? 'single-user' : 'db';
    console.log(`[auth] mode=${mode}, expectedUser=${singleUserUsername || 'DB'}, usesHash=${Boolean(singleUserPasswordHash)}`);

    if (singleUserUsername) {
      if (username !== singleUserUsername) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      if (singleUserPasswordHash) {
        const valid = await bcrypt.compare(password, singleUserPasswordHash);
        if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });
      } else if (typeof singleUserPassword === 'string') {
        if (password !== singleUserPassword) {
          return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
      } else {
        return res.status(500).json({ success: false, error: 'Server is misconfigured for single-user auth' });
      }
      return res.json({ success: true, user: { username } });
    }

    // Fallback to DB-based auth if single-user not configured
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    res.json({ success: true, user: { username } });
  } catch (err) {
    next(err);
  }
};


