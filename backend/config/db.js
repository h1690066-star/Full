const mongoose = require('mongoose');

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB ulandi');
  } catch (err) {
    console.error('MongoDB xato:', err.message);
    if (/ECONNREFUSED/.test(err.message)) {
      console.error("MongoDB serveri ishlamayapti. Windows: 'net start MongoDB' (admin CMD) yoki MongoDB Atlas ishlating (MONGO_URI ni almashtiring).");
    }
    process.exit(1);
  }
};
