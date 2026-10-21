const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { normPhone, emailRx } = require('../utils/validators');
const { removeUpload } = require('../utils/files');

const sign = (user) =>
  jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '7d',
  });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  phone: u.phone || null,
  email: u.email || null,
  avatar: u.avatar || null,
  createdAt: u.createdAt,
});

const avatarUrl = (file) => (file ? `/uploads/${file.filename}` : undefined);

const fileToAvatarData = (file) => {
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

// Xatolik bo'lsa yuklangan rasmni ham o'chirib tashlaydi
const fail = (req, res, status, message) => {
  if (req.file) removeUpload(avatarUrl(req.file));
  return res.status(status).json({ message });
};

// POST /api/users/register   multipart/form-data yoki JSON: { name, email, password, avatar(fayl), phone? }
exports.register = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const { phone, email } = req.body;
    const password = String(req.body.password || '');

    if (name.length < 2) return fail(req, res, 400, 'Ism kamida 2 ta belgi bolsin');
    if (!email || !emailRx.test(String(email))) return fail(req, res, 400, 'Email notogri');
    if (password.length < 6) return fail(req, res, 400, 'Parol kamida 6 ta belgi bolsin');

    const data = { name, email: String(email).toLowerCase().trim(), password };
    if (req.file) {
      data.avatar = avatarUrl(req.file);
      data.avatarData = fileToAvatarData(req.file);
    }

    if (phone) {
      const p = normPhone(phone);
      if (!p) return fail(req, res, 400, 'Telefon raqam notogri');
      data.phone = p;
    }

    const or = [{ email: data.email }];
    if (data.phone) or.push({ phone: data.phone });
    if (await User.findOne({ $or: or })) {
      return fail(req, res, 400, 'Bu email yoki telefon bilan royxatdan otilgan. Kirish bolimidan foydalaning');
    }

    const user = await User.create(data);
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) return fail(req, res, 400, 'Bu telefon yoki email band');
    fail(req, res, 500, err.message);
  }
};

// POST /api/users/login   body: { email yoki login (telefon/email), password }
exports.login = async (req, res) => {
  try {
    const password = String(req.body.password || '');
    const login = String(req.body.login || req.body.email || '');
    if (!login || !password) return res.status(400).json({ message: 'Email va parolni kiriting' });

    const query = login.includes('@')
      ? { email: login.toLowerCase().trim() }
      : { phone: normPhone(login) };

    if (!query.email && !query.phone) return res.status(400).json({ message: 'Email yoki parol xato' });

    const user = await User.findOne(query).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Email yoki parol xato' });
    }
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/me
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me   multipart: { name, phone, email, avatar(fayl), removeAvatar: "true" }
exports.updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return fail(req, res, 404, 'Foydalanuvchi topilmadi');

    const { phone, email, removeAvatar } = req.body;
    if (req.body.name !== undefined && String(req.body.name).trim() !== '') {
      const name = String(req.body.name).trim();
      if (name.length < 2) return fail(req, res, 400, 'Ism kamida 2 ta belgi bolsin');
      user.name = name;
    }
    if (phone && String(phone).trim() !== '') {
      const p = normPhone(phone);
      if (!p) return fail(req, res, 400, 'Telefon raqam notogri');
      user.phone = p;
    }
    if (email && String(email).trim() !== '') {
      if (!emailRx.test(String(email))) return fail(req, res, 400, 'Email notogri');
      user.email = String(email).toLowerCase().trim();
    }

    const oldAvatar = user.avatar;
    if (req.file) {
      user.avatar = avatarUrl(req.file);
      user.avatarData = fileToAvatarData(req.file);
    } else if (removeAvatar === 'true') {
      user.avatar = '';
      user.avatarData = null;
    }

    await user.save();
    if (oldAvatar && oldAvatar !== user.avatar) removeUpload(oldAvatar);
    res.json(publicUser(user));
  } catch (err) {
    if (err.code === 11000) return fail(req, res, 400, 'Bu telefon yoki email band');
    fail(req, res, 500, err.message);
  }
};

// PUT /api/users/password   body: { oldPassword, newPassword }
exports.changePassword = async (req, res) => {
  try {
    const newPassword = String(req.body.newPassword || '');
    if (newPassword.length < 6) return res.status(400).json({ message: 'Yangi parol kamida 6 ta belgi bolsin' });

    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.comparePassword(req.body.oldPassword))) {
      return res.status(400).json({ message: 'Eski parol xato' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Parol ozgartirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users   (admin) -> mijozlar royxati + real buyurtmalar tarixi bilan
exports.listUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 100 } = req.query;
    const Order = require('../models/Order');
    const [usersRaw, ordersRaw] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }).lean(),
      Order.find({}).select('-receiptData').sort({ createdAt: -1 }).lean(),
    ]);

    const normDigits = (p) => String(p || '').replace(/\D/g, '').slice(-9);

    const enriched = (usersRaw || []).map((u) => {
      const uid = String(u._id);
      const uPhone = normDigits(u.phone);
      const uName = String(u.name || '').trim().toLowerCase();

      const matchedOrders = (ordersRaw || []).filter((o) => {
        if (o.user && String(o.user) === uid) return true;
        const oPhone = normDigits(o.customer?.phone || o.address?.phone);
        if (uPhone && oPhone && uPhone === oPhone) return true;
        const oName = String(o.customer?.name || '').trim().toLowerCase();
        if (uName && oName && uName.length > 2 && uName === oName) return true;
        return false;
      });

      const validOrders = matchedOrders.filter(
        (o) => o.status !== 'cancelled' && o.status !== 'Bekor qilingan'
      );

      const totalSpent = validOrders.reduce((s, o) => {
        let t = Number(o.total) || 0;
        if (!t && Array.isArray(o.items)) {
          t = o.items.reduce(
            (is, it) => is + (Number(it.price) || 0) * (Number(it.qty || it.quantity) || 1),
            0
          );
        }
        return s + t;
      }, 0);

      const lastOrder = matchedOrders[0] || null;
      const lastAddress = lastOrder?.address?.text
        ? `${lastOrder.address.title ? lastOrder.address.title + ' — ' : ''}${lastOrder.address.text}`
        : 'Toshkent sh., Yetkazib berish manzili';

      return {
        id: uid,
        _id: uid,
        name: u.name || 'Mijoz',
        phone: u.phone || lastOrder?.customer?.phone || lastOrder?.address?.phone || null,
        email: u.email || null,
        avatar: u.avatar || null,
        createdAt: u.createdAt,
        ordersCount: matchedOrders.length,
        activeOrdersCount: validOrders.length,
        totalSpent: Math.round(totalSpent),
        avgCheck: validOrders.length > 0 ? Math.round(totalSpent / validOrders.length) : 0,
        lastActive: lastOrder?.createdAt || u.createdAt,
        lastAddress,
        isVip: matchedOrders.length >= 2 || totalSpent >= 10000000,
        orderHistory: matchedOrders.slice(0, 10).map((o) => ({
          id: String(o._id),
          _id: String(o._id),
          orderNumber: o.orderNumber || `XB-${String(o._id).slice(-6)}`,
          status: o.status || 'new',
          total: Number(o.total) || 0,
          itemsCount: Array.isArray(o.items)
            ? o.items.reduce((s, i) => s + (Number(i.qty || i.quantity) || 1), 0)
            : 1,
          items: o.items || [],
          createdAt: o.createdAt,
        })),
      };
    });

    const q = search ? String(search).trim().toLowerCase() : '';
    const filtered = q
      ? enriched.filter(
          (u) =>
            String(u.name || '').toLowerCase().includes(q) ||
            String(u.phone || '').toLowerCase().includes(q) ||
            String(u.email || '').toLowerCase().includes(q)
        )
      : enriched;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 100));
    const paged = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      items: paged,
      users: paged,
      total: filtered.length,
      page: pageNum,
      pages: Math.max(1, Math.ceil(filtered.length / limitNum)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
