const mongoose = require('mongoose');
const { ConvexHttpClient } = require('convex/browser');
require('dotenv').config({ path: './.env' });
require('dotenv').config({ path: './.env.local' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://shopuser:sardorx2011@cluster0.nvjec61.mongodb.net/product-db';
const CONVEX_URL = process.env.CONVEX_URL || 'http://127.0.0.1:3210';

// Helper to sanitize any MongoDB document into clean JSON with no Date or ObjectId
function cleanDoc(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.getTime();
  if (typeof obj === 'object') {
    if (obj._bsontype === 'ObjectID' || obj._bsontype === 'ObjectId' || obj.constructor?.name === 'ObjectId') {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(cleanDoc);
    }
    const res = {};
    for (const [key, val] of Object.entries(obj)) {
      if (key === '_id' || key === '__v') continue;
      if (val instanceof Date) {
        res[key] = val.getTime();
      } else {
        res[key] = cleanDoc(val);
      }
    }
    return res;
  }
  return obj;
}

async function run() {
  console.log('1. Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected successfully!');

  console.log(`2. Connecting to Convex at ${CONVEX_URL}...`);
  const client = new ConvexHttpClient(CONVEX_URL);

  const rawProducts = await mongoose.connection.db.collection('products').find({}).toArray();
  const rawOrders = await mongoose.connection.db.collection('orders').find({}).toArray();
  const rawSite = await mongoose.connection.db.collection('sitecontents').find({}).toArray();

  console.log(`Found: ${rawProducts.length} products, ${rawOrders.length} orders, ${rawSite.length} siteContents`);

  // 1. Products
  if (rawProducts.length > 0) {
    const products = rawProducts.map((p) => {
      const clean = cleanDoc(p);
      clean.originalId = p._id.toString();
      delete clean.imagesData; // exclude heavy mongo base64 array
      return clean;
    });

    console.log('Importing products into Convex...');
    try {
      const res = await client.mutation('migrate:importProducts', { products });
      console.log('Products imported successfully:', res);
    } catch (e) {
      console.error('Error importing products:', e.message);
    }
  }

  // 2. Orders
  if (rawOrders.length > 0) {
    const orders = rawOrders.map((o) => {
      const clean = cleanDoc(o);
      delete clean.receiptData; // exclude heavy base64
      return clean;
    });

    console.log('Importing orders into Convex...');
    try {
      const res = await client.mutation('migrate:importOrders', { orders });
      console.log('Orders imported successfully:', res);
    } catch (e) {
      console.error('Error importing orders:', e.message);
    }
  }

  // 3. SiteContent
  if (rawSite.length > 0) {
    const content = cleanDoc(rawSite[0]);
    console.log('Importing siteContent into Convex...');
    try {
      const res = await client.mutation('migrate:importSiteContent', { content });
      console.log('Site content imported successfully:', res);
    } catch (e) {
      console.error('Error importing site content:', e.message);
    }
  }

  // 4. Users
  const rawUsers = await mongoose.connection.db.collection('users').find({}).toArray();
  if (rawUsers.length > 0) {
    const users = rawUsers.map((u) => {
      const clean = cleanDoc(u);
      clean.originalId = u._id.toString();
      delete clean.avatarData;
      return clean;
    });

    console.log(`Importing ${users.length} users into Convex...`);
    try {
      const res = await client.mutation('users:importUsers', { users });
      console.log('Users imported successfully:', res);
    } catch (e) {
      console.error('Error importing users:', e.message);
    }
  }

  console.log('Migration to Convex completely finished!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
