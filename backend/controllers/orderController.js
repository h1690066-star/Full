const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { SHIPPING } = require('../config/shop');
const crypto = require('crypto');
const tg = require('../services/telegram');
const { normPhone } = require('../utils/validators');
const receiptDir = require('../middleware/uploadReceipt').dir;

const rmReceipt = (file) => file && fs.unlink(path.join(receiptDir, file.filename || file), () => {});
const parse = (v) => { if (typeof v !== 'string') return v; try { return JSON.parse(v); } catch { return null; } };
const money = (n) => `$${Number(n).toFixed(2).replace(/\.00$/, '')}`;
const usdRate = () => Number(process.env.USD_RATE) || 12700;
const sum = (n) => Math.round(n * usdRate()).toLocaleString('ru-RU');

const newNumber = () =>
  'XB-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 36).toString(36).toUpperCase();

// GET /api/orders/payment-info
exports.paymentInfo = (req, res) => {
  res.json({
    card: process.env.PAYMENT_CARD || '',
    holder: process.env.PAYMENT_HOLDER || '',
    usdRate: usdRate(),
  });
};

const publicOrder = (o) => ({
  id: o._id,
  orderNumber: o.orderNumber,
  items: o.items,
  address: o.address,
  customer: o.customer,
  shipping: o.shipping,
  subtotal: o.subtotal,
  discount: o.discount,
  tax: o.tax,
  handling: o.handling,
  total: o.total,
  paymentMethod: o.paymentMethod,
  status: o.status,
  createdAt: o.createdAt,
});

// POST /api/orders
// Supports both authenticated and guest orders!
exports.create = async (req, res) => {
  const reserved = []; // [{ id, qty }]
  const rollback = () => Promise.all(reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));
  const bad = (msg, status = 400) => { rmReceipt(req.file); return res.status(status).json({ message: msg }); };

  try {
    const rawItems = parse(req.body.items);
    const address = parse(req.body.address) || {};
    const customerInfo = parse(req.body.customerInfo) || {};

    if (!Array.isArray(rawItems) || !rawItems.length) return bad('Savat bo\'sh');

    const customerName = (customerInfo.name || address.title || address.name || 'Mijoz').trim();
    const rawPhone = customerInfo.phone || address.phone || '';
    const phone = normPhone(rawPhone) || rawPhone;
    if (!phone) return bad('Telefon raqamingizni kiriting');

    const fullAddressText = [
      customerInfo.region || address.region,
      customerInfo.district || address.district,
      customerInfo.street || address.street,
      address.text
    ].filter(Boolean).join(', ') || 'Manzil ko\'rsatilmagan';

    // 1. Foydalanuvchini topish yoki yangi mehmon foydalanuvchi yaratish (Mijozlar bo'limida ko'rinishi uchun)
    let userDoc = null;
    if (req.user && req.user.id) {
      userDoc = await User.findById(req.user.id);
    }
    if (!userDoc && phone) {
      try {
        userDoc = await User.findOne({ phone });
        if (!userDoc) {
          userDoc = await User.create({
            name: customerName,
            phone: phone,
            password: crypto.randomBytes(8).toString('hex'),
          });
        }
      } catch (userErr) {
        console.warn('User find/create error during checkout:', userErr.message);
      }
    }

    // 2. Mahsulotlarni yig'ish va tekshirish
    const lines = [];
    for (const it of rawItems) {
      const qty = Math.max(1, Number(it && it.qty) || 1);
      const isMongoId = it && it.id && mongoose.isValidObjectId(it.id);

      let foundProduct = null;
      if (isMongoId) {
        foundProduct = await Product.findById(it.id);
      }

      if (foundProduct) {
        // DB mahsuloti
        if (foundProduct.stock >= qty) {
          await Product.updateOne({ _id: foundProduct._id }, { $inc: { stock: -qty } });
          reserved.push({ id: foundProduct._id, qty });
        }
        lines.push({
          product: foundProduct._id,
          productId: String(foundProduct._id),
          name: foundProduct.name,
          price: foundProduct.price,
          qty,
          image: foundProduct.images?.[0] || it.image || ''
        });
      } else {
        // Tashqi yoki katalog mahsuloti
        lines.push({
          product: null,
          productId: String(it.id || ''),
          name: it.name || 'Mahsulot',
          price: Number(it.price) || 0,
          qty,
          image: it.image || ''
        });
      }
    }

    // Narxlarni hisoblash
    const subtotal = lines.reduce((acc, l) => acc + (l.price * l.qty), 0);
    const shipId = (req.body.shipId && SHIPPING[req.body.shipId]) ? req.body.shipId : 'free';
    const shipLabel = SHIPPING[shipId] ? SHIPPING[shipId].label : "Toshkent bo'yicha yetkazib berish";
    const shipPrice = SHIPPING[shipId] ? SHIPPING[shipId].price : 0;
    const total = Number(req.body.total) || (subtotal + shipPrice);

    // Chek rasmi
    let receiptBase64 = '';
    let receiptMimeType = req.file ? (req.file.mimetype || 'image/jpeg') : '';
    let receiptFilename = req.file ? req.file.filename : '';

    if (req.file) {
      try {
        const fileBuf = await fs.promises.readFile(path.join(receiptDir, req.file.filename));
        receiptBase64 = fileBuf.toString('base64');
      } catch (readErr) {
        console.warn('Receipt buffer read warning:', readErr.message);
      }
    } else if (req.body.receiptData) {
      receiptBase64 = String(req.body.receiptData).replace(/^data:image\/\w+;base64,/, '');
      receiptMimeType = req.body.receiptMime || 'image/jpeg';
      receiptFilename = `receipt-${Date.now()}.jpg`;
    }

    // 3. Buyurtmani bazada yaratish
    const order = await Order.create({
      orderNumber: newNumber(),
      user: userDoc ? userDoc._id : null,
      customer: {
        name: customerName,
        phone: phone,
        telegram: customerInfo.telegram || '',
        notes: customerInfo.notes || ''
      },
      items: lines,
      address: {
        title: customerInfo.region || address.title || 'Toshkent',
        text: fullAddressText,
        phone: phone,
        region: customerInfo.region || '',
        district: customerInfo.district || '',
        street: customerInfo.street || '',
        lat: Number(address.lat) || null,
        lon: Number(address.lon) || null,
      },
      shipping: {
        id: shipId,
        label: shipLabel,
        price: shipPrice,
        date: String(req.body.shipDate || '')
      },
      promoCode: String(req.body.promo || '').trim(),
      subtotal,
      discount: 0,
      tax: 0,
      handling: 0,
      total,
      paymentMethod: req.body.paymentMethod || 'card',
      receipt: receiptFilename,
      receiptData: receiptBase64,
      receiptMime: receiptMimeType,
      status: 'new'
    });

    // 4. Telegramga yuborish (Xato bo'lsa ham buyurtma muvaffaqiyatli qoladi)
    try {
      const e = tg.esc;
      const rows = lines.map((l, i) => `${i + 1}. ${e(l.name)} × ${l.qty} = <b>${l.price.toLocaleString('uz-UZ')} so'm</b>`).join('\n');
      const text =
        `🛒 <b>Yangi buyurtma: ${order.orderNumber}</b>\n\n` +
        `👤 <b>Mijoz:</b> ${e(customerName)}\n` +
        `📞 <b>Telefon:</b> ${e(phone)}\n` +
        (customerInfo.telegram ? `✈️ <b>Telegram:</b> ${e(customerInfo.telegram)}\n` : '') +
        `📍 <b>Manzil:</b> ${e(fullAddressText)}\n` +
        `💳 <b>To'lov usuli:</b> ${order.paymentMethod === 'card' ? 'Plastik karta orqali' : 'Naqd to\'lov'}\n\n` +
        `📦 <b>Mahsulotlar:</b>\n${rows}\n\n` +
        `💰 <b>JAMI: ${order.total.toLocaleString('uz-UZ')} so'm</b>\n` +
        (order.receipt ? `🧾 <b>To'lov cheki ilova qilingan</b>` : `⏳ <b>Chek yuklanmagan</b>`);

      const msg = await tg.sendMessage(text);
      if (req.file) {
        await tg.sendPhoto(path.join(receiptDir, req.file.filename), `🧾 Chek — ${order.orderNumber}`, msg.message_id);
      }
      order.telegramSent = true;
      await order.save();
    } catch (tgErr) {
      console.warn('Telegram send notice error:', tgErr.message);
    }

    res.status(201).json(publicOrder(order));
  } catch (err) {
    console.error('Order create error:', err);
    await rollback().catch(() => {});
    rmReceipt(req.file);
    res.status(500).json({ message: 'Buyurtmani qabul qilishda xatolik yuz berdi: ' + err.message });
  }
};

// GET /api/orders/my
exports.my = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.json([]);
    }
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100);
    res.json(orders.map(publicOrder));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---- Admin ----
// GET /api/orders?status=&page=&limit=
exports.listAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status && status !== 'all' ? { status: String(status) } : {};
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

    const [rawItems, total] = await Promise.all([
      Order.find(filter)
        .select('-receiptData')
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    // Mijoz ma'lumotlarini har qanday holatda ham to'liq ko'rinishini ta'minlash
    const items = rawItems.map((o) => {
      const doc = o.toObject();
      if (!doc.user) {
        doc.user = {
          name: doc.customer?.name || doc.address?.title || 'Mijoz',
          phone: doc.customer?.phone || doc.address?.phone || '-',
          email: ''
        };
      }
      return doc;
    });

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error('listAll orders error:', err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/:id/status
exports.setStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body.status || '');
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID notogri' });
    if (!['new', 'confirmed', 'delivered', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Status notogri' });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Buyurtma topilmadi' });

    if (status === 'cancelled' && order.status !== 'cancelled') {
      await Promise.all(
        order.items
          .filter((i) => i.product)
          .map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } }))
      );
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id/receipt (admin) -> chek rasmi
exports.receipt = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID notogri' });
    const order = await Order.findById(req.params.id);
    if (!order || (!order.receipt && !order.receiptData)) return res.status(404).json({ message: 'Chek topilmadi' });

    const localPath = order.receipt ? path.join(receiptDir, path.basename(order.receipt)) : null;
    if (localPath && fs.existsSync(localPath)) {
      return res.sendFile(localPath);
    }

    if (order.receiptData) {
      const imgBuffer = Buffer.from(order.receiptData, 'base64');
      res.setHeader('Content-Type', order.receiptMime || 'image/jpeg');
      res.setHeader('Content-Length', imgBuffer.length);
      return res.send(imgBuffer);
    }

    res.status(404).json({ message: 'Chek fayli serverda topilmadi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
