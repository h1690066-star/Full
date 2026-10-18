const jwt = require('jsonwebtoken');

// Token admin yoki user tokeni bo'lsa req.admin yoki req.user ni to'ldiradi, aks holda xatosiz davom etadi
module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.role === 'admin') req.admin = payload;
      if (payload.role === 'user') req.user = payload;
    } catch { /* ignore invalid/expired token */ }
  }
  next();
};
