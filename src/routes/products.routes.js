const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/products.controller');

router.use(auth);
router.get('/', c.getAll);
router.get('/low-stock', c.getLowStock);
router.get('/slow-moving', c.getSlowMoving);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
