const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { removeUpload } = require('../utils/files');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toUrl = (file) => `/uploads/${file.filename}`;
const cleanupFiles = (files) => (files || []).forEach((f) => removeUpload(toUrl(f)));

const fileToImageData = (file) => {
  try {
    const buf = fs.readFileSync(file.path);
    return {
      filename: file.filename,
      data: buf.toString('base64'),
      mime: file.mimetype || 'image/jpeg',
    };
  } catch (e) {
    return null;
  }
};

// multipart da massiv JSON string yoki vergul bilan kelishi mumkin
const toArray = (v) => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v !== 'string' || !v.trim()) return [];
  try {
    const j = JSON.parse(v);
    if (Array.isArray(j)) return j.map(String);
  } catch { /* vergul bilan ajratilgan */ }
  return v.split(',').map((s) => s.trim()).filter(Boolean);
};

const SCALAR = ['name', 'description', 'longDescription', 'brand', 'category'];
const NUMERIC = ['price', 'oldPrice', 'discount', 'stock'];
const LISTS = ['colors', 'storage'];

// GET /api/products  (web + admin)  -> filter, search, sort, pagination
exports.getProducts = async (req, res) => {
  try {
    const { search, category, used, minPrice, maxPrice, inStock, sort, page = 1, limit, all } = req.query;
    const filter = {};

    // admin panel ?all=true yuborsa nofaol mahsulotlar ham chiqadi (token bilan)
    if (!(all === 'true' && req.admin)) filter.isActive = { $ne: false };

    if (search) {
      const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [{ name: rx }, { description: rx }, { brand: rx }];
    }
    if (category) {
      const catTrim = String(category).trim();
      if (/^(used(\s*phones?)?|b\/u(\s*telefonlar)?|ishlatilgan)$/i.test(catTrim)) {
        filter.$or = [
          { category: new RegExp('^b\\/u(\\s*telefonlar)?$', 'i') },
          { category: new RegExp('^used(\\s*phones?)?$', 'i') },
          { category: new RegExp('^phones$', 'i'), used: true },
          { used: true }
        ];
      } else if (/^(home\s*appliances?|elektronika|maishiy\s*texnika)$/i.test(catTrim)) {
        filter.$or = [
          { category: new RegExp('^home\\s*appliances?$', 'i') },
          { category: new RegExp('^elektronika$', 'i') },
          { category: new RegExp('^maishiy\\s*texnika$', 'i') }
        ];
      } else {
        filter.category = new RegExp('^' + escapeRegex(catTrim) + '$', 'i');
      }
    }
    if (used === 'true' || used === true) {
      filter.used = true;
    } else if (used === 'false' || used === false) {
      filter.used = { $ne: true };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && Number.isFinite(Number(minPrice))) filter.price.$gte = Number(minPrice);
      if (maxPrice && Number.isFinite(Number(maxPrice))) filter.price.$lte = Number(maxPrice);
      if (!Object.keys(filter.price).length) delete filter.price;
    }
    if (inStock === 'true') filter.stock = { $gt: 0 };

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
    };
    const sortBy = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = (!limit || limit === 'all' || limit === '0') ? 10000 : Math.max(1, Number(limit) || 10000);

    const [items, total] = await Promise.all([
      Product.find(filter).select('-imagesData').sort(sortBy).skip((pageNum - 1) * limitNum).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: { $ne: false } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id  (single page)
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID notogri' });

    const product = await Product.findById(id).select('-imagesData');
    if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' });

    // oddiy foydalanuvchi nofaol mahsulotni kora olmaydi
    if (product.isActive === false && !req.admin) return res.status(404).json({ message: 'Mahsulot topilmadi' });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: { $ne: false },
    }).select('-imagesData').limit(4);

    res.json({ product, related });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products  (admin)  -> multipart/form-data, rasm maydoni: images
exports.createProduct = async (req, res) => {
  try {
    const b = req.body;
    const price = Number(b.price);
    if (!b.name || !String(b.name).trim() || b.price === undefined || !Number.isFinite(price) || price < 0) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: 'name va price (togri son) majburiy' });
    }
    if (!b.category || !String(b.category).trim()) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: 'category majburiy' });
    }

    const data = {};
    SCALAR.forEach((f) => { if (b[f] !== undefined) data[f] = String(b[f]); });
    NUMERIC.forEach((f) => { if (b[f] !== undefined && b[f] !== '') data[f] = Number(b[f]); });
    LISTS.forEach((f) => { if (b[f] !== undefined) data[f] = toArray(b[f]); });
    data.isActive = b.isActive === undefined ? true : b.isActive === 'true' || b.isActive === true;
    if (b.used !== undefined) {
      data.used = b.used === 'true' || b.used === true;
    } else if (/^(used(\s*phones?)?|b\/u(\s*telefonlar)?)$/i.test(String(b.category || ''))) {
      data.used = true;
    }
    data.images = (req.files || []).map(toUrl);
    data.imagesData = (req.files || []).map(fileToImageData).filter(Boolean);

    const product = await Product.create(data);
    const prodObj = product.toObject();
    delete prodObj.imagesData;
    res.status(201).json(prodObj);
  } catch (err) {
    cleanupFiles(req.files);
    const status = err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: err.message });
  }
};

// PUT /api/products/:id  (admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) { cleanupFiles(req.files); return res.status(400).json({ message: 'ID notogri' }); }

    const product = await Product.findById(id);
    if (!product) { cleanupFiles(req.files); return res.status(404).json({ message: 'Mahsulot topilmadi' }); }

    const b = req.body;
    SCALAR.forEach((f) => { if (b[f] !== undefined) product[f] = String(b[f]); });
    NUMERIC.forEach((f) => { if (b[f] !== undefined && b[f] !== '') product[f] = Number(b[f]); });
    LISTS.forEach((f) => { if (b[f] !== undefined) product[f] = toArray(b[f]); });
    if (b.isActive !== undefined) product.isActive = b.isActive === 'true' || b.isActive === true;
    if (b.used !== undefined) {
      product.used = b.used === 'true' || b.used === true;
    } else if (b.category && /^(used(\s*phones?)?|b\/u(\s*telefonlar)?)$/i.test(String(b.category))) {
      product.used = true;
    }

    // ochirilishi kerak bolgan eski rasmlar: removeImages = ["/uploads/a.jpg", ...]
    const toRemove = toArray(b.removeImages);
    if (toRemove.length) {
      const own = toRemove.filter((img) => product.images.includes(img));
      product.images = product.images.filter((img) => !own.includes(img));
      own.forEach(removeUpload);
    }

    if (req.files && req.files.length) {
      product.images.push(...req.files.map(toUrl));
      if (!product.imagesData) product.imagesData = [];
      product.imagesData.push(...req.files.map(fileToImageData).filter(Boolean));
    }

    await product.save();
    const prodObj = product.toObject();
    delete prodObj.imagesData;
    res.json(prodObj);
  } catch (err) {
    cleanupFiles(req.files);
    const status = err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: err.message });
  }
};

// DELETE /api/products/:id  (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID notogri' });

    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' });

    product.images.forEach(removeUpload);
    res.json({ message: 'Mahsulot ochirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
