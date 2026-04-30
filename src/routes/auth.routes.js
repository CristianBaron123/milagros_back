const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/auth.controller');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', auth, c.me);
router.get('/users', auth, c.listSellers);

module.exports = router;
