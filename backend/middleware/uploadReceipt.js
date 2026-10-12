const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Chek rasmlari ochiq (static) emas, alohida yopiq papkada saqlanadi
const dir = path.join(__dirname, '..', 'private', 'receipts');
fs.mkdirSync(dir, { recursive: true });

module.exports = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Chek faqat rasm bolishi kerak (jpg, png, webp)'));
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});
module.exports.dir = dir;
