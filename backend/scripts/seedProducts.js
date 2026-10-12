require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const categories = ['Elektronika', 'Phones', 'B/U Telefonlar', 'Used Phones', 'Home appliances', 'Aksessuarlar', 'Kiyim', 'Oyoq kiyimi'];

// 5 ta Home appliances
const homeAppliancesProducts = [
  {
    name: 'Muzlatgich LG NoFrost 340L',
    desc: 'Ikki kamerali NoFrost muzlatgich, energiya tejamkor A++',
    longDesc: 'LG NoFrost texnologiyali muzlatgich, muz tutmaydi, shovqinsiz inverter kompressor.',
    brand: 'LG',
    category: 'Home appliances',
    price: 7800000,
    oldPrice: 8500000,
    discount: 8,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&h=400&fit=crop',
    specs: [{ label: 'Hajmi', value: '340 litr' }, { label: 'Turi', value: 'NoFrost' }],
  },
  {
    name: 'Kir yuvish mashinasi Samsung EcoBubble 7kg',
    desc: '7 kg sig`imga ega, ko`pikli yuvish va inverter motor',
    longDesc: 'EcoBubble texnologiyasi past haroratda ham matoni chuqur va toza yuvadi.',
    brand: 'Samsung',
    category: 'Home appliances',
    price: 5400000,
    oldPrice: 6000000,
    discount: 10,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop',
    specs: [{ label: 'Sig`imi', value: '7 kg' }, { label: 'Aylanish', value: '1200 ob/min' }],
  },
  {
    name: 'Mikrotolqinli pech Panasonic 23L',
    desc: 'Grill va avto-isitish rejimlariga ega zamonaviy pech',
    longDesc: 'Panasonic 23 litrli mikrotolqinli pech, taymer va tez isitish funksiyasi bilan.',
    brand: 'Panasonic',
    category: 'Home appliances',
    price: 1600000,
    oldPrice: 1900000,
    discount: 15,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop',
    specs: [{ label: 'Hajmi', value: '23 litr' }, { label: 'Quvvat', value: '900W' }],
  },
  {
    name: 'Changyutgich Dyson V11 Absolute',
    desc: 'Simsiz vertikal kuchli changyutgich',
    longDesc: 'Dyson V11 aquvvatli va aqlli filtrga ega simsiz changyutgich.',
    brand: 'Dyson',
    category: 'Home appliances',
    price: 8900000,
    oldPrice: 9500000,
    discount: 6,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=400&fit=crop',
    specs: [{ label: 'Ishlash vaqti', value: '60 daqiqa' }, { label: 'Turi', value: 'Simsiz' }],
  },
  {
    name: 'Konditsioner Artel Inverter 12000 BTU',
    desc: 'Isitish va sovutish rejimli tejamkor konditsioner',
    longDesc: '35 kv.m xona uchun mo`ljallangan Artel Inverter konditsioneri.',
    brand: 'Artel',
    category: 'Home appliances',
    price: 4600000,
    oldPrice: 5100000,
    discount: 9,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop',
    specs: [{ label: 'Maydon', value: '35 kv.m' }, { label: 'BTU', value: '12000' }],
  },
];

// 10 ta B/U Telefonlar (Kategoriya: "B/U Telefonlar")
const buPhoneProducts = [
  {
    name: 'iPhone 14 Pro 128GB (B/U)',
    desc: 'Ideal holatda, batareya 92%, barcha qismlari radnoy',
    longDesc: 'iPhone 14 Pro B/U 128GB Deep Purple. Qirqilgan joylari yo`q, chexol va korobka bor.',
    brand: 'Apple',
    category: 'B/U Telefonlar',
    price: 8700000,
    oldPrice: 9500000,
    discount: 8,
    stock: 3,
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop',
    storage: ['128GB'],
    specs: [{ label: 'Batareya', value: '92%' }, { label: 'Holati', value: 'Ideal (A+)' }],
  },
  {
    name: 'iPhone 13 Pro Max 256GB (B/U)',
    desc: 'Yaxshi holatda, 88% batareya, Graphite rang',
    longDesc: 'iPhone 13 Pro Max B/U 256GB, kam ishlatilgan, Usta ko`rmagan.',
    brand: 'Apple',
    category: 'B/U Telefonlar',
    price: 7900000,
    oldPrice: 8600000,
    discount: 8,
    stock: 2,
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&h=400&fit=crop',
    storage: ['256GB'],
    specs: [{ label: 'Batareya', value: '88%' }, { label: 'Holati', value: 'A' }],
  },
  {
    name: 'iPhone 12 64GB (B/U)',
    desc: 'Toza ishlatilgan, batareya 85%, qora rang',
    longDesc: 'iPhone 12 B/U 64GB Black. FaceID ishlaydi, radnoy ekran.',
    brand: 'Apple',
    category: 'B/U Telefonlar',
    price: 4500000,
    oldPrice: 5000000,
    discount: 10,
    stock: 4,
    image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400&h=400&fit=crop',
    storage: ['64GB'],
    specs: [{ label: 'Batareya', value: '85%' }, { label: 'Holati', value: 'A' }],
  },
  {
    name: 'iPhone 11 128GB (B/U)',
    desc: 'Oq rang, batareya 86%, korobka zaryadnik bor',
    longDesc: 'iPhone 11 B/U 128GB White. Hamma joyi ishlashi a`lo.',
    brand: 'Apple',
    category: 'B/U Telefonlar',
    price: 3600000,
    oldPrice: 4000000,
    discount: 10,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1574944985070-8f3297426535?w=400&h=400&fit=crop',
    storage: ['128GB'],
    specs: [{ label: 'Batareya', value: '86%' }, { label: 'Holati', value: 'A' }],
  },
  {
    name: 'Samsung Galaxy S23 Ultra 256GB (B/U)',
    desc: 'Phantom Black, 12GB RAM, S-Pen bor',
    longDesc: 'Samsung S23 Ultra B/U 256GB. Hujjatlari to`liq, tirnalmagan.',
    brand: 'Samsung',
    category: 'B/U Telefonlar',
    price: 8900000,
    oldPrice: 9800000,
    discount: 9,
    stock: 2,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
    storage: ['256GB'],
    specs: [{ label: 'RAM', value: '12GB' }, { label: 'Holati', value: 'Ideal' }],
  },
  {
    name: 'Samsung Galaxy S22 128GB (B/U)',
    desc: 'Green rang, holati yaxshi, 8GB RAM',
    longDesc: 'Samsung S22 B/U 128GB Green. Ekran toza, batareya yaxshi saqlaydi.',
    brand: 'Samsung',
    category: 'B/U Telefonlar',
    price: 5200000,
    oldPrice: 5800000,
    discount: 10,
    stock: 3,
    image: 'https://images.unsplash.com/photo-1511367461735-48270e90677d?w=400&h=400&fit=crop',
    storage: ['128GB'],
    specs: [{ label: 'RAM', value: '8GB' }, { label: 'Holati', value: 'A' }],
  },
  {
    name: 'Samsung Galaxy A54 128GB (B/U)',
    desc: 'Awesome Violet, 6 oy ishlatilgan',
    longDesc: 'Samsung A54 B/U 128GB. Kafolati qolgan, korobka komplekt.',
    brand: 'Samsung',
    category: 'B/U Telefonlar',
    price: 2900000,
    oldPrice: 3300000,
    discount: 12,
    stock: 6,
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop',
    storage: ['128GB'],
    specs: [{ label: 'RAM', value: '8GB' }, { label: 'Holati', value: 'Ideal' }],
  },
  {
    name: 'Redmi Note 12 Pro 256GB (B/U)',
    desc: 'Blue, 8GB RAM, 67W zaryadkasi bor',
    longDesc: 'Redmi Note 12 Pro B/U 256GB Blue. 108MP kamera, juda kam ishlatilgan.',
    brand: 'Xiaomi',
    category: 'B/U Telefonlar',
    price: 2400000,
    oldPrice: 2800000,
    discount: 14,
    stock: 4,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop',
    storage: ['256GB'],
    specs: [{ label: 'RAM', value: '8GB' }, { label: 'Holati', value: 'A' }],
  },
  {
    name: 'Poco X5 Pro 5G 128GB (B/U)',
    desc: 'Yellow rang, Snapdragon 778G, o`yinlar uchun a`lo',
    longDesc: 'Poco X5 Pro B/U 128GB Yellow. Ekran 120Hz, qizimaydi.',
    brand: 'Poco',
    category: 'B/U Telefonlar',
    price: 2200000,
    oldPrice: 2500000,
    discount: 12,
    stock: 3,
    image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop',
    storage: ['128GB'],
    specs: [{ label: 'RAM', value: '6GB' }, { label: 'Holati', value: 'A' }],
  },
  {
    name: 'Google Pixel 7 Pro 128GB (B/U)',
    desc: 'Hazel rang, kamerasiga gap yo`q, radnoy',
    longDesc: 'Google Pixel 7 Pro B/U 128GB. Android 14 o`rnatilgan, toza holatda.',
    brand: 'Google',
    category: 'B/U Telefonlar',
    price: 5800000,
    oldPrice: 6500000,
    discount: 10,
    stock: 2,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop',
    storage: ['128GB'],
    specs: [{ label: 'RAM', value: '12GB' }, { label: 'Holati', value: 'A+' }],
  },
];

// 10 ta Used Phones (Kategoriya: "Used Phones")
const usedPhonesProducts = buPhoneProducts.map((p) => ({
  ...p,
  name: p.name.replace('(B/U)', '(Used Phone)'),
  category: 'Used Phones',
}));

// 10 ta Yangi (New) Telefonlar
const newPhoneProducts = [
  {
    name: 'iPhone 15 Pro Max 256GB (Yangi)',
    desc: 'Yangi Apple flagmani, Natural Titanium, 1 yil kafolat',
    longDesc: 'iPhone 15 Pro Max 256GB Natural Titanium. Umuman ochilmagan, paketyopilgan.',
    brand: 'Apple',
    category: 'Phones',
    price: 14500000,
    oldPrice: 15500000,
    discount: 6,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop',
    storage: ['256GB', '512GB'],
    specs: [{ label: 'Holati', value: 'Yangi (Upakovka)' }, { label: 'Kafolat', value: '1 yil Apple' }],
  },
  {
    name: 'iPhone 15 Pro 128GB (Yangi)',
    desc: 'A17 Pro chip, Titanium dizayn, 120Hz ekran',
    longDesc: 'iPhone 15 Pro 128GB Black Titanium. Rasmiy kafolati bor.',
    brand: 'Apple',
    category: 'Phones',
    price: 12800000,
    oldPrice: 13800000,
    discount: 7,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=400&h=400&fit=crop',
    storage: ['128GB', '256GB'],
    specs: [{ label: 'Holati', value: 'Yangi' }, { label: 'Kafolat', value: '1 yil' }],
  },
  {
    name: 'iPhone 15 128GB (Yangi)',
    desc: 'Dynamic Island va 48MP asosiy kamera',
    longDesc: 'iPhone 15 128GB Pink. 100% original yangi qadoqda.',
    brand: 'Apple',
    category: 'Phones',
    price: 9800000,
    oldPrice: 10500000,
    discount: 6,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop',
    storage: ['128GB'],
    specs: [{ label: 'Holati', value: 'Yangi' }, { label: 'Kafolat', value: '1 yil' }],
  },
  {
    name: 'Samsung Galaxy S24 Ultra 256GB (Yangi)',
    desc: 'Galaxy AI, Titanium ramka, 200MP kamera',
    longDesc: 'Samsung Galaxy S24 Ultra 256GB Titanium Gray. Rasmiy kafolatli.',
    brand: 'Samsung',
    category: 'Phones',
    price: 15200000,
    oldPrice: 16500000,
    discount: 7,
    stock: 7,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
    storage: ['256GB', '512GB'],
    specs: [{ label: 'Holati', value: 'Yangi' }, { label: 'RAM', value: '12GB' }],
  },
  {
    name: 'Samsung Galaxy S24+ 256GB (Yangi)',
    desc: 'QHD+ Display, Exynos 2400 / Snapdragon 8 Gen 3',
    longDesc: 'Samsung Galaxy S24 Plus 256GB Cobalt Violet. Yangi muhrlangan qadoq.',
    brand: 'Samsung',
    category: 'Phones',
    price: 11500000,
    oldPrice: 12500000,
    discount: 8,
    stock: 6,
    image: 'https://images.unsplash.com/photo-1511367461735-48270e90677d?w=400&h=400&fit=crop',
    storage: ['256GB'],
    specs: [{ label: 'Holati', value: 'Yangi' }, { label: 'RAM', value: '12GB' }],
  },
  {
    name: 'Samsung Galaxy A55 5G 128GB (Yangi)',
    desc: 'Metall korpus, IP67 suvdan himoya, 50MP kamera',
    longDesc: 'Samsung Galaxy A55 5G 128GB Iceblue. Zamonviy va chidamli smartfon.',
    brand: 'Samsung',
    category: 'Phones',
    price: 4300000,
    oldPrice: 4700000,
    discount: 8,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop',
    storage: ['128GB'],
    specs: [{ label: 'Holati', value: 'Yangi' }, { label: 'RAM', value: '8GB' }],
  },
  {
    name: 'Xiaomi 14 Ultra 512GB (Yangi)',
    desc: 'Leica kameralar to`plami, Snapdragon 8 Gen 3',
    longDesc: 'Xiaomi 14 Ultra 512GB Black. Professional darajadagi fotoflagman.',
    brand: 'Xiaomi',
    category: 'Phones',
    price: 14200000,
    oldPrice: 15200000,
    discount: 6,
    stock: 4,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop',
    storage: ['512GB'],
    specs: [{ label: 'Holati', value: 'Yangi' }, { label: 'RAM', value: '16GB' }],
  },
  {
    name: 'Redmi Note 13 Pro+ 5G 256GB (Yangi)',
    desc: '200MP OIS kamera, 120W super tezkor zaryad',
    longDesc: 'Redmi Note 13 Pro Plus 256GB Midnight Black. IP68 suvdan himoyalangan.',
    brand: 'Xiaomi',
    category: 'Phones',
    price: 4100000,
    oldPrice: 4500000,
    discount: 8,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop',
    storage: ['256GB'],
    specs: [{ label: 'Holati', value: 'Yangi' }, { label: 'Zaryad', value: '120W' }],
  },
  {
    name: 'Poco F6 Pro 512GB (Yangi)',
    desc: 'Snapdragon 8 Gen 2, WQHD+ 120Hz ekran',
    longDesc: 'Poco F6 Pro 512GB White. O`yinlar va yuqori tezlik uchun maxsus.',
    brand: 'Poco',
    category: 'Phones',
    price: 6100000,
    oldPrice: 6700000,
    discount: 9,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop',
    storage: ['512GB'],
    specs: [{ label: 'Holati', value: 'Yangi' }, { label: 'RAM', value: '12GB' }],
  },
  {
    name: 'Honor Magic 6 Pro 512GB (Yangi)',
    desc: 'Ekrani buzilmas shisha, 180MP periskop telephoto',
    longDesc: 'Honor Magic 6 Pro 512GB Green. Batareya sig`imi va kamerasi boyicha TOP.',
    brand: 'Honor',
    category: 'Phones',
    price: 12500000,
    oldPrice: 13500000,
    discount: 7,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=400&h=400&fit=crop',
    storage: ['512GB'],
    specs: [{ label: 'Holati', value: 'Yangi' }, { label: 'RAM', value: '12GB' }],
  },
];

// Qolgan toifalar uchun mahsulotlar (Elektronika, Aksessuarlar va h.k.)
const generalProducts = [
  {
    name: 'MacBook Pro 14 M3',
    desc: 'Apple M3 chip, 18GB RAM, 512GB SSD',
    category: 'Elektronika',
    brand: 'Apple',
    price: 21000000,
    oldPrice: 22500000,
    discount: 6,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
  },
  {
    name: 'AirPods Pro 2 USB-C',
    desc: 'Shovqinni pasaytiruvchi simsiz quloqchin',
    category: 'Aksessuarlar',
    brand: 'Apple',
    price: 2800000,
    oldPrice: 3200000,
    discount: 12,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  },
  {
    name: 'Apple Watch Series 9 45mm',
    desc: 'Aqlli soat, GPS + Cellular',
    category: 'Aksessuarlar',
    brand: 'Apple',
    price: 4900000,
    oldPrice: 5400000,
    discount: 9,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

    // Eski productlarni o'chiramiz
    await Product.deleteMany({});

    const allProducts = [];

    // Helper: format product record
    const formatProd = (item) => ({
      name: item.name,
      description: item.desc,
      longDescription: item.longDesc || `Bu mahsulot ${item.desc}. O'ziga xos xususiyatlari va kafolatlangan sifati bilan ajralib turadi.`,
      brand: item.brand || 'Brend',
      category: item.category,
      price: item.price,
      oldPrice: item.oldPrice || Math.round(item.price * 1.1),
      discount: item.discount || 10,
      stock: item.stock || 10,
      isActive: true,
      rating: 5,
      reviewsCount: Math.floor(Math.random() * 50) + 5,
      images: [item.image],
      colors: ['#000000', '#FFFFFF'],
      storage: item.storage || ['128GB'],
      specs: item.specs || [{ label: 'Kafolat', value: '1 yil' }],
      quickSpecs: [{ label: 'Holati', value: 'Mavjud' }],
      delivery: { freeDelivery: 'Bepul yetkazib berish', inStock: 'Omborda bor', guaranteed: '100% kafolat' },
    });

    // 1. 5 ta Home appliances
    homeAppliancesProducts.forEach((p) => allProducts.push(formatProd(p)));

    // 2. 10 ta B/U Telefonlar
    buPhoneProducts.forEach((p) => allProducts.push(formatProd(p)));

    // 3. 10 ta Used Phones
    usedPhonesProducts.forEach((p) => allProducts.push(formatProd(p)));

    // 4. 10 ta Yangi (New) Telefonlar
    newPhoneProducts.forEach((p) => allProducts.push(formatProd(p)));

    // 5. Qolgan toifalar
    generalProducts.forEach((p) => allProducts.push(formatProd(p)));

    await Product.insertMany(allProducts);

    console.log(`✅ Jami ${allProducts.length} ta mahsulot saqlandi:`);
    console.log(` - 🏠 Home appliances: ${homeAppliancesProducts.length} ta`);
    console.log(` - 📱 B/U Telefonlar: ${buPhoneProducts.length} ta`);
    console.log(` - 📲 Used Phones: ${usedPhonesProducts.length} ta`);
    console.log(` - 📲 Yangi Telefonlar (Phones): ${newPhoneProducts.length} ta`);
    console.log(` - 📦 Qolgan toifalar: ${generalProducts.length} ta`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Xatolik:', err.message);
    process.exit(1);
  }
})();
