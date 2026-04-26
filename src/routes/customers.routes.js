const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/customers.controller');

router.use(auth);
router.get('/', c.getAll);
router.get('/birthdays', c.getBirthdays);
router.get('/lost', c.getLost);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
