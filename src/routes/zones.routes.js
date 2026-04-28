const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/zones.controller');

router.use(auth);
router.get('/', c.getAll);
router.get('/analytics', c.getZoneAnalytics);
router.post('/', c.create);

router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
