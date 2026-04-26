const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/notifications.controller');

router.use(auth);
router.get('/', c.getAll);
router.post('/generate', c.generateAlerts);
router.put('/read-all', c.markAllRead);
router.put('/:id/read', c.markRead);

module.exports = router;
