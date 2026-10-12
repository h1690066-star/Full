const jwt = require('jsonwebtoken');

// Token admin tokeni bolsa req.admin ni toldiradi, aks holda davom etaveradi
module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.role === 'admin') req.admin = payload;
    } catch { /* ignore */ }
  }
  next();
};
