module.exports = function requireApiKey(req, res, next) {
  const configuredKey = process.env.API_KEY;
  if (!configuredKey) {
    return res.status(500).json({ success: false, error: 'API key not configured on server' });
  }
  const providedKey = req.header('X-API-KEY');
  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
};


