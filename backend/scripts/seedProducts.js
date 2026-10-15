require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Ushbu fayldan barcha namunaviy (seed) mahsulotlar olib tashlangan.
// Mahsulotlar faqat Admin paneli orqali qo'shiladi va boshqariladi.

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB ga ulandi.');

    const count = await Product.countDocuments();
    console.log(`✅ Hozirda bazada faqat admin paneldan qo'shilgan ${count} ta mahsulot mavjud.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Xatolik:', err.message);
    process.exit(1);
  }
})();
