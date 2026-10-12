const router = require('express').Router();
const auth = require('../middleware/auth');
const userAuth = require('../middleware/userAuth');
const limiter = require('../middleware/rateLimit');
const upload = require('../middleware/upload');
const c = require('../controllers/userController');

// ---- Web (mijoz) ----
router.post('/register', limiter, upload.single('avatar'), c.register);
router.post('/login', limiter, c.login);
router.get('/me', userAuth, c.me);
router.put('/me', userAuth, upload.single('avatar'), c.updateMe);
router.put('/password', userAuth, c.changePassword);

// ---- Admin ----
router.get('/', auth, c.listUsers);

module.exports = router;
