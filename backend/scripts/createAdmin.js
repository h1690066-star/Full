require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

(async () => {
  try {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !password) throw new Error('.env da ADMIN_USERNAME / ADMIN_PASSWORD yoq');

    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

    // Eski adminlarni o'chiramiz (faqat bitta admin bo'ladi)
    await Admin.deleteMany({});
    await Admin.create({ username, password });

    console.log('Admin tayyor:', username);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Xatolik:', err.message);
    process.exit(1);
  }
})();
