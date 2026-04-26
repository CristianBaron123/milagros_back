const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/messages.controller');

router.use(auth);
router.get('/templates', c.getTemplates);
router.post('/templates', c.createTemplate);
router.post('/generate', c.generateMessage);
router.get('/scheduled', c.getScheduled);
router.post('/schedule', c.scheduleMessage);

module.exports = router;
