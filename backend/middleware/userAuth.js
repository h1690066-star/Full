const jwt = require('jsonwebtoken');

// Faqat oddiy foydalanuvchi (mijoz) tokeni
module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token yoq' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'user') return res.status(403).json({ message: 'Ruxsat yoq' });
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token notogri yoki muddati otgan' });
  }
};
