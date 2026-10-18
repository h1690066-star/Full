const SiteContent = require('../models/SiteContent');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const DEFAULT_CONTENT = {
  heroSlides: [
    {
      id: 'slide-1',
      badge: 'Eksklyuziv premyera',
      title: 'Yangi iPhone 18 Pro - Xon Bozorda!',
      text: "Kutilgan titan korpus, eng so'nggi A20 chip va maxsus muddatli to'lov shartlari bilan.",
      cta: 'Hozir xarid qiling',
      href: '/catalog/phones',
      image: '/images/hero/hero-1.png',
      align: 'center'
    },
    {
      id: 'slide-2',
      badge: 'Yangi ranglar',
      title: 'iPhone 18 - uchta yangi rang',
      text: "Binafsha, mis va to'q qizil. Original kafolat va 0% muddatli to'lov.",
      cta: 'Batafsil',
      href: '/catalog/iphone',
      image: '/images/hero/hero-2.png',
      align: 'center'
    },
    {
      id: 'slide-3',
      badge: 'Maxsus taklif',
      title: 'Uy uchun zamonaviy maishiy texnikalar',
      text: 'Muzlatgichlar, konditsionerlar va zamonaviy oshxona anjomlari qulay narxlarda.',
      cta: "Katalogga o'tish",
      href: '/catalog/appliances',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&h=600&fit=crop',
      align: 'center'
    }
  ],
  quickCards: [
    { id: 'q-1', title: 'Yangi telefonlar', sub: 'Kafolatli va yangi', href: '/catalog/phones' },
    { id: 'q-2', title: 'B/U telefonlar', sub: "Tekshirilgan a'lo holat", href: '/catalog/used' },
    { id: 'q-3', title: 'Aksessuarlar', sub: 'Chexol, oyna, quvvatlagich', href: '/catalog/accessories' },
    { id: 'q-4', title: 'Maishiy texnika', sub: 'Uy qulayligi uchun', href: '/catalog/appliances' }
  ],
  contact: {
    phone: '+998 95 081 38 09',
    workHours: '09:00 - 21:00',
    address: 'Toshkent sh., Chilonzor tumani',
    telegram: 'https://t.me/xonbozor',
    instagram: 'https://www.instagram.com/xon.bazzar?igsh=aHRhbXNpa3R6OTg4&utm_source=qr',
    youtube: 'https://www.youtube.com/@Xonbazar',
    email: 'info@xonbozor.uz'
  },
  perks: [
    { id: 'p-1', text: "0% muddatli to'lov" },
    { id: 'p-2', text: 'Rasmiy kafolat' },
    { id: 'p-3', text: "Toshkent bo'ylab 2 soatda" }
  ],
  sections: {
    productsTitle: 'Mahsulotlar',
    allLabel: "Barchasini ko'rish",
    categoriesTitle: 'Kategoriyalar',
    categoriesSub: "Kerakli bo'limni tez toping",
    footerAbout: "O'zbekistonda original smartfonlar, noutbuklar va eng so'nggi maishiy texnikaning ishonchli do'koni. Rasmiy kafolat va tezkor yetkazib berish."
  },
  promo: {
    tag: 'Eksklyuziv',
    title: 'iPhone 18 Pro',
    text: "Hoxlagan narsa Xon Bozorda — 0% muddatli to'lov",
    cta: 'Batafsil',
    href: '/catalog/iphone'
  },
  announcement: {
    enabled: true,
    text: "🔥 Xon Bozor do'koniga xush kelibsiz! Barcha mahsulotlarga kafolat beriladi."
  }
};

// GET /api/site-content (Public)
exports.getSiteContent = async (req, res) => {
  try {
    let content = await SiteContent.findOne().sort({ createdAt: -1 });
    if (!content) {
      content = await SiteContent.create(DEFAULT_CONTENT);
    }
    res.json(content);
  } catch (err) {
    console.error('getSiteContent error:', err);
    res.status(500).json({ message: 'Sayt ma\'lumotlarini yuklashda xatolik', error: err.message, default: DEFAULT_CONTENT });
  }
};

// PUT /api/site-content (Admin protected)
exports.updateSiteContent = async (req, res) => {
  try {
    const { heroSlides, quickCards, contact, perks, sections, promo, announcement, doGitPush } = req.body;

    let content = await SiteContent.findOne().sort({ createdAt: -1 });
    if (!content) {
      content = new SiteContent(DEFAULT_CONTENT);
    }

    if (heroSlides) content.heroSlides = heroSlides;
    if (quickCards) content.quickCards = quickCards;
    if (contact) content.contact = { ...content.contact, ...contact };
    if (perks) content.perks = perks;
    if (sections) content.sections = { ...content.sections, ...sections };
    if (promo) content.promo = { ...content.promo, ...promo };
    if (announcement) content.announcement = { ...content.announcement, ...announcement };

    content.lastPushedAt = new Date();
    content.updatedBy = req.admin?.email || 'admin';

    await content.save();

    // Sinxronizatsiya: fayl tizimiga siteContent.json yozish
    try {
      const repoRoot = path.resolve(__dirname, '..', '..');
      const jsonPath = path.join(repoRoot, 'xon-bozor', 'lib', 'siteContent.json');
      if (fs.existsSync(path.dirname(jsonPath))) {
        fs.writeFileSync(jsonPath, JSON.stringify(content.toObject(), null, 2), 'utf-8');
      }
    } catch (fsErr) {
      console.warn('siteContent.json write warning:', fsErr.message);
    }

    let gitOutput = null;
    let gitSuccess = false;

    // Agar git push so'ralgan bo'lsa
    if (doGitPush) {
      try {
        const repoRoot = path.resolve(__dirname, '..', '..');
        await new Promise((resolve) => {
          exec('git add . && git commit -m "Auto-update site content from admin panel" && git push origin main', { cwd: repoRoot, timeout: 25000 }, (error, stdout, stderr) => {
            if (error) {
              gitOutput = stderr || error.message;
              gitSuccess = false;
            } else {
              gitOutput = stdout;
              gitSuccess = true;
            }
            resolve();
          });
        });
      } catch (e) {
        gitOutput = e.message;
      }
    }

    res.json({
      success: true,
      message: "Sayt ma'lumotlari muvaffaqiyatli saqlandi va jonli efirga chiqarildi!",
      content,
      gitPushed: gitSuccess,
      gitDetails: gitOutput,
      vercelUrl: "https://xonbozoruz.vercel.app/"
    });
  } catch (err) {
    console.error('updateSiteContent error:', err);
    res.status(500).json({ message: 'Saqlashda xatolik yuz berdi', error: err.message });
  }
};
