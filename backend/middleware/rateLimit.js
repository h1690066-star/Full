const rateLimit = require('express-rate-limit');

// Parol topishga urinishlardan himoya: 15 daqiqada 20 ta urinish
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Juda kop urinish. 15 daqiqadan keyin qayta urinib koring' },
});

// Buyurtma spamidan himoya: 1 soatda 15 ta
module.exports.orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Juda kop buyurtma yuborildi. Keyinroq urinib koring' },
});
