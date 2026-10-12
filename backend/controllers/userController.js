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
    if (req.file) data.avatar = avatarUrl(req.file);

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
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (name.length < 2) return fail(req, res, 400, 'Ism kamida 2 ta belgi bolsin');
      user.name = name;
    }
    if (phone) {
      const p = normPhone(phone);
      if (!p) return fail(req, res, 400, 'Telefon raqam notogri');
      user.phone = p;
    }
    if (email) {
      if (!emailRx.test(String(email))) return fail(req, res, 400, 'Email notogri');
      user.email = String(email).toLowerCase().trim();
    }

    const oldAvatar = user.avatar;
    if (req.file) user.avatar = avatarUrl(req.file);
    else if (removeAvatar === 'true') user.avatar = '';

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

// GET /api/users   (admin) -> mijozlar royxati, ?search=&page=&limit=
exports.listUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      const rx = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { phone: rx }, { email: rx }];
    }
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      User.countDocuments(filter),
    ]);
    res.json({ items: items.map(publicUser), total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
