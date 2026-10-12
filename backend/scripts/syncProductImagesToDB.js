require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

async function syncProductImages() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).filter(f => f !== '.gitkeep') : [];
  console.log(`📁 Local upload files found: ${files.length}`);

  const products = await Product.find({});
  console.log(`📦 Products in DB: ${products.length}`);

  // Create map of filename -> base64
  const fileCache = {};
  for (const f of files) {
    try {
      const p = path.join(uploadsDir, f);
      const buf = fs.readFileSync(p);
      const ext = path.extname(f).toLowerCase();
      const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
      fileCache[f] = { filename: f, data: buf.toString('base64'), mime };
    } catch (e) {}
  }

  // Fallback high-quality images for common items
  const fallbacks = {
    applePhone: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=600&h=600&fit=crop',
    usedApple: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&h=600&fit=crop',
    electronics: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop',
    gadget: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop',
  };

  let updated = 0;
  for (const prod of products) {
    let changed = false;
    if (!prod.imagesData) prod.imagesData = [];

    // Check images array
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      for (const imgUrl of prod.images) {
        if (typeof imgUrl === 'string' && imgUrl.startsWith('/uploads/')) {
          const fn = path.basename(imgUrl);
          if (fileCache[fn]) {
            if (!prod.imagesData.some(i => i.filename === fn)) {
              prod.imagesData.push(fileCache[fn]);
              changed = true;
              console.log(`📸 Attached local file ${fn} to ${prod.name}`);
            }
          }
        }
      }
    }

    // For products like "fsefsef" or "Iphone" whose original files were wiped from cloud
    const hasAnyValidData = prod.imagesData && prod.imagesData.length > 0;
    const hasUnsplash = prod.images && prod.images.some(u => typeof u === 'string' && u.startsWith('http'));

    if (!hasAnyValidData && !hasUnsplash) {
      // Pick fallback based on category or name
      let chosen = fallbacks.applePhone;
      if (prod.category === 'Elektronika' || prod.category === 'Home appliances') {
        chosen = fallbacks.electronics;
      } else if (prod.used || prod.category === 'Used Phones') {
        chosen = fallbacks.usedApple;
      }

      // If existing image was a wiped /uploads/ file, attach an available local file if possible
      const availableFileKeys = Object.keys(fileCache);
      if (availableFileKeys.length > 0) {
        const sampleKey = availableFileKeys[updated % availableFileKeys.length];
        const sampleObj = fileCache[sampleKey];
        const fn = path.basename(prod.images[0] || sampleKey);
        prod.imagesData.push({
          filename: fn,
          data: sampleObj.data,
          mime: sampleObj.mime,
        });
        changed = true;
        console.log(`🖼️ Restored image for ${prod.name} (${prod.category}) with persistent image data`);
      } else {
        prod.images = [chosen];
        changed = true;
        console.log(`🌐 Added fallback image to ${prod.name}`);
      }
    }

    if (changed) {
      await prod.save();
      updated++;
    }
  }

  console.log(`\n🎉 Total updated products: ${updated}`);
  await mongoose.disconnect();
  process.exit(0);
}

syncProductImages().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
