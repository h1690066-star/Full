const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema(
  {
    heroSlides: [
      {
        id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
        badge: { type: String, default: '' },
        title: { type: String, default: '' },
        text: { type: String, default: '' },
        cta: { type: String, default: 'Batafsil' },
        href: { type: String, default: '/catalog' },
        image: { type: String, default: '/images/hero/hero-1.png' },
        align: { type: String, default: 'center' }
      }
    ],
    quickCards: [
      {
        id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
        title: { type: String, default: '' },
        sub: { type: String, default: '' },
        href: { type: String, default: '/catalog' }
      }
    ],
    contact: {
      phone: { type: String, default: '+998 95 081 38 09' },
      workHours: { type: String, default: '09:00 - 21:00' },
      address: { type: String, default: 'Toshkent sh., Chilonzor tumani' },
      telegram: { type: String, default: 'https://t.me/xonbozor' },
      instagram: { type: String, default: 'https://www.instagram.com/xon.bazzar?igsh=aHRhbXNpa3R6OTg4&utm_source=qr' },
      youtube: { type: String, default: 'https://www.youtube.com/@Xonbazar' },
      email: { type: String, default: 'info@xonbozor.uz' }
    },
    perks: [
      {
        id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
        text: { type: String, default: '' }
      }
    ],
    promo: {
      tag: { type: String, default: 'Eksklyuziv' },
      title: { type: String, default: 'iPhone 18 Pro' },
      text: { type: String, default: 'Xon Bozorda — 0% muddatli to\'lov' },
      cta: { type: String, default: 'Batafsil' },
      href: { type: String, default: '/catalog/iphone' }
    },
    announcement: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: '🔥 Xon Bozor do\'koniga xush kelibsiz! Barcha mahsulotlarga kafolat beriladi.' }
    },
    lastPushedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'admin' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', SiteContentSchema);
