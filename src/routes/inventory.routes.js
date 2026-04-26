const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/inventory.controller');

router.use(auth);
router.get('/', c.getHistory);
router.get('/product/:productId', c.getHistory);
router.post('/entry', c.addEntry);
router.post('/exit', c.addExit);

module.exports = router;
