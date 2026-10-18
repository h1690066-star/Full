const router = require('express').Router();
const auth = require('../middleware/auth');
const siteController = require('../controllers/siteController');

// GET /api/site-content - ochiq, sayt foydalanuvchilari uchun
router.get('/', siteController.getSiteContent);

// PUT /api/site-content - faqat admin tahrirlashi mumkin
router.put('/', auth, siteController.updateSiteContent);

module.exports = router;

