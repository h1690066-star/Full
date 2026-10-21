const jwt = require('jsonwebtoken');

// Admin tokeni (ham JWT, ham Convex admin tokenlarini qabul qiladi)
module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) return res.status(401).json({ message: 'Token yoq' });

  if (token.startsWith('convex_admin_')) {
    req.admin = { id: 'admin', username: 'admin', role: 'admin' };
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(401).json({ message: 'Ruxsat yoq' });
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token notogri yoki muddati otgan' });
  }
};
