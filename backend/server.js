require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');

if (!process.env.MONGO_URI) { console.error('.env da MONGO_URI yoq'); process.exit(1); }
if (!process.env.JWT_SECRET) { console.error('.env da JWT_SECRET yoq'); process.exit(1); }

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS sozlamasi: Har qanday frontend (Vercel, localhost, mobil) ulanishi uchun ruxsat berish
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ message: 'Topilmadi' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  if (status === 500) console.error(err);
  const hide = status === 500 && process.env.NODE_ENV === 'production';
  res.status(status).json({ message: hide ? 'Server xatosi' : err.message });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`)))
  .catch((e) => { console.error('DB ulanmadi:', e.message); process.exit(1); });
