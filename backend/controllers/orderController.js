const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { SHIPPING } = require('../config/shop');
const { computeTotals } = require('../services/pricing');
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
  shipping: o.shipping,
  subtotal: o.subtotal, discount: o.discount, tax: o.tax, handling: o.handling, total: o.total,
  status: o.status,
  createdAt: o.createdAt,
});

// POST /api/orders   (mijoz tokeni)  multipart/form-data:
//   items = JSON [{ id, qty }], address = JSON { title, text, phone, lat?, lon? },
//   shipId = free|fast|sched, shipDate?, promo?, receipt = chek rasmi (majburiy)
exports.create = async (req, res) => {
  const reserved = []; // [{ id, qty }] — xato bo'lsa stock qaytariladi
  let orderCreated = false;
  const rollback = () => Promise.all(reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));
  const bad = (msg, status = 400) => { rmReceipt(req.file); return res.status(status).json({ message: msg }); };

  try {
    if (!req.file) return bad("To'lov chekini (screenshot) yuklang");

    const rawItems = parse(req.body.items);
    const address = parse(req.body.address);
    if (!Array.isArray(rawItems) || !rawItems.length || rawItems.length > 50) return bad('Savat bosh');
    if (!address || typeof address !== 'object' || String(address.text || '').trim().length < 5) return bad('Manzilni kiriting');
    const phone = normPhone(address.phone);
    if (!phone) return bad('Telefon raqamni togri kiriting (masalan +998901234567)');

    // bir xil mahsulotni birlashtiramiz, qty ni tekshiramiz
    const qtyById = new Map();
    for (const it of rawItems) {
      const qty = Number(it && it.qty);
      if (!it || !mongoose.isValidObjectId(it.id) || !Number.isInteger(qty) || qty < 1 || qty > 99) return bad('Savatdagi mahsulot notogri');
      qtyById.set(String(it.id), (qtyById.get(String(it.id)) || 0) + qty);
    }

    // Narxlar DB dan olinadi (frontend yuborgan narxga ishonilmaydi)
    const products = await Product.find({ _id: { $in: [...qtyById.keys()] } });
    if (products.length !== qtyById.size) return bad('Savatdagi ayrim mahsulotlar topilmadi');

    for (const p of products) {
      if (p.isActive === false) return bad(`"${p.name}" hozir sotuvda yoq`);
      if (p.stock < qtyById.get(String(p._id))) return bad(`"${p.name}" omborda yetarli emas (qolgan: ${p.stock})`);
    }

    const user = await User.findById(req.user.id);
    if (!user) return bad('Foydalanuvchi topilmadi', 404);

    // stock ni atomik band qilamiz
    for (const p of products) {
      const qty = qtyById.get(String(p._id));
      const r = await Product.updateOne({ _id: p._id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
      if (!r.modifiedCount) { await rollback(); return bad(`"${p.name}" ayni paytda tugab qoldi`); }
      reserved.push({ id: p._id, qty });
    }

    const lines = products.map((p) => ({ product: p._id, name: p.name, price: p.price, qty: qtyById.get(String(p._id)), image: p.images?.[0] || '' }));
    const shipId = SHIPPING[req.body.shipId] ? req.body.shipId : 'free';
    const t = computeTotals(lines, req.body.promo, shipId);

    const lat = Number(address.lat), lon = Number(address.lon);
    const hasGeo = address.lat != null && address.lon != null && Number.isFinite(lat) && Number.isFinite(lon);
    let receiptBase64 = '';
    let receiptMimeType = req.file.mimetype || 'image/jpeg';
    try {
      const fileBuf = await fs.promises.readFile(path.join(receiptDir, req.file.filename));
      receiptBase64 = fileBuf.toString('base64');
    } catch (readErr) {
      console.warn('Receipt buffer read warning:', readErr.message);
    }

    const order = await Order.create({
      orderNumber: newNumber(),
      user: user._id,
      items: lines,
      address: {
        title: String(address.title || '').slice(0, 60),
        text: String(address.text).trim().slice(0, 300),
        phone,
        ...(hasGeo ? { lat, lon } : {}),
      },
      shipping: { id: shipId, label: SHIPPING[shipId].label, price: t.shipPrice, date: String(req.body.shipDate || '').slice(0, 30) },
      promoCode: t.promoApplied ? String(req.body.promo).trim().toLowerCase() : '',
      subtotal: t.subtotal, discount: t.discount, tax: t.tax, handling: t.handling, total: t.total,
      receipt: req.file.filename,
      receiptData: receiptBase64,
      receiptMime: receiptMimeType,
    });
    orderCreated = true;

    // ---- Telegram (xato bo'lsa ham buyurtma saqlanadi) ----
    try {
      const e = tg.esc;
      const rows = lines.map((l, i) => `${i + 1}. ${e(l.name)} × ${l.qty} = <b>${money(l.price * l.qty)}</b>`).join('\n');
      const map = order.address.lat != null ? `\n🗺 <a href="https://www.google.com/maps?q=${order.address.lat},${order.address.lon}">Xaritada ochish</a>` : '';
      const text =
        `🛒 <b>Yangi buyurtma: ${order.orderNumber}</b>\n\n` +
        `👤 <b>Ismi:</b> ${e(user.name)}\n` +
        `📞 <b>Nomeri:</b> ${e(phone)}\n` +
        `📧 <b>Email:</b> ${e(user.email || 'Kiritilmagan')}\n\n` +
        `📍 <b>Manzili:</b> ${e(order.address.title)} ${e(order.address.text)}${map}\n` +
        `🚚 <b>Yetkazib berish:</b> ${e(order.shipping.label)}${order.shipping.date ? ' — ' + e(order.shipping.date) : ''}\n\n` +
        `📦 <b>Mahsulotlar:</b>\n${rows}\n\n` +
        `Subtotal: ${money(t.subtotal)}\n` +
        (t.discount ? `Chegirma (${e(order.promoCode)}): -${money(t.discount)}\n` : '') +
        `Soliq: ${money(t.tax)}\nHandling: ${money(t.handling)}\nYetkazish: ${money(t.shipPrice)}\n` +
        `💰 <b>JAMI: ${money(t.total)}</b> (~${sum(t.total)} so'm)\n\n` +
        `💳 <b>To'lov:</b> Karta o'tkazmasi (${e(process.env.PAYMENT_CARD || '')})\n` +
        `🖼 <b>Chek rasmi:</b> Keyingi xabarda yuborildi 👇`;
      const msg = await tg.sendMessage(text);
      if (req.file) {
        await tg.sendPhoto(path.join(receiptDir, req.file.filename), `🧾 Chek rasmi — ${order.orderNumber}`, msg.message_id);
      }
      order.telegramSent = true;
      await order.save();
    } catch (err) {
      console.error('Telegramga yuborilmadi:', err.message);
    }

    res.status(201).json(publicOrder(order));
  } catch (err) {
    if (!orderCreated) {
      await rollback().catch(() => {});
      rmReceipt(req.file);
    }
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/my
exports.my = async (req, res) => {
  try {
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
    const filter = status ? { status: String(status) } : {};
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const [items, total] = await Promise.all([
      Order.find(filter).select('-receiptData').populate('user', 'name email phone').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Order.countDocuments(filter),
    ]);
    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/:id/status  body: { status }   (bekor qilinsa stock qaytariladi)
exports.setStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body.status || '');
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID notogri' });
    if (!['new', 'confirmed', 'delivered', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Status notogri' });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Buyurtma topilmadi' });

    if (status === 'cancelled' && order.status !== 'cancelled') {
      await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));
    } else if (order.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ message: 'Bekor qilingan buyurtmani qayta ochib bolmaydi' });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id/receipt  (admin) -> chek rasmi
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
