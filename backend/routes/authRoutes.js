const router = require('express').Router();
const limiter = require('../middleware/rateLimit');
const { login } = require('../controllers/authController');

router.post('/login', limiter, login);

module.exports = router;
