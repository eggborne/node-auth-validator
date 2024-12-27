const { validateAccessToken } = require('../services/authService');

async function tokenValidationMiddleware(req, res, next) {
  const { uid, accessToken } = req.body;

  if (!uid || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields: uid or accessToken' });
  }

  const tokenResult = await validateAccessToken(uid, accessToken);
  if (!tokenResult) {
    return res.status(403).json({ error: 'Unauthorized: Invalid access token' });
  } else {
    req.user = tokenResult;
  }

  next(); // Proceed to the next middleware or route handler
}

module.exports = { tokenValidationMiddleware };