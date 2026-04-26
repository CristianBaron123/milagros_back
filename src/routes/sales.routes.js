const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/sales.controller');

router.use(auth);
router.get('/', c.getAll);
router.get('/daily-summary', c.getDailySummary);
router.post('/', c.create);

module.exports = router;
