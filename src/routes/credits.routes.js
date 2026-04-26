const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getAll, updateStatus, getSummary } = require('../controllers/credits.controller');

router.get('/',           authenticate, getAll);
router.get('/summary',    authenticate, getSummary);
router.patch('/:id/status', authenticate, updateStatus);

module.exports = router;
