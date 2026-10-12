const router = require('express').Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/upload');
const c = require('../controllers/productController');

// ---- Public (web) ----
router.get('/categories', c.getCategories);
router.get('/', optionalAuth, c.getProducts);
router.get('/:id', optionalAuth, c.getProduct);

// ---- Admin ----
router.post('/', auth, upload.array('images', 5), c.createProduct);
router.put('/:id', auth, upload.array('images', 5), c.updateProduct);
router.delete('/:id', auth, c.deleteProduct);

module.exports = router;
