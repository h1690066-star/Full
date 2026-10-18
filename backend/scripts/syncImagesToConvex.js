const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { ConvexHttpClient } = require('convex/browser');
require('dotenv').config({ path: './.env' });
require('dotenv').config({ path: './.env.local' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://shopuser:sardorx2011@cluster0.nvjec61.mongodb.net/product-db';
const CONVEX_URL = process.env.CONVEX_URL || 'http://127.0.0.1:3210';

async function run() {
  console.log('1. Connecting to MongoDB & Convex...');
  await mongoose.connect(MONGO_URI);
  const client = new ConvexHttpClient(CONVEX_URL);

  // 1. Fetch images from MongoDB uploaded_images collection
  const mongoImages = await mongoose.connection.db.collection('uploaded_images').find({}).toArray();
  console.log(`Found ${mongoImages.length} images in MongoDB uploaded_images`);

  for (const img of mongoImages) {
    if (img.filename && img.data) {
      try {
        await client.mutation('images:saveImage', {
          filename: img.filename,
          data: img.data,
          mime: img.mime || 'image/jpeg',
        });
        console.log(`Synced mongo image: ${img.filename}`);
      } catch (e) {
        console.warn(`Error syncing ${img.filename}:`, e.message);
      }
    }
  }

  // 2. Fetch images from local uploads directory
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    console.log(`Found ${files.length} files in local uploads folder`);
    for (const f of files) {
      if (f.startsWith('.') || f === '.gitkeep') continue;
      const fullPath = path.join(uploadsDir, f);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && stat.size < 5 * 1024 * 1024) {
          const buf = fs.readFileSync(fullPath);
          const ext = path.extname(f).toLowerCase();
          const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
          await client.mutation('images:saveImage', {
            filename: f,
            data: buf.toString('base64'),
            mime,
          });
          console.log(`Synced local upload: ${f}`);
        }
      } catch (err) {
        console.warn(`Error syncing local file ${f}:`, err.message);
      }
    }
  }

  console.log('All images synchronized to Convex!');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
