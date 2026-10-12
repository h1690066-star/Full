const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'uploads');

// "/uploads/abc.jpg" -> uploads papkasidagi faylni o'chiradi (faqat uploads ichida)
exports.removeUpload = (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) return;
  const full = path.resolve(path.join(__dirname, '..', url));
  if (!full.startsWith(root + path.sep)) return;
  fs.unlink(full, () => {});
};
