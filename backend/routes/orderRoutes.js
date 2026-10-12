const router = require('express').Router();
const auth = require('../middleware/auth');
const userAuth = require('../middleware/userAuth');
const { orderLimiter } = require('../middleware/rateLimit');
const uploadReceipt = require('../middleware/uploadReceipt');
const c = require('../controllers/orderController');

// ---- Web (mijoz) ----
router.get('/payment-info', c.paymentInfo);
router.post('/', userAuth, orderLimiter, uploadReceipt.single('receipt'), c.create);
router.get('/my', userAuth, c.my);

// ---- Admin ----
router.get('/', auth, c.listAll);
router.get('/:id/receipt', auth, c.receipt);
router.put('/:id/status', auth, c.setStatus);

module.exports = router;
