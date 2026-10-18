const jwt = require('jsonwebtoken');

// Foydalanuvchi tokeni bo'lsa req.user ga yozadi, aks holda mehmon sifatida o'tkazadi
module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload && (payload.role === 'user' || payload.role === 'admin')) {
        req.user = payload;
      }
    } catch {
      // Token muddati o'tgan yoki noto'g'ri bo'lsa mehmon sifatida davom etadi
    }
  }
  next();
};
