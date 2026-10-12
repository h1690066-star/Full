require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');

async function syncReceipts() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const receiptsDir = path.join(__dirname, '..', 'private', 'receipts');
  const files = fs.existsSync(receiptsDir) ? fs.readdirSync(receiptsDir) : [];
  console.log(`📁 Local receipt files found: ${files.length}`);

  const orders = await Order.find({});
  console.log(`📦 Orders in DB: ${orders.length}`);

  let updatedCount = 0;
  for (const order of orders) {
    if (!order.receipt) continue;
    const filename = path.basename(order.receipt);
    const localFilePath = path.join(receiptsDir, filename);

    if (fs.existsSync(localFilePath)) {
      const buf = fs.readFileSync(localFilePath);
      const ext = path.extname(filename).toLowerCase();
      const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';

      order.receiptData = buf.toString('base64');
      order.receiptMime = mime;
      await order.save();
      console.log(`✅ Synced receipt for order: ${order.orderNumber} (${filename})`);
      updatedCount++;
    } else {
      // If we don't have this exact file locally, use the most recent available receipt image as fallback
      if (files.length > 0 && !order.receiptData) {
        const fallbackFile = files[files.length - 1];
        const buf = fs.readFileSync(path.join(receiptsDir, fallbackFile));
        order.receiptData = buf.toString('base64');
        order.receiptMime = 'image/jpeg';
        await order.save();
        console.log(`⚠️ Used fallback local receipt for: ${order.orderNumber}`);
        updatedCount++;
      }
    }
  }

  console.log(`\n🎉 Total synced orders: ${updatedCount}`);
  await mongoose.disconnect();
  process.exit(0);
}

syncReceipts().catch((err) => {
  console.error('Sync error:', err);
  process.exit(1);
});
