require('dotenv').config();
const { MongoClient } = require('mongodb');

async function migrate() {
  const client = await MongoClient.connect(process.env.MONGO_URI);
  const db = client.db('product-db');
  console.log('Connected to MongoDB');

  const productsColl = db.collection('products');
  const imagesColl = db.collection('uploaded_images');

  // Create unique index on filename
  await imagesColl.createIndex({ filename: 1 }, { unique: true, sparse: true });

  const products = await productsColl.find({ imagesData: { $exists: true, $ne: [] } }).toArray();
  console.log(`Found ${products.length} products with imagesData.`);

  let totalImagesSaved = 0;
  for (const prod of products) {
    if (Array.isArray(prod.imagesData)) {
      for (const img of prod.imagesData) {
        if (img && img.filename && img.data) {
          await imagesColl.updateOne(
            { filename: img.filename },
            { $set: { filename: img.filename, data: img.data, mime: img.mime || 'image/jpeg', updatedAt: new Date() } },
            { upsert: true }
          );
          totalImagesSaved++;
        }
      }
    }
  }
  console.log(`Successfully migrated ${totalImagesSaved} images into uploaded_images collection.`);

  // Now unset imagesData from products collection
  const unsetResult = await productsColl.updateMany(
    { imagesData: { $exists: true } },
    { $unset: { imagesData: "" } }
  );
  console.log(`Unset imagesData on ${unsetResult.modifiedCount} products.`);

  // Verify product list size and query time
  const t0 = Date.now();
  const allProds = await productsColl.find({}).toArray();
  const json = JSON.stringify(allProds);
  console.log(`Verification: ${allProds.length} products queried in ${Date.now() - t0}ms, payload size: ${(json.length / 1024).toFixed(2)} KB!`);

  await client.close();
}

migrate().catch(console.error);

